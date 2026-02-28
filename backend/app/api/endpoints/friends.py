from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import List
from pydantic import BaseModel

from ...core.database import get_db
from ...models.wishlist import User, Friendship
from ...core.auth import get_current_user

router = APIRouter()

class UserSearchResponse(BaseModel):
    id: int
    username: str
    nickname: str | None
    avatar_url: str | None
    is_friend: bool = False
    
    class Config:
        from_attributes = True

class FriendshipResponse(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    created_at: str
    friend: UserSearchResponse | None = None
    
    class Config:
        from_attributes = True

@router.get("/search")
async def search_users(
    query: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Поиск пользователей по username или email"""
    if len(query) < 2:
        raise HTTPException(status_code=400, detail="Минимум 2 символа для поиска")
    
    result = await db.execute(
        select(User).where(
            or_(
                User.username.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%")
            )
        ).where(User.id != current_user.id).limit(10)
    )
    users = result.scalars().all()
    
    # Проверяем кто уже друг
    friends_result = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.user_id == current_user.id, Friendship.status == "accepted"),
                and_(Friendship.friend_id == current_user.id, Friendship.status == "accepted")
            )
        )
    )
    friendships = friends_result.scalars().all()
    friend_ids = set()
    for f in friendships:
        friend_ids.add(f.friend_id if f.user_id == current_user.id else f.user_id)
    
    return [
        UserSearchResponse(
            id=u.id,
            username=u.username or u.email.split('@')[0],
            nickname=u.nickname,
            avatar_url=u.avatar_url,
            is_friend=u.id in friend_ids
        )
        for u in users
    ]

@router.post("/request/{user_id}")
async def send_friend_request(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отправить запрос в друзья"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя добавить себя в друзья")
    
    # Проверяем существует ли уже запрос
    existing = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.user_id == current_user.id, Friendship.friend_id == user_id),
                and_(Friendship.user_id == user_id, Friendship.friend_id == current_user.id)
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Запрос уже существует")
    
    friendship = Friendship(
        user_id=current_user.id,
        friend_id=user_id,
        status="pending"
    )
    db.add(friendship)
    await db.commit()
    
    return {"status": "sent", "message": "Запрос отправлен"}

@router.get("/requests")
async def get_friend_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить входящие запросы в друзья"""
    result = await db.execute(
        select(Friendship).where(
            Friendship.friend_id == current_user.id,
            Friendship.status == "pending"
        )
    )
    requests = result.scalars().all()
    
    response = []
    for req in requests:
        user_result = await db.execute(select(User).where(User.id == req.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            response.append({
                "id": req.id,
                "user": UserSearchResponse(
                    id=user.id,
                    username=user.username or user.email.split('@')[0],
                    nickname=user.nickname,
                    avatar_url=user.avatar_url,
                    is_friend=False
                ),
                "created_at": req.created_at.isoformat()
            })
    
    return response

@router.post("/accept/{friendship_id}")
async def accept_friend_request(
    friendship_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Принять запрос в друзья"""
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == friendship_id,
            Friendship.friend_id == current_user.id
        )
    )
    friendship = result.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Запрос не найден")
    
    friendship.status = "accepted"
    await db.commit()
    
    return {"status": "accepted", "message": "Теперь вы друзья!"}

@router.delete("/reject/{friendship_id}")
async def reject_friend_request(
    friendship_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отклонить запрос в друзья"""
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == friendship_id,
            Friendship.friend_id == current_user.id
        )
    )
    friendship = result.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Запрос не найден")
    
    await db.delete(friendship)
    await db.commit()
    
    return {"status": "rejected"}

@router.get("/list")
async def get_friends_list(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить список друзей"""
    result = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.user_id == current_user.id, Friendship.status == "accepted"),
                and_(Friendship.friend_id == current_user.id, Friendship.status == "accepted")
            )
        )
    )
    friendships = result.scalars().all()
    
    friends = []
    for f in friendships:
        friend_id = f.friend_id if f.user_id == current_user.id else f.user_id
        user_result = await db.execute(select(User).where(User.id == friend_id))
        user = user_result.scalar_one_or_none()
        if user:
            friends.append(UserSearchResponse(
                id=user.id,
                username=user.username or user.email.split('@')[0],
                nickname=user.nickname,
                avatar_url=user.avatar_url,
                is_friend=True
            ))
    
    return friends
