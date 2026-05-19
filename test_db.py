import asyncio
from sqlalchemy import select
from app.db.session import async_session_maker
from app.db.models.trade import Trade

async def main():
    async with async_session_maker() as session:
        result = await session.execute(select(Trade).limit(1))
        trade = result.scalar_one_or_none()
        print(trade)

asyncio.run(main())
