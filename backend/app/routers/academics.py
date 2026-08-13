from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.models import SchoolClass, Subject, Chapter, Student, User
from app.schemas.schemas import (
    SchoolClassCreate, SchoolClassOut, SubjectCreate, SubjectOut,
    ChapterCreate, ChapterUpdate, ChapterOut, SyllabusProgressSummary,
)

router = APIRouter(prefix="/api", tags=["Academics & Syllabus"])


# ----------------- Classes -----------------
@router.get("/classes", response_model=List[SchoolClassOut])
def list_classes(db: Session = Depends(get_db)):
    return db.query(SchoolClass).options(
        joinedload(SchoolClass.subjects).joinedload(Subject.chapters)
    ).all()


@router.get("/classes/{class_id}", response_model=SchoolClassOut)
def get_class(class_id: int, db: Session = Depends(get_db)):
    cls = db.query(SchoolClass).options(
        joinedload(SchoolClass.subjects).joinedload(Subject.chapters)
    ).filter(SchoolClass.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls


@router.post("/classes", response_model=SchoolClassOut)
def create_class(payload: SchoolClassCreate, db: Session = Depends(get_db),
                  _: User = Depends(require_roles(["admin"]))):
    cls = SchoolClass(name=payload.name, section=payload.section)
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls


# ----------------- Subjects -----------------
@router.post("/subjects", response_model=SubjectOut)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db),
                    _: User = Depends(require_roles(["admin"]))):
    if not db.query(SchoolClass).filter(SchoolClass.id == payload.class_id).first():
        raise HTTPException(status_code=404, detail="Class not found")
    subject = Subject(name=payload.name, class_id=payload.class_id, teacher_id=payload.teacher_id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/subjects/{subject_id}", response_model=SubjectOut)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(Subject).options(joinedload(Subject.chapters)).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


# ----------------- Chapters (Syllabus units) -----------------
@router.post("/chapters", response_model=ChapterOut)
def create_chapter(payload: ChapterCreate, db: Session = Depends(get_db),
                    _: User = Depends(require_roles(["admin", "teacher"]))):
    if not db.query(Subject).filter(Subject.id == payload.subject_id).first():
        raise HTTPException(status_code=404, detail="Subject not found")
    chapter = Chapter(**payload.model_dump())
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.patch("/chapters/{chapter_id}", response_model=ChapterOut)
def update_chapter_progress(chapter_id: int, payload: ChapterUpdate, db: Session = Depends(get_db),
                             _: User = Depends(require_roles(["admin", "teacher"]))):
    """Core syllabus-tracking action: a teacher marks a chapter's progress.
    Students/parents see this reflected instantly via the syllabus summary endpoints."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(chapter, key, value)
    # Keep status and completion_pct consistent
    if chapter.status == "completed":
        chapter.completion_pct = 100.0
    elif chapter.status == "not_started":
        chapter.completion_pct = 0.0
    db.commit()
    db.refresh(chapter)
    return chapter


@router.delete("/chapters/{chapter_id}")
def delete_chapter(chapter_id: int, db: Session = Depends(get_db),
                    _: User = Depends(require_roles(["admin", "teacher"]))):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(chapter)
    db.commit()
    return {"detail": "Chapter deleted"}


# ----------------- Syllabus progress summaries -----------------
@router.get("/syllabus/class/{class_id}", response_model=List[SyllabusProgressSummary])
def syllabus_summary_by_class(class_id: int, db: Session = Depends(get_db)):
    """Real-time per-subject completion for a class — powers admin/teacher dashboards."""
    subjects = db.query(Subject).options(joinedload(Subject.chapters)).filter(Subject.class_id == class_id).all()
    summary = []
    for s in subjects:
        total = len(s.chapters)
        completed = len([c for c in s.chapters if c.status == "completed"])
        in_progress = len([c for c in s.chapters if c.status == "in_progress"])
        avg_pct = round(sum(c.completion_pct for c in s.chapters) / total, 1) if total else 0.0
        summary.append(SyllabusProgressSummary(
            subject_id=s.id, subject_name=s.name, total_chapters=total,
            completed_chapters=completed, in_progress_chapters=in_progress,
            avg_completion_pct=avg_pct,
        ))
    return summary


@router.get("/syllabus/student/{student_id}", response_model=List[SyllabusProgressSummary])
def syllabus_summary_for_student(student_id: int, db: Session = Depends(get_db),
                                  current_user: User = Depends(get_current_user)):
    """Student/parent real-time view of syllabus progress for the student's class."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Access control: admin/teacher always allowed; student can see own; parent can see own child
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.role == "parent" and student.parent_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not student.class_id:
        return []
    return syllabus_summary_by_class(student.class_id, db)
