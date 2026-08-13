from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.core.config import settings
from app.models import models  # noqa: F401 ensures models are registered
from app.routers import auth, academics, people, attendance, results, fees, admissions, content, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.SCHOOL_NAME} API",
    description="Backend API powering the school website, syllabus tracker, and student/parent/teacher/admin portals.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(academics.router)
app.include_router(people.router)
app.include_router(attendance.router)
app.include_router(results.router)
app.include_router(fees.router)
app.include_router(admissions.router)
app.include_router(content.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "school": settings.SCHOOL_NAME,
        "school_code": settings.SCHOOL_CODE,
        "affiliation_no": settings.AFFILIATION_NO,
        "status": "API running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
