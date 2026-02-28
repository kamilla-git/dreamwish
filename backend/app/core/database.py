from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./wishlist.db")

# Для PostgreSQL заменяем postgres:// на postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Настройки для SQLite и PostgreSQL
engine_kwargs = {
    "echo": False,  # Отключаем логи для продакшена
}

if "sqlite" in DATABASE_URL:
    # SQLite не поддерживает pool_size и max_overflow
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL поддерживает пулы соединений
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
