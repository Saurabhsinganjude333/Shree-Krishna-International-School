from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.models import GalleryImage, Event, BlogPost, ContactMessage, User
from app.schemas.schemas import (
    GalleryImageCreate, GalleryImageOut, EventCreate, EventOut,
    BlogPostCreate, BlogPostOut, ContactMessageCreate, ContactMessageOut,
)

router = APIRouter(prefix="/api", tags=["Content"])


# ---------- Gallery ----------
@router.get("/gallery", response_model=List[GalleryImageOut])
def list_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryImage).order_by(GalleryImage.created_at.desc()).all()


@router.post("/gallery", response_model=GalleryImageOut)
def add_gallery_image(payload: GalleryImageCreate, db: Session = Depends(get_db),
                       _: User = Depends(require_roles(["admin"]))):
    img = GalleryImage(**payload.model_dump())
    db.add(img)
    db.commit()
    db.refresh(img)
    return img


@router.delete("/gallery/{image_id}")
def delete_gallery_image(image_id: int, db: Session = Depends(get_db),
                          _: User = Depends(require_roles(["admin"]))):
    img = db.query(GalleryImage).filter(GalleryImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(img)
    db.commit()
    return {"detail": "Image deleted"}


# ---------- Events ----------
@router.get("/events", response_model=List[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date.asc()).all()


@router.post("/events", response_model=EventOut)
def create_event(payload: EventCreate, db: Session = Depends(get_db),
                  _: User = Depends(require_roles(["admin", "teacher"]))):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db),
                  _: User = Depends(require_roles(["admin", "teacher"]))):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"detail": "Event deleted"}


# ---------- Blog / News ----------
@router.get("/blog", response_model=List[BlogPostOut])
def list_blog_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.published_at.desc()).all()


@router.get("/blog/{slug}", response_model=BlogPostOut)
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/blog", response_model=BlogPostOut)
def create_blog_post(payload: BlogPostCreate, db: Session = Depends(get_db),
                      _: User = Depends(require_roles(["admin", "teacher"]))):
    if db.query(BlogPost).filter(BlogPost.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    post = BlogPost(**payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


# ---------- Contact ----------
@router.post("/contact", response_model=ContactMessageOut)
def submit_contact_message(payload: ContactMessageCreate, db: Session = Depends(get_db)):
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/contact", response_model=List[ContactMessageOut])
def list_contact_messages(db: Session = Depends(get_db),
                           _: User = Depends(require_roles(["admin"]))):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
