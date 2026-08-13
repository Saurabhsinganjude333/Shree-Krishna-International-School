from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.security import hash_password
from app.models.models import Student, Teacher, User
from app.schemas.schemas import StudentCreate, StudentOut, TeacherCreate, TeacherOut

router = APIRouter(prefix="/api", tags=["Students & Teachers"])


@router.post("/students", response_model=StudentOut)
def create_student(payload: StudentCreate, db: Session = Depends(get_db),
                    _: User = Depends(require_roles(["admin"]))):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(Student).filter(Student.admission_no == payload.admission_no).first():
        raise HTTPException(status_code=400, detail="Admission number already exists")

    parent_user_id = None
    if payload.parent_email:
        parent = db.query(User).filter(User.email == payload.parent_email, User.role == "parent").first()
        if parent:
            parent_user_id = parent.id

    user = User(name=payload.name, email=payload.email, phone=payload.phone,
                role="student", hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()

    student = Student(user_id=user.id, admission_no=payload.admission_no, roll_no=payload.roll_no,
                       dob=payload.dob, class_id=payload.class_id, parent_user_id=parent_user_id)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/students", response_model=List[StudentOut])
def list_students(class_id: Optional[int] = Query(None), db: Session = Depends(get_db),
                   _: User = Depends(require_roles(["admin", "teacher"]))):
    q = db.query(Student).options(joinedload(Student.user))
    if class_id:
        q = q.filter(Student.class_id == class_id)
    return q.all()


@router.get("/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    student = db.query(Student).options(joinedload(Student.user)).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "parent" and student.parent_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return student


@router.get("/students/me/profile", response_model=StudentOut)
def get_my_student_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).options(joinedload(Student.user)).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found for this account")
    return student


@router.get("/parents/me/children", response_model=List[StudentOut])
def get_my_children(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Student).options(joinedload(Student.user)).filter(
        Student.parent_user_id == current_user.id).all()


@router.post("/teachers", response_model=TeacherOut)
def create_teacher(payload: TeacherCreate, db: Session = Depends(get_db),
                    _: User = Depends(require_roles(["admin"]))):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=payload.name, email=payload.email, phone=payload.phone,
                role="teacher", hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()
    teacher = Teacher(user_id=user.id, specialization=payload.specialization, qualification=payload.qualification)
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/teachers", response_model=List[TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    return db.query(Teacher).options(joinedload(Teacher.user)).all()
