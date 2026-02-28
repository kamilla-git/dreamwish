from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base

class WishlistTheme(str, enum.Enum):
    birthday = "birthday"
    new_year = "new_year"
    wedding = "wedding"
    graduation = "graduation"
    housewarming = "housewarming"
    anniversary = "anniversary"
    baby_shower = "baby_shower"
    valentine = "valentine"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)  # Юзернейм для поиска
    hashed_password = Column(String)
    nickname = Column(String, nullable=True)  # Отображаемое имя
    avatar_url = Column(String, nullable=True)  # Аватар
    created_at = Column(DateTime, default=datetime.utcnow)
    wishlists = relationship("Wishlist", back_populates="owner", cascade="all, delete-orphan")
    
    # Друзья (many-to-many через таблицу friendships)
    friendships_sent = relationship("Friendship", foreign_keys="Friendship.user_id", back_populates="user")
    friendships_received = relationship("Friendship", foreign_keys="Friendship.friend_id", back_populates="friend")

class Wishlist(Base):
    __tablename__ = "wishlists"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    theme = Column(String, default="birthday")
    custom_theme_name = Column(String, nullable=True)  # Для кастомной темы
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=True)
    is_archived = Column(Boolean, default=False)
    is_private = Column(Boolean, default=False)  # Приватный (только для друзей)
    public_slug = Column(String, unique=True, index=True, nullable=True)
    
    owner = relationship("User", back_populates="wishlists")
    gifts = relationship("Gift", back_populates="wishlist", cascade="all, delete-orphan")

class Gift(Base):
    __tablename__ = "gifts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    url = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    image_url = Column(String, nullable=True)
    is_reserved = Column(Boolean, default=False)
    reserved_by_email = Column(String, nullable=True)
    reserved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    collected_amount = Column(Float, default=0.0)
    is_received = Column(Boolean, default=False)  # Статус "получен"
    allow_funding = Column(Boolean, default=True)  # Разрешить сбор средств
    wishlist_id = Column(Integer, ForeignKey("wishlists.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    wishlist = relationship("Wishlist", back_populates="gifts")
    contributions = relationship("Contribution", back_populates="gift", cascade="all, delete-orphan")

class Contribution(Base):
    __tablename__ = "contributions"
    id = Column(Integer, primary_key=True, index=True)
    gift_id = Column(Integer, ForeignKey("gifts.id"))
    amount = Column(Float)
    contributor_email = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gift = relationship("Gift", back_populates="contributions")

class Friendship(Base):
    __tablename__ = "friendships"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    friend_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="friendships_sent")
    friend = relationship("User", foreign_keys=[friend_id], back_populates="friendships_received")
