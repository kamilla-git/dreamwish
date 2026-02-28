from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...core.database import get_db
from ...core.auth import verify_password, get_password_hash, create_access_token, get_current_user
from ...models.wishlist import User, Wishlist
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str | None = None
    nickname: str | None = None
    avatar_url: str | None = None
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username.lower(),
        hashed_password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.patch("/update", response_model=UserResponse)
async def update_profile(
    update_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление данных профиля"""
    if "username" in update_data:
        new_username = update_data["username"].lower()
        if new_username != current_user.username:
            existing = await db.execute(select(User).where(User.username == new_username))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Username уже занят")
            current_user.username = new_username
            
    if "nickname" in update_data:
        current_user.nickname = update_data["nickname"]
    if "avatar_url" in update_data:
        current_user.avatar_url = update_data["avatar_url"]
        
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user
