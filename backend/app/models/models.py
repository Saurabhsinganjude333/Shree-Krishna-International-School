import enum
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"


class ChapterStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    leave = "leave"


class AdmissionStatus(str, enum.Enum):
    pending = "pending"
    contacted = "contacted"
    admitted = "admitted"
    rejected = "rejected"


class FeeStatus(str, enum.Enum):
    paid = "paid"
    partial = "partial"
    unpaid = "unpaid"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.student)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False, foreign_keys="Student.user_id")
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False, foreign_keys="Teacher.user_id")
    children = relationship("Student", back_populates="parent_user", foreign_keys="Student.parent_user_id")


class SchoolClass(Base):
    __tablename__ = "school_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(40), nullable=False)   # e.g. "Grade 8"
    section = Column(String(10), nullable=False, default="A")
    class_teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)

    subjects = relationship("Subject", back_populates="school_class", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="school_class")


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialization = Column(String(120), nullable=True)
    qualification = Column(String(160), nullable=True)

    user = relationship("User", back_populates="teacher_profile", foreign_keys=[user_id])
    subjects = relationship("Subject", back_populates="teacher")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    admission_no = Column(String(40), unique=True, nullable=False)
    roll_no = Column(String(20), nullable=True)
    dob = Column(Date, nullable=True)
    class_id = Column(Integer, ForeignKey("school_classes.id"), nullable=True)
    parent_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="student_profile", foreign_keys=[user_id])
    parent_user = relationship("User", back_populates="children", foreign_keys=[parent_user_id])
    school_class = relationship("SchoolClass", back_populates="students")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="student", cascade="all, delete-orphan")
    fee_records = relationship("FeeRecord", back_populates="student", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    class_id = Column(Integer, ForeignKey("school_classes.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)

    school_class = relationship("SchoolClass", back_populates="subjects")
    teacher = relationship("Teacher", back_populates="subjects")
    chapters = relationship("Chapter", back_populates="subject", cascade="all, delete-orphan", order_by="Chapter.order_index")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String(200), nullable=False)
    order_index = Column(Integer, default=0)
    status = Column(Enum(ChapterStatus), default=ChapterStatus.not_started)
    completion_pct = Column(Float, default=0.0)
    planned_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subject = relationship("Subject", back_populates="chapters")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present)
    remarks = Column(String(200), nullable=True)

    student = relationship("Student", back_populates="attendance_records")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    exam_name = Column(String(100), nullable=False)   # e.g. "Term 1 Unit Test 2"
    term = Column(String(40), nullable=True)
    marks_obtained = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False, default=100)
    grade = Column(String(5), nullable=True)
    exam_date = Column(Date, nullable=True)

    student = relationship("Student", back_populates="results")
    subject = relationship("Subject")


class FeeRecord(Base):
    __tablename__ = "fee_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    term = Column(String(40), nullable=False)   # e.g. "2026-27 Term 1"
    amount_due = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    due_date = Column(Date, nullable=True)
    status = Column(Enum(FeeStatus), default=FeeStatus.unpaid)

    student = relationship("Student", back_populates="fee_records")


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(120), nullable=False)
    dob = Column(Date, nullable=True)
    class_applying = Column(String(40), nullable=False)
    parent_name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(160), nullable=True)
    address = Column(Text, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(Enum(AdmissionStatus), default=AdmissionStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)


class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    image_url = Column(String(500), nullable=False)
    category = Column(String(60), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(Date, nullable=False)
    location = Column(String(160), nullable=True)
    image_url = Column(String(500), nullable=True)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False)
    excerpt = Column(String(400), nullable=True)
    content = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    author = Column(String(120), nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    phone = Column(String(20), nullable=True)
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
