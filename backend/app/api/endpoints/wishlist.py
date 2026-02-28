from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Header
from sqlalchemy.ext.asyncio import AsyncSession
import shutil
import os
import uuid
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
import json
import secrets
import re
import sys
import asyncio
import random
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

from ...core.database import get_db
from ...models.wishlist import Wishlist, Gift, Contribution, User
from ...schemas.wishlist import (
    WishlistCreate, WishlistUpdate, WishlistResponse,
    GiftCreate, GiftUpdate, GiftResponse,
    ContributionCreate, ReserveGiftRequest
)
from ...core.auth import get_current_user
from ...core.socketio import emit_wishlist_update

router = APIRouter()

def generate_slug():
    return secrets.token_urlsafe(8)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join("uploads", filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/uploads/{filename}"}

async def format_wishlist_response(wishlist: Wishlist, db: AsyncSession, current_user_id: Optional[int] = None) -> WishlistResponse:
    res_gifts = await db.execute(select(Gift).where(Gift.wishlist_id == wishlist.id))
    gifts = res_gifts.scalars().all()
    is_owner = current_user_id == wishlist.owner_id
    gift_responses = []
    total_val = 0
    total_col = 0
    for g in gifts:
        total_val += g.price
        total_col += g.collected_amount
        progress = (g.collected_amount / g.price * 100) if g.price > 0 else 0
        gift_responses.append(GiftResponse(
            id=g.id, title=g.title, url=g.url, price=g.price,
            image_url=g.image_url, 
            is_reserved=False if is_owner else g.is_reserved,
            is_received=getattr(g, 'is_received', False),
            collected_amount=0.0 if is_owner else g.collected_amount,
            wishlist_id=g.wishlist_id,
            created_at=g.created_at, 
            progress_percentage=0.0 if is_owner else progress
        ))
    owner_username = "Anonymous"
    owner_email = ""
    if wishlist.owner_id:
        owner_res = await db.execute(select(User).where(User.id == wishlist.owner_id))
        owner = owner_res.scalar_one_or_none()
        if owner:
            owner_username = owner.username
            owner_email = owner.email
    completion = (total_col / total_val * 100) if total_val > 0 else 0
    return WishlistResponse(
        id=wishlist.id, title=wishlist.title, description=wishlist.description,
        theme=wishlist.theme, custom_theme_name=wishlist.custom_theme_name,
        created_at=wishlist.created_at, deadline=wishlist.deadline,
        is_archived=wishlist.is_archived, is_private=getattr(wishlist, 'is_private', False),
        public_slug=wishlist.public_slug, owner_id=wishlist.owner_id,
        owner_username=owner_username, owner_email=owner_email,
        gifts=gift_responses, total_value=total_val,
        total_collected=0.0 if is_owner else total_col,
        completion_percentage=0.0 if is_owner else completion
    )

async def get_browser_page(playwright):
    browser = await playwright.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    )
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        viewport={'width': 1280, 'height': 720}
    )
    page = await context.new_page()
    await stealth_async(page)
    async def block_aggressively(route):
        if route.request.resource_type in ["image", "media", "font"] and not ("wbbasket" in route.request.url or "ozone" in route.request.url):
            await route.abort()
        elif any(domain in route.request.url for domain in ["google-analytics", "yandex.ru", "doubleclick", "facebook"]):
            await route.abort()
        else:
            await route.continue_()
    await page.route("**/*", block_aggressively)
    return browser, page

@router.post("/scrape")
async def scrape_url(url: str):
    clean_url = url.split('?')[0] if '?' in url and ('ozon' in url or 'wildberries' in url) else url
    if not clean_url.startswith("http"): return {"title": "", "price": 0, "image_url": "", "url": clean_url, "success": False}
    try:
        async with async_playwright() as p:
            browser = None
            try:
                browser, page = await get_browser_page(p)
                await page.goto(clean_url, wait_until="commit", timeout=45000)
                page_title = await page.title()
                if "captcha" in page_title.lower() or "robot" in page_title.lower():
                    return {"title": "Защита от ботов", "price": 0, "image_url": "", "url": clean_url, "success": False}
                try:
                    await page.wait_for_selector("h1", timeout=15000)
                except: pass
                await asyncio.sleep(5)
                data = await page.evaluate("""() => {
                    const getMeta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content;
                    const title = document.querySelector('h1')?.innerText || document.title;
                    const priceMeta = getMeta('og:price:amount') || getMeta('product:price:amount') || getMeta('price');
                    const priceSelectors = ["[data-widget='webPrice']", "[data-widget='pdpPrice']", ".price-block__final-price", ".product-page__price", "span.ui-s5", "span.ui-s7", ".price", ".product-price", ".price__value", ".price-block__price", ".pdp-price__main"];
                    let priceRaw = priceMeta || "";
                    if (!priceRaw) {
                        for (const selector of priceSelectors) {
                            const elements = document.querySelectorAll(selector);
                            for (const el of elements) {
                                if (el && el.innerText && el.innerText.match(/\\d/)) { 
                                    priceRaw = el.innerText.split('\\n').find(l => l.match(/\\d/)) || "";
                                    if (priceRaw) break;
                                }
                            }
                            if (priceRaw) break;
                        }
                    }
                    const imgElements = Array.from(document.querySelectorAll('img'));
                    const allImgs = imgElements.map(img => ({
                        src: img.src || img.getAttribute('data-src') || img.getAttribute('srcset')?.split(' ')[0],
                        width: img.naturalWidth || img.width,
                        height: img.naturalHeight || img.height
                    })).filter(i => i.src && i.src.startsWith('http'));
                    let image = getMeta('og:image');
                    if (!image || image.includes('wb-og-win') || image.includes('logo')) {
                        const productImg = allImgs.find(img => (img.src.includes('wbbasket.ru') && img.src.includes('/images/')) || img.src.includes('ir.ozone.ru/s3/multimedia'));
                        if (productImg) image = productImg.src;
                    }
                    if (!image && allImgs.length > 0) image = allImgs[0].src;
                    return { title, priceRaw, image, htmlTitle: document.title };
                }""")
                raw_title = data['title'] or data['htmlTitle'] or ""
                price_str = str(data['priceRaw'] or "")
                clean_title = raw_title.split(' купить за')[0].split(' - купить в интернет-магазине')[0].split(' c доставкой')[0].split(' (')[0].strip()
                if not price_str or price_str == "0":
                    title_price_match = re.search(r'(?:купить за|цена) ([\d\s\xa0]+)', raw_title.lower())
                    if title_price_match: price_str = title_price_match.group(1)
                    else:
                        price_match = re.search(r'(\d[\d\s\xa0]*)(?:₽|тВ╜|руб|┬атВ╜|тАЙтВ╜|₸|╜)', raw_title + " " + price_str)
                        if price_match: price_str = price_match.group(1)
                price = 0
                if price_str:
                    nums = re.sub(r'[^\d]', '', price_str.replace('\xa0', '').replace('\u2009', ''))
                    if nums: price = float(nums)
                image = data['image']
                if image:
                    if image.startswith('//'): image = 'https:' + image
                    if 'wbbasket.ru' in image: image = re.sub(r'/(tm|c246x328|c516x688|minor)/', '/big/', image)
                return {"title": clean_title or "Товар", "price": price, "image_url": image, "url": clean_url, "success": bool(clean_title)}
            except Exception: return {"title": "Ошибка", "price": 0, "image_url": "", "url": clean_url, "success": False}
            finally:
                if browser: await browser.close()
    except Exception: return {"title": "Ошибка", "price": 0, "image_url": "", "url": clean_url, "success": False}

@router.post("/", response_model=WishlistResponse)
async def create_wishlist(wishlist_data: WishlistCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        new_wishlist = Wishlist(title=wishlist_data.title, description=wishlist_data.description, theme=wishlist_data.theme or "birthday", custom_theme_name=wishlist_data.custom_theme_name, deadline=None, is_private=wishlist_data.is_private or False, owner_id=current_user.id, public_slug=generate_slug())
        db.add(new_wishlist)
        await db.commit()
        await db.refresh(new_wishlist)
        return await format_wishlist_response(new_wishlist, db, current_user.id)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my", response_model=List[WishlistResponse])
async def get_my_wishlists(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Wishlist).where(Wishlist.owner_id == current_user.id))
    return [await format_wishlist_response(w, db, current_user.id) for w in result.scalars().all()]

@router.get("/public/all", response_model=List[WishlistResponse])
async def get_all_public_wishlists(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wishlist).where(Wishlist.is_private == False).where(Wishlist.is_archived == False).order_by(Wishlist.created_at.desc()).limit(50))
    return [await format_wishlist_response(w, db) for w in result.scalars().all()]

@router.get("/friends", response_model=List[WishlistResponse])
async def get_friends_wishlists(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ...models.wishlist import Friendship
    friends_query = select(Friendship).where(or_(and_(Friendship.user_id == current_user.id, Friendship.status == "accepted"), and_(Friendship.friend_id == current_user.id, Friendship.status == "accepted")))
    friends_result = await db.execute(friends_query)
    friendships = friends_result.scalars().all()
    friend_ids = [f.friend_id if f.user_id == current_user.id else f.user_id for f in friendships]
    if not friend_ids: return []
    result = await db.execute(select(Wishlist).where(Wishlist.owner_id.in_(friend_ids)))
    return [await format_wishlist_response(w, db, current_user.id) for w in result.scalars().all()]

@router.get("/public/{slug}", response_model=WishlistResponse)
async def get_public_wishlist(slug: str, db: AsyncSession = Depends(get_db), authorization: Optional[str] = Header(None)):
    current_user_id = None
    if authorization:
        try:
            from ...core.auth import get_current_user_from_token
            user = await get_current_user_from_token(authorization, db)
            if user: current_user_id = user.id
        except: pass
    result = await db.execute(select(Wishlist).where(Wishlist.public_slug == slug))
    wishlist = result.scalar_one_or_none()
    if not wishlist: raise HTTPException(status_code=404, detail="Not found")
    return await format_wishlist_response(wishlist, db, current_user_id)

@router.get("/{wishlist_id}", response_model=WishlistResponse)
async def get_wishlist(wishlist_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id))
    wishlist = result.scalar_one_or_none()
    if not wishlist or wishlist.owner_id != current_user.id: raise HTTPException(status_code=404, detail="Not found")
    return await format_wishlist_response(wishlist, db, current_user.id)

@router.put("/{wishlist_id}", response_model=WishlistResponse)
async def update_wishlist(wishlist_id: int, data: WishlistUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id))
    wishlist = result.scalar_one_or_none()
    if not wishlist or wishlist.owner_id != current_user.id: raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.dict(exclude_unset=True).items(): setattr(wishlist, key, value)
    await db.commit()
    await db.refresh(wishlist)
    return await format_wishlist_response(wishlist, db, current_user.id)

@router.delete("/{wishlist_id}")
async def delete_wishlist(wishlist_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id))
    wishlist = result.scalar_one_or_none()
    if not wishlist or wishlist.owner_id != current_user.id: raise HTTPException(status_code=404, detail="Not found")
    await db.delete(wishlist)
    await db.commit()
    return {"status": "deleted"}

@router.post("/{wishlist_id}/gifts", response_model=GiftResponse)
async def add_gift(wishlist_id: int, data: GiftCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id))
    wishlist = result.scalar_one_or_none()
    if not wishlist or wishlist.owner_id != current_user.id: raise HTTPException(status_code=404, detail="Not found")
    gift = Gift(**data.dict())
    db.add(gift)
    await db.commit()
    await db.refresh(gift)
    return GiftResponse(id=gift.id, title=gift.title, url=gift.url, price=gift.price, image_url=gift.image_url, is_reserved=gift.is_reserved, collected_amount=gift.collected_amount, wishlist_id=gift.wishlist_id, created_at=gift.created_at, progress_percentage=(gift.collected_amount / gift.price * 100) if gift.price > 0 else 0)

@router.put("/gifts/{gift_id}", response_model=GiftResponse)
async def update_gift(gift_id: int, data: GiftUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Gift).where(Gift.id == gift_id))
    gift = result.scalar_one_or_none()
    if not gift: raise HTTPException(status_code=404, detail="Gift not found")
    wl = await db.get(Wishlist, gift.wishlist_id)
    if wl.owner_id != current_user.id: raise HTTPException(status_code=403, detail="Forbidden")
    for key, value in data.dict(exclude_unset=True).items(): setattr(gift, key, value)
    await db.commit()
    await db.refresh(gift)
    return GiftResponse(id=gift.id, title=gift.title, url=gift.url, price=gift.price, image_url=gift.image_url, is_reserved=gift.is_reserved, collected_amount=gift.collected_amount, wishlist_id=gift.wishlist_id, created_at=gift.created_at, progress_percentage=(gift.collected_amount / gift.price * 100) if gift.price > 0 else 0)

@router.delete("/gifts/{gift_id}")
async def delete_gift(gift_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Gift).where(Gift.id == gift_id))
    gift = result.scalar_one_or_none()
    if not gift: raise HTTPException(status_code=404, detail="Not found")
    wl = await db.get(Wishlist, gift.wishlist_id)
    if wl.owner_id != current_user.id: raise HTTPException(status_code=403, detail="Forbidden")
    if gift.collected_amount > 0:
        raise HTTPException(status_code=400, detail="Нельзя удалить подарок со сборами")
    await db.delete(gift)
    await db.commit()
    return {"status": "deleted"}

@router.post("/gifts/{gift_id}/reserve")
async def reserve_gift(gift_id: int, data: ReserveGiftRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Gift).where(Gift.id == gift_id))
    gift = result.scalar_one_or_none()
    if not gift or gift.is_reserved: raise HTTPException(status_code=400, detail="Error")
    gift.is_reserved = True
    gift.reserved_by_email = data.email
    await db.commit()
    wl = await db.get(Wishlist, gift.wishlist_id)
    await emit_wishlist_update(wl.public_slug, {"type": "gift_reserved", "gift_id": gift_id})
    return {"status": "reserved"}

@router.post("/gifts/{gift_id}/contribute")
async def add_contribution(gift_id: int, data: ContributionCreate, db: AsyncSession = Depends(get_db)):
    gift = await db.get(Gift, gift_id)
    if not gift: raise HTTPException(status_code=404)
    remaining = gift.price - gift.collected_amount
    if gift.price > 0 and data.amount > (remaining + 0.01):
        raise HTTPException(status_code=400, detail=f"Сумма превышает остаток {remaining}₽")
    contrib = Contribution(gift_id=gift_id, amount=data.amount, contributor_email=data.contributor_email)
    db.add(contrib)
    gift.collected_amount += data.amount
    if gift.collected_amount >= (gift.price - 0.01): gift.is_reserved = True
    await db.commit()
    wl = await db.get(Wishlist, gift.wishlist_id)
    await emit_wishlist_update(wl.public_slug, {"type": "contribution_added", "gift_id": gift_id, "is_complete": gift.is_reserved})
    return {"status": "success", "is_complete": gift.is_reserved}
