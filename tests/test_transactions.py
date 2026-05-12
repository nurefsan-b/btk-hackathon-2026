from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient

from app.repositories.saving_entry_repo import SavingEntryRepository
from app.services.saving_service import SavingService
from app.services.transaction_service import TransactionService


class TestRoundUpLogic:
    """Unit tests for the core round-up business logic."""

    def test_normal_round_up(self):
        rounded, diff = TransactionService.calculate_round_up(87.3)
        assert rounded == 90.0
        assert diff == pytest.approx(2.7, abs=0.01)

    def test_already_round(self):
        rounded, diff = TransactionService.calculate_round_up(100.0)
        assert rounded == 100.0
        assert diff == 0.0

    def test_one_over_base(self):
        rounded, diff = TransactionService.calculate_round_up(91.0)
        assert rounded == 100.0
        assert diff == pytest.approx(9.0, abs=0.01)

    def test_small_amount(self):
        rounded, diff = TransactionService.calculate_round_up(3.5)
        assert rounded == 10.0
        assert diff == pytest.approx(6.5, abs=0.01)


@pytest.mark.asyncio
class TestTransactionAPI:
    async def test_create_transaction(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/transactions/",
            json={
                "user_id": "test_user_1",
                "amount": 87.3,
                "merchant": "Migros",
                "currency": "TRY",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["user_id"] == "test_user_1"
        assert data["amount"] == pytest.approx(87.3, abs=0.01)
        assert data["round_up_diff"] == pytest.approx(2.7, abs=0.01)
        assert data["rounded_amount"] == pytest.approx(90.0, abs=0.01)

    async def test_list_transactions(self, client: AsyncClient):
        # Create one first
        await client.post(
            "/api/v1/transactions/",
            json={"user_id": "test_user_2", "amount": 55.0},
        )
        response = await client.get("/api/v1/transactions/test_user_2")
        assert response.status_code == 200
        assert len(response.json()) >= 1

    async def test_round_up_persists_in_savings_summary(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/transactions/",
            json={
                "user_id": "test_user_persist",
                "amount": 135.0,
                "merchant": "Starbucks",
                "currency": "TRY",
            },
        )
        assert response.status_code == 201
        assert response.json()["round_up_diff"] == pytest.approx(5.0, abs=0.01)

        summary = await client.get("/api/v1/savings/test_user_persist")

        assert summary.status_code == 200
        assert summary.json()["total_pending"] == pytest.approx(5.0, abs=0.01)

    async def test_investment_debit_reduces_pending_with_signed_entry(self, db_session):
        repo = SavingEntryRepository(db_session)
        await repo.create_round_up(
            user_id="test_user_signed_ledger",
            amount=8.0,
            currency="TRY",
            transaction_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        )
        await repo.create_investment_debit(
            user_id="test_user_signed_ledger",
            amount=3.0,
            currency="TRY",
        )

        summary = await SavingService(db_session).get_user_summary("test_user_signed_ledger")

        assert summary.total_pending == pytest.approx(5.0, abs=0.01)
        assert summary.total_invested == pytest.approx(3.0, abs=0.01)

    async def test_health_check(self, client: AsyncClient):
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
