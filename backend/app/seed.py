import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.models.user import User

DEMO_PASSWORD = "Test1234"

SEED_USERS = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "email": "alice@test.com",
        "display_name": "Alice",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000002"),
        "email": "bob@test.com",
        "display_name": "Bob",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
        "email": "testerson@test.com",
        "display_name": "Tester",
    },
]


async def seed_users(session: AsyncSession) -> None:
    result = await session.execute(select(User).limit(1))
    if result.scalar_one_or_none() is not None:
        return

    pw = hash_password(DEMO_PASSWORD)
    for data in SEED_USERS:
        session.add(User(**data, password_hash=pw))
    await session.commit()
