from __future__ import annotations

import asyncio
import random
import time
import sys
import os
from datetime import datetime

import httpx

# ─── Config ───────────────────────────────────────────────────────────────────
BASE_URL = os.getenv("API_URL", "http://localhost:80")
INTERVAL_SECONDS = float(os.getenv("SIM_INTERVAL", "3"))
USER_IDS = ["user_ali", "user_ayse", "user_mehmet", "user_fatma", "user_demo"]

# Realistic Turkish POS transactions
MERCHANTS = [
    ("Migros", 15.0, 250.0),
    ("A101", 20.0, 180.0),
    ("Şok Market", 12.0, 120.0),
    ("BİM", 10.0, 100.0),
    ("Starbucks", 55.0, 120.0),
    ("McDonald's", 90.0, 220.0),
    ("Getir", 45.0, 300.0),
    ("Trendyol", 100.0, 2000.0),
    ("Hepsiburada", 150.0, 3000.0),
    ("Akaryakıt", 300.0, 1500.0),
    ("Eczane", 25.0, 200.0),
    ("Netflix TR", 119.99, 119.99),
    ("Spotify TR", 39.99, 39.99),
    ("İstanbul Ulaşım", 15.6, 15.6),
    ("Vapiano", 180.0, 400.0),
    ("Teknosa", 250.0, 5000.0),
]

# ANSI Colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"
DIM = "\033[2m"


def banner() -> None:
    print(f"""
{BOLD}{CYAN}╔══════════════════════════════════════════════════════════╗
║       BTK Hackathon 2026 — Transaction Simulator         ║
║       Micro-savings Platform Mock POS Generator          ║
╚══════════════════════════════════════════════════════════╝{RESET}
{DIM}API: {BASE_URL}  |  Interval: {INTERVAL_SECONDS}s  |  Users: {len(USER_IDS)}{RESET}
""")


def pick_transaction() -> tuple[str, str, float]:
    user_id = random.choice(USER_IDS)
    merchant, min_amt, max_amt = random.choice(MERCHANTS)
    # Generate realistic amount (not a round number)
    amount = round(random.uniform(min_amt, max_amt) * random.uniform(0.85, 1.15), 2)
    # Make sure it's not already a round 10
    if amount % 10 == 0:
        amount += round(random.uniform(1.0, 9.0), 2)
    return user_id, merchant, amount


async def send_transaction(client: httpx.AsyncClient, count: int) -> None:
    user_id, merchant, amount = pick_transaction()
    payload = {
        "user_id": user_id,
        "amount": amount,
        "merchant": merchant,
        "description": f"POS - {merchant}",
        "currency": "TRY",
    }

    ts = datetime.now().strftime("%H:%M:%S")
    try:
        response = await client.post(
            f"{BASE_URL}/api/v1/transactions/",
            json=payload,
            timeout=5.0,
        )
        response.raise_for_status()
        data = response.json()

        diff = data["round_up_diff"]
        rounded = data["rounded_amount"]
        diff_color = GREEN if diff > 0 else DIM

        print(
            f"{DIM}[{ts}]{RESET} #{count:>4}  "
            f"{BOLD}{merchant:<20}{RESET}  "
            f"{CYAN}{user_id:<15}{RESET}  "
            f"₺{amount:>8.2f}  →  "
            f"₺{rounded:>8.2f}  "
            f"{diff_color}(+₺{diff:.2f} saved){RESET}"
        )

    except httpx.ConnectError:
        print(f"{RED}[{ts}] ✗ Connection refused — is the backend running? ({BASE_URL}){RESET}")
        print(f"{DIM}  Hint: run `make up` or `docker compose up -d`{RESET}")
    except httpx.HTTPStatusError as e:
        print(f"{RED}[{ts}] ✗ HTTP {e.response.status_code}: {e.response.text[:80]}{RESET}")
    except Exception as e:
        print(f"{RED}[{ts}] ✗ Unexpected error: {e}{RESET}")


async def run_simulator() -> None:
    banner()
    count = 0
    async with httpx.AsyncClient() as client:
        # Warm-up health check
        try:
            r = await client.get(f"{BASE_URL}/health", timeout=3.0)
            if r.status_code == 200:
                print(f"{GREEN}✓ Backend healthy — starting simulation...{RESET}\n")
                print(
                    f"{'Time':<10} {'#':>5}  {'Merchant':<20}  {'User':<15}  "
                    f"{'Amount':>10}     {'Rounded':>10}  {'Savings'}"
                )
                print("─" * 85)
        except Exception:
            print(f"{YELLOW}⚠ Backend not reachable at {BASE_URL} — retrying anyway...{RESET}\n")

        try:
            while True:
                count += 1
                await send_transaction(client, count)
                await asyncio.sleep(INTERVAL_SECONDS)
        except KeyboardInterrupt:
            print(f"\n{YELLOW}Simulation stopped after {count} transactions.{RESET}")


if __name__ == "__main__":
    # Allow overriding via CLI args: python trigger_transactions.py --interval 1 --url http://api.localhost
    import argparse

    parser = argparse.ArgumentParser(description="BTK Hackathon Transaction Simulator")
    parser.add_argument("--interval", type=float, default=INTERVAL_SECONDS, help="Seconds between transactions")
    parser.add_argument("--url", type=str, default=BASE_URL, help="API base URL")
    parser.add_argument("--users", type=str, default=",".join(USER_IDS), help="Comma-separated user IDs")
    args = parser.parse_args()

    INTERVAL_SECONDS = args.interval
    BASE_URL = args.url
    USER_IDS = args.users.split(",")

    asyncio.run(run_simulator())
