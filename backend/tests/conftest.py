import uuid
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth import create_access_token
from app.database import Base, get_db
from app.main import app
from app.models.user import User

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

ALICE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
BOB_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        session.add_all([
            User(id=ALICE_ID, email="alice@test.com", display_name="Alice", password_hash="x"),
            User(id=BOB_ID, email="bob@test.com", display_name="Bob", password_hash="x"),
        ])
        await session.commit()
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def alice_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(ALICE_ID)}"}


@pytest.fixture
def bob_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(BOB_ID)}"}
