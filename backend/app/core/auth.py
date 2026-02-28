from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os

# Константы из .env
SECRET_KEY = os.getenv("SECRET_KEY", "DREAMWISH_ULTRA_SECRET_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 часа

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user_from_token(token_string: str, db: AsyncSession):
    """Вспомогательная функция для получения юзера из сырой строки токена (Bearer ...)"""
    if not token_string or not token_string.startswith("Bearer "):
        return None
    
    token = token_string.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: return None
        
        from ..models.wishlist import User
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    except:
        return None

def get_current_user_dependency():
    """Фабрика для создания зависимости get_current_user"""
    from .database import get_db
    from ..models.wishlist import User
    
    async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: AsyncSession = Depends(get_db)
    ):
        """Получение текущего пользователя из JWT токена"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не удалось проверить учетные данные",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            token = credentials.credentials
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user is None:
            raise credentials_exception
        
        return user
    
    return get_current_user

# Создаем зависимость
get_current_user = get_current_user_dependency()
