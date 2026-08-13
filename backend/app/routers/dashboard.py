from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.models import (
    Student, Teacher, SchoolClass, Admission, Chapter, FeeRecord, Event, User
)
from app.schemas.schemas import AdminDashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/admin", response_model=AdminDashboardStats)
def admin_dashboard(db: Session = Depends(get_db), _: User = Depends(require_roles(["admin"]))):
    total_students = db.query(Student).count()
    total_teachers = db.query(Teacher).count()
    total_classes = db.query(SchoolClass).count()
    pending_admissions = db.query(Admission).filter(Admission.status == "pending").count()

    chapters = db.query(Chapter).all()
    avg_syllabus = round(sum(c.completion_pct for c in chapters) / len(chapters), 1) if chapters else 0.0

    fee_records = db.query(FeeRecord).all()
    total_due = sum(f.amount_due for f in fee_records)
    total_paid = sum(f.amount_paid for f in fee_records)
    fee_pct = round((total_paid / total_due) * 100, 1) if total_due else 0.0

    upcoming_events = db.query(Event).filter(Event.event_date >= date.today()).count()

    return AdminDashboardStats(
        total_students=total_students,
        total_teachers=total_teachers,
        total_classes=total_classes,
        pending_admissions=pending_admissions,
        avg_syllabus_completion=avg_syllabus,
        fee_collected_pct=fee_pct,
        upcoming_events=upcoming_events,
    )
