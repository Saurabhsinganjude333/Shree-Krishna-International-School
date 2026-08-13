from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.models import Admission, User
from app.schemas.schemas import AdmissionCreate, AdmissionOut, AdmissionStatusUpdate

router = APIRouter(prefix="/api/admissions", tags=["Admissions"])


@router.post("", response_model=AdmissionOut)
def submit_admission(payload: AdmissionCreate, db: Session = Depends(get_db)):
    """Public endpoint - the online admission enquiry form."""
    admission = Admission(**payload.model_dump())
    db.add(admission)
    db.commit()
    db.refresh(admission)
    return admission


@router.get("", response_model=List[AdmissionOut])
def list_admissions(status: Optional[str] = Query(None), db: Session = Depends(get_db),
                     _: User = Depends(require_roles(["admin"]))):
    q = db.query(Admission)
    if status:
        q = q.filter(Admission.status == status)
    return q.order_by(Admission.created_at.desc()).all()


@router.patch("/{admission_id}", response_model=AdmissionOut)
def update_admission_status(admission_id: int, payload: AdmissionStatusUpdate, db: Session = Depends(get_db),
                             _: User = Depends(require_roles(["admin"]))):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission enquiry not found")
    admission.status = payload.status
    db.commit()
    db.refresh(admission)
    return admission
