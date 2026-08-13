from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Class / Subject / Chapter (Syllabus tracking) ----------
class ChapterBase(BaseModel):
    title: str
    order_index: int = 0
    status: str = "not_started"
    completion_pct: float = 0.0
    planned_date: Optional[date] = None
    completed_date: Optional[date] = None
    notes: Optional[str] = None


class ChapterCreate(ChapterBase):
    subject_id: int


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    completion_pct: Optional[float] = None
    planned_date: Optional[date] = None
    completed_date: Optional[date] = None
    notes: Optional[str] = None


class ChapterOut(ChapterBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    subject_id: int
    updated_at: datetime


class SubjectBase(BaseModel):
    name: str
    class_id: int
    teacher_id: Optional[int] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectOut(SubjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    chapters: List[ChapterOut] = []


class SchoolClassBase(BaseModel):
    name: str
    section: str = "A"


class SchoolClassCreate(SchoolClassBase):
    pass


class SchoolClassOut(SchoolClassBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    subjects: List[SubjectOut] = []


class SyllabusProgressSummary(BaseModel):
    subject_id: int
    subject_name: str
    total_chapters: int
    completed_chapters: int
    in_progress_chapters: int
    avg_completion_pct: float


# ---------- Student / Teacher / Parent ----------
class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    admission_no: str
    roll_no: Optional[str] = None
    dob: Optional[date] = None
    class_id: Optional[int] = None
    parent_email: Optional[EmailStr] = None


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    admission_no: str
    roll_no: Optional[str]
    dob: Optional[date]
    class_id: Optional[int]
    user: UserOut


class TeacherCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None


class TeacherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    specialization: Optional[str]
    qualification: Optional[str]
    user: UserOut


# ---------- Attendance ----------
class AttendanceCreate(BaseModel):
    student_id: int
    date: date
    status: str
    remarks: Optional[str] = None


class AttendanceBulkEntry(BaseModel):
    student_id: int
    status: str
    remarks: Optional[str] = None


class AttendanceBulkCreate(BaseModel):
    class_id: int
    date: date
    entries: List[AttendanceBulkEntry]


class AttendanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    student_id: int
    date: date
    status: str
    remarks: Optional[str]


class AttendanceSummary(BaseModel):
    total_days: int
    present: int
    absent: int
    late: int
    leave: int
    percentage: float


# ---------- Results ----------
class ResultCreate(BaseModel):
    student_id: int
    subject_id: int
    exam_name: str
    term: Optional[str] = None
    marks_obtained: float
    max_marks: float = 100
    grade: Optional[str] = None
    exam_date: Optional[date] = None


class ResultOut(ResultCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Fees ----------
class FeeRecordCreate(BaseModel):
    student_id: int
    term: str
    amount_due: float
    amount_paid: float = 0.0
    due_date: Optional[date] = None
    status: str = "unpaid"


class FeeRecordOut(FeeRecordCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Admissions ----------
class AdmissionCreate(BaseModel):
    student_name: str
    dob: Optional[date] = None
    class_applying: str
    parent_name: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    message: Optional[str] = None


class AdmissionOut(AdmissionCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    created_at: datetime


class AdmissionStatusUpdate(BaseModel):
    status: str


# ---------- Gallery / Events / Blog / Contact ----------
class GalleryImageCreate(BaseModel):
    title: str
    image_url: str
    category: Optional[str] = None


class GalleryImageOut(GalleryImageCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    location: Optional[str] = None
    image_url: Optional[str] = None


class EventOut(EventCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    author: Optional[str] = None


class BlogPostOut(BlogPostCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    published_at: datetime


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class ContactMessageOut(ContactMessageCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Dashboard aggregate ----------
class AdminDashboardStats(BaseModel):
    total_students: int
    total_teachers: int
    total_classes: int
    pending_admissions: int
    avg_syllabus_completion: float
    fee_collected_pct: float
    upcoming_events: int
