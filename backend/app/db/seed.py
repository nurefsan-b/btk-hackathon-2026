import asyncio
import uuid
from decimal import Decimal
from datetime import UTC, datetime, timedelta

from app.db.base import async_session_factory
from app.db.models.user import User
from app.db.models.transaction import BankTransaction
from app.db.models.saving_entry import SavingEntry
from app.db.models.trade import Trade, TradeAction, TradeStatus
from app.core.security import get_password_hash

async def run_seed():
    async with async_session_factory() as session:
        print("Seeding demo data...")
        
        # 1. Create Demo User
        demo_user_id = str(uuid.uuid4())
        demo_user = User(
            id=demo_user_id,
            email="demo@microfon.com",
            full_name="MicroFon Demo",
            hashed_password=get_password_hash("demo123"),
            is_active=True
        )
        session.add(demo_user)
        
        # 2. Add Transactions
        now = datetime.now(UTC)
        transactions = [
            BankTransaction(id=str(uuid.uuid4()), user_id=demo_user_id, amount=Decimal("14.50"), round_up_diff=Decimal("5.50"), merchant="Starbucks", description="Coffee", is_processed=True, created_at=now - timedelta(days=2)),
            BankTransaction(id=str(uuid.uuid4()), user_id=demo_user_id, amount=Decimal("32.25"), round_up_diff=Decimal("7.75"), merchant="Migros", description="Groceries", is_processed=True, created_at=now - timedelta(days=1)),
            BankTransaction(id=str(uuid.uuid4()), user_id=demo_user_id, amount=Decimal("123.10"), round_up_diff=Decimal("6.90"), merchant="Netflix", description="Subscription", is_processed=True, created_at=now - timedelta(hours=5)),
            BankTransaction(id=str(uuid.uuid4()), user_id=demo_user_id, amount=Decimal("8.50"), round_up_diff=Decimal("1.50"), merchant="Metro", description="Transport", is_processed=True, created_at=now - timedelta(hours=2)),
            BankTransaction(id=str(uuid.uuid4()), user_id=demo_user_id, amount=Decimal("110.00"), round_up_diff=Decimal("10.00"), merchant="Shell", description="Fuel", is_processed=True, created_at=now - timedelta(hours=1)),
        ]
        session.add_all(transactions)
        
        # 3. Add Saving Entries (Pending pool)
        saving = SavingEntry(
            id=str(uuid.uuid4()),
            user_id=demo_user_id,
            amount=Decimal("31.65"),
            status="pending",
            source_tx_id=transactions[-1].id,
            created_at=now - timedelta(hours=1)
        )
        session.add(saving)
        
        # 4. Add a Paper Trade (Historical)
        trade = Trade(
            id=str(uuid.uuid4()),
            user_id=demo_user_id,
            asset="BIST100",
            action=TradeAction.BUY,
            amount_invested=Decimal("100.00"),
            execution_price=Decimal("9500.50"),
            status=TradeStatus.EXECUTED,
            confidence_score=Decimal("0.85"),
            reasoning="Strong positive market sentiment detected in recent news. Paper trade executed for BIST100.",
            profit_loss=Decimal("12.50"),
            created_at=now - timedelta(days=5)
        )
        session.add(trade)
        
        await session.commit()
        print("=========================================")
        print("✅ Demo data seeded successfully!")
        print("Login: demo@microfon.com")
        print("Password: demo123")
        print("=========================================")

if __name__ == "__main__":
    asyncio.run(run_seed())
