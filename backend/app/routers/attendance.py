from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.models import Attendance, Student, User
from app.schemas.schemas import (
    AttendanceCreate, AttendanceOut, AttendanceBulkCreate, AttendanceSummary,
)

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/bulk", response_model=List[AttendanceOut])
def mark_bulk_attendance(payload: AttendanceBulkCreate, db: Session = Depends(get_db),
                          _: User = Depends(require_roles(["admin", "teacher"]))):
    """Teacher marks attendance for a whole class in one go."""
    created = []
    for entry in payload.entries:
        existing = db.query(Attendance).filter(
            Attendance.student_id == entry.student_id, Attendance.date == payload.date
        ).first()
        if existing:
            existing.status = entry.status
            existing.remarks = entry.remarks
            created.append(existing)
        else:
            record = Attendance(student_id=entry.student_id, date=payload.date,
                                 status=entry.status, remarks=entry.remarks)
            db.add(record)
            created.append(record)
    db.commit()
    for r in created:
        db.refresh(r)
    return created


@router.get("/student/{student_id}", response_model=List[AttendanceOut])
def get_student_attendance(student_id: int, db: Session = Depends(get_db),
                            current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "parent" and student.parent_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Attendance).filter(Attendance.student_id == student_id).order_by(Attendance.date.desc()).all()


@router.get("/student/{student_id}/summary", response_model=AttendanceSummary)
def get_attendance_summary(student_id: int, db: Session = Depends(get_db),
                            current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "parent" and student.parent_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = len([r for r in records if r.status == "present"])
    absent = len([r for r in records if r.status == "absent"])
    late = len([r for r in records if r.status == "late"])
    leave = len([r for r in records if r.status == "leave"])
    pct = round((present + late) / total * 100, 1) if total else 0.0
    return AttendanceSummary(total_days=total, present=present, absent=absent,
                              late=late, leave=leave, percentage=pct)
