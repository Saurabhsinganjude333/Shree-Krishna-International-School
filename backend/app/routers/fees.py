from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.models import FeeRecord, Student, User
from app.schemas.schemas import FeeRecordCreate, FeeRecordOut

router = APIRouter(prefix="/api/fees", tags=["Fees"])


@router.post("", response_model=FeeRecordOut)
def create_fee_record(payload: FeeRecordCreate, db: Session = Depends(get_db),
                       _: User = Depends(require_roles(["admin"]))):
    data = payload.model_dump()
    if data["amount_paid"] >= data["amount_due"] and data["amount_due"] > 0:
        data["status"] = "paid"
    elif data["amount_paid"] > 0:
        data["status"] = "partial"
    else:
        data["status"] = "unpaid"
    record = FeeRecord(**data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/student/{student_id}", response_model=List[FeeRecordOut])
def get_student_fees(student_id: int, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "parent" and student.parent_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(FeeRecord).filter(FeeRecord.student_id == student_id).all()
