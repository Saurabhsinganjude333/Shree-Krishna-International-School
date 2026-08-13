from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.models import Result, Student, User
from app.schemas.schemas import ResultCreate, ResultOut

router = APIRouter(prefix="/api/results", tags=["Results"])


def _grade_for(pct: float) -> str:
    if pct >= 90: return "A+"
    if pct >= 80: return "A"
    if pct >= 70: return "B+"
    if pct >= 60: return "B"
    if pct >= 50: return "C"
    if pct >= 40: return "D"
    return "F"


@router.post("", response_model=ResultOut)
def add_result(payload: ResultCreate, db: Session = Depends(get_db),
               _: User = Depends(require_roles(["admin", "teacher"]))):
    data = payload.model_dump()
    if not data.get("grade"):
        pct = (data["marks_obtained"] / data["max_marks"]) * 100 if data["max_marks"] else 0
        data["grade"] = _grade_for(pct)
    result = Result(**data)
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/student/{student_id}", response_model=List[ResultOut])
def get_student_results(student_id: int, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "parent" and student.parent_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Result).filter(Result.student_id == student_id).all()
