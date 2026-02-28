import socketio
from fastapi import FastAPI

# Создаем Socket.IO сервер
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

socket_app = socketio.ASGIApp(sio)

def init_socketio(app: FastAPI):
    """Инициализация Socket.IO"""
    app.mount("/socket.io", socket_app)
    return sio

@sio.event
async def connect(sid, environ):
    print(f"✅ Socket.IO: Client connected {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Socket.IO: Client disconnected {sid}")

@sio.event
async def join_wishlist(sid, wishlist_slug):
    """Подключение к комнате вишлиста"""
    await sio.enter_room(sid, f"wishlist_{wishlist_slug}")
    print(f"🔗 Socket.IO: Client {sid} joined wishlist_{wishlist_slug}")

@sio.event
async def leave_wishlist(sid, wishlist_slug):
    """Отключение от комнаты вишлиста"""
    await sio.leave_room(sid, f"wishlist_{wishlist_slug}")
    print(f"🔌 Socket.IO: Client {sid} left wishlist_{wishlist_slug}")

async def emit_wishlist_update(wishlist_slug: str, data: dict):
    """Отправка обновления всем в комнате"""
    print(f"📡 Socket.IO: Emitting update to wishlist_{wishlist_slug}: {data}")
    await sio.emit('wishlist_updated', data, room=f"wishlist_{wishlist_slug}")
