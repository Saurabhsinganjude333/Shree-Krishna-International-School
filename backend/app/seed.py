"""
Seed the database with demo data so the site is fully explorable out of the box.
Run with:  python -m app.seed
"""
from datetime import date, timedelta, datetime

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    User, SchoolClass, Subject, Chapter, Teacher, Student, Attendance, Result,
    FeeRecord, Admission, GalleryImage, Event, BlogPost,
)

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def get_or_create_user(name, email, password, role, phone=None):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(name=name, email=email, phone=phone, role=role, hashed_password=hash_password(password))
    db.add(user)
    db.flush()
    return user


print("Seeding admin...")
admin_user = get_or_create_user("Rakesh Patel", "admin@skis.edu.in", "Admin@123", "admin", "9999900001")

print("Seeding classes...")
classes = {}
for grade in [6, 7, 8, 9, 10]:
    existing = db.query(SchoolClass).filter(SchoolClass.name == f"Grade {grade}", SchoolClass.section == "A").first()
    if not existing:
        existing = SchoolClass(name=f"Grade {grade}", section="A")
        db.add(existing)
        db.flush()
    classes[grade] = existing

print("Seeding teachers...")
teacher_defs = [
    ("Meera Shah", "meera.shah@skis.edu.in", "Mathematics"),
    ("Arjun Nair", "arjun.nair@skis.edu.in", "Science"),
    ("Priya Desai", "priya.desai@skis.edu.in", "English"),
    ("Kiran Joshi", "kiran.joshi@skis.edu.in", "Social Studies"),
]
teachers = {}
for name, email, spec in teacher_defs:
    u = get_or_create_user(name, email, "Teacher@123", "teacher", "9999911111")
    t = db.query(Teacher).filter(Teacher.user_id == u.id).first()
    if not t:
        t = Teacher(user_id=u.id, specialization=spec, qualification="M.Ed")
        db.add(t)
        db.flush()
    teachers[spec] = t

print("Seeding subjects & syllabus chapters...")
syllabus_map = {
    "Mathematics": ["Real Numbers", "Polynomials", "Linear Equations", "Triangles", "Trigonometry", "Statistics"],
    "Science": ["Chemical Reactions", "Acids & Bases", "Life Processes", "Light - Reflection & Refraction", "Electricity", "Our Environment"],
    "English": ["Prose: A Letter to God", "Poem: Dust of Snow", "Grammar: Tenses", "Writing Skills", "Novel Study"],
    "Social Studies": ["The Rise of Nationalism", "Resources & Development", "Power Sharing", "Federalism"],
}

for grade, cls in classes.items():
    for subj_name, chapters in syllabus_map.items():
        subj = db.query(Subject).filter(Subject.class_id == cls.id, Subject.name == subj_name).first()
        if not subj:
            subj = Subject(name=subj_name, class_id=cls.id, teacher_id=teachers[subj_name].id)
            db.add(subj)
            db.flush()
            for i, title in enumerate(chapters):
                # vary completion so the dashboard looks alive
                if i < len(chapters) // 2:
                    status, pct = "completed", 100.0
                elif i == len(chapters) // 2:
                    status, pct = "in_progress", 55.0
                else:
                    status, pct = "not_started", 0.0
                db.add(Chapter(subject_id=subj.id, title=title, order_index=i, status=status,
                                completion_pct=pct, planned_date=date.today() + timedelta(days=i * 14)))

db.flush()

print("Seeding a demo parent, student & related records...")
parent_user = get_or_create_user("Sunita Mehta", "parent@skis.edu.in", "Parent@123", "parent", "9999922222")
student_user = get_or_create_user("Aarav Mehta", "student@skis.edu.in", "Student@123", "student", "9999933333")

demo_class = classes[8]
student = db.query(Student).filter(Student.user_id == student_user.id).first()
if not student:
    student = Student(user_id=student_user.id, admission_no="SKIS2026-0081", roll_no="18",
                       dob=date(2012, 4, 15), class_id=demo_class.id, parent_user_id=parent_user.id)
    db.add(student)
    db.flush()

    # Attendance - last 20 school days
    for i in range(20):
        d = date.today() - timedelta(days=i)
        if d.weekday() == 6:  # skip Sundays
            continue
        status = "present" if i % 6 != 0 else "absent"
        db.add(Attendance(student_id=student.id, date=d, status=status))

    # Results
    subj_math = db.query(Subject).filter(Subject.class_id == demo_class.id, Subject.name == "Mathematics").first()
    subj_sci = db.query(Subject).filter(Subject.class_id == demo_class.id, Subject.name == "Science").first()
    subj_eng = db.query(Subject).filter(Subject.class_id == demo_class.id, Subject.name == "English").first()
    db.add(Result(student_id=student.id, subject_id=subj_math.id, exam_name="Unit Test 1", term="Term 1",
                   marks_obtained=42, max_marks=50, grade="A", exam_date=date.today() - timedelta(days=30)))
    db.add(Result(student_id=student.id, subject_id=subj_sci.id, exam_name="Unit Test 1", term="Term 1",
                   marks_obtained=38, max_marks=50, grade="B+", exam_date=date.today() - timedelta(days=28)))
    db.add(Result(student_id=student.id, subject_id=subj_eng.id, exam_name="Unit Test 1", term="Term 1",
                   marks_obtained=45, max_marks=50, grade="A+", exam_date=date.today() - timedelta(days=26)))

    # Fees
    db.add(FeeRecord(student_id=student.id, term="2026-27 Term 1", amount_due=25000,
                      amount_paid=25000, status="paid", due_date=date.today() - timedelta(days=60)))
    db.add(FeeRecord(student_id=student.id, term="2026-27 Term 2", amount_due=25000,
                      amount_paid=10000, status="partial", due_date=date.today() + timedelta(days=30)))

print("Seeding admissions enquiries...")
if db.query(Admission).count() == 0:
    db.add(Admission(student_name="Vihaan Trivedi", dob=date(2018, 6, 12), class_applying="Grade 1",
                      parent_name="Nikhil Trivedi", phone="9898900011", email="nikhil.t@example.com",
                      address="Kalwada, Valsad", message="Looking for admission for the upcoming session."))
    db.add(Admission(student_name="Diya Patel", dob=date(2016, 2, 3), class_applying="Grade 3",
                      parent_name="Bhavesh Patel", phone="9898900022", email="bhavesh.p@example.com",
                      status="contacted"))

print("Seeding gallery, events, blog...")
if db.query(GalleryImage).count() == 0:
    gallery_items = [
        ("Annual Sports Day 2026", "sports"),
        ("Science Exhibition", "academics"),
        ("Independence Day Celebration", "events"),
        ("Cultural Fest - Dance Performance", "cultural"),
        ("New Smart Classrooms", "campus"),
        ("Investiture Ceremony", "events"),
    ]
    for title, cat in gallery_items:
        db.add(GalleryImage(title=title, image_url=f"https://picsum.photos/seed/{title.replace(' ', '')}/800/600",
                             category=cat))

if db.query(Event).count() == 0:
    db.add(Event(title="International Youth Day Celebration", description="Empowering youth today for a better tomorrow.",
                  event_date=date(2026, 8, 12), location="School Auditorium"))
    db.add(Event(title="Annual Day Function", description="A celebration of talent, art and achievement.",
                  event_date=date.today() + timedelta(days=45), location="Main Ground"))
    db.add(Event(title="Parent-Teacher Meeting - Term 2", description="Discuss student progress and syllabus completion.",
                  event_date=date.today() + timedelta(days=20), location="Respective Classrooms"))

if db.query(BlogPost).count() == 0:
    db.add(BlogPost(
        title="SKIS Students Shine at District Science Exhibition",
        slug="district-science-exhibition-2026",
        excerpt="Our young scientists brought home three awards at this year's district-level science exhibition.",
        content="Students from Grades 8 to 10 presented working models on renewable energy, water purification, "
                "and smart agriculture. The judges praised the depth of research and clarity of presentation. "
                "We are proud of our students' curiosity and hard work.",
        author="School Administration",
    ))
    db.add(BlogPost(
        title="New Academic Session Begins with Renewed Energy",
        slug="new-academic-session-2026-27",
        excerpt="Welcoming students back with a refreshed curriculum and upgraded smart classrooms.",
        content="The 2026-27 academic session began with an assembly focused on our theme for the year: "
                "curiosity, character, and community. Teachers introduced the new syllabus tracking system "
                "that lets parents follow chapter-by-chapter progress in real time.",
        author="School Administration",
    ))

db.commit()
print("\nSeed complete.")
print("-" * 50)
print("Demo login credentials:")
print("  Admin:   admin@skis.edu.in / Admin@123")
print("  Teacher: meera.shah@skis.edu.in / Teacher@123")
print("  Parent:  parent@skis.edu.in / Parent@123")
print("  Student: student@skis.edu.in / Student@123")
print("-" * 50)
db.close()
