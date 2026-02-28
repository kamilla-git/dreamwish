import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Fix for Playwright on Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from .api.endpoints import auth, wishlist, friends
from .core.database import engine, Base
from .core.socketio import init_socketio
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="DreamWish API")

# Ensure uploads directory exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Mount static files for image uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация Socket.IO для реалтайм обновлений
init_socketio(app)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("🚀 DreamWish API started with Socket.IO support")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(wishlist.router, prefix="/wishlists", tags=["wishlists"])
app.include_router(friends.router, prefix="/friends", tags=["friends"])

@app.get("/")
async def root():
    return {"status": "ok", "realtime": "enabled"}
