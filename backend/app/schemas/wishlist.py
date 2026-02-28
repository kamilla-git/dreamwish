from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class GiftBase(BaseModel):
    title: str
    url: Optional[str] = None
    price: float = 0.0
    image_url: Optional[str] = None

class GiftCreate(GiftBase):
    wishlist_id: int

class GiftUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    url: Optional[str] = None

class GiftResponse(GiftBase):
    id: int
    is_reserved: bool
    is_received: bool = False
    collected_amount: float
    wishlist_id: int
    created_at: datetime
    progress_percentage: float = 0.0
    
    class Config:
        from_attributes = True

class ContributionCreate(BaseModel):
    amount: float
    contributor_email: Optional[str] = None
    message: Optional[str] = None

class ContributionResponse(BaseModel):
    id: int
    amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class WishlistCreate(BaseModel):
    title: str
    description: Optional[str] = None
    theme: Optional[str] = "birthday"
    custom_theme_name: Optional[str] = None
    deadline: Optional[str] = None
    is_private: Optional[bool] = False

class WishlistUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme: Optional[str] = None
    deadline: Optional[datetime] = None

class WishlistResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    theme: str
    custom_theme_name: Optional[str] = None
    created_at: datetime
    deadline: Optional[datetime]
    is_archived: bool
    is_private: bool = False
    public_slug: Optional[str]
    owner_id: int
    owner_username: Optional[str] = None
    owner_email: Optional[str] = None
    gifts: List[GiftResponse] = []
    total_value: float = 0.0
    total_collected: float = 0.0
    completion_percentage: float = 0.0
    
    class Config:
        from_attributes = True

class ReserveGiftRequest(BaseModel):
    email: Optional[str] = None
