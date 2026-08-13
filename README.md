# Shree Krishna International School — Website & Portal Platform

A production-ready, multi-page school website for **Shree Krishna International School**
(Kalwada, Valsad — School Code 11654, Affiliation No. 430563), built as a real full-stack
application rather than a static template.

It combines a public marketing site (Home, About, Academics, Admissions, Gallery, Events,
News, Contact) with **four role-based portals** — Admin, Teacher, Student, Parent — built
around a live, chapter-by-chapter **syllabus tracking system**.

---

## What's included

**Public website**
- Home, About, Contact
- Academics — the public syllabus tracker (browse every grade's chapter-by-chapter progress)
- Admissions — online enquiry form that lands directly in the admin inbox
- Gallery, Events calendar, News/Blog (with individual post pages)

**Syllabus Tracking (the headline feature)**
- Classes → Subjects → Chapters, each with a status (not started / in progress / completed)
  and a completion percentage
- Teachers/admins update chapter progress from their dashboard
- Students and parents see the same data reflected instantly — no page reload needed,
  the numbers are pulled live from the API
- Ledger-styled UI so it reads like an actual academic record, not a generic progress bar

**Role-based portals** (JWT authentication, `/portal/<role>`)
- **Admin**: KPI overview with charts, admissions inbox with status management, syllabus
  manager across all classes, student directory
- **Teacher**: update syllabus progress, mark class attendance in bulk, enter exam results
- **Student**: live syllabus progress, attendance summary (with chart), results, fee status
- **Parent**: same live view as the student portal, with a child switcher for multiple children

**Extra features beyond the original ask**
- Attendance tracking with daily bulk entry and percentage summaries
- Results/grades with automatic grade calculation
- Fee records with paid/partial/unpaid status
- Admissions pipeline (pending → contacted → admitted/rejected)
- Content management for gallery, events and blog posts (admin/teacher only)
- Contact form that lands in an admin-only inbox

---

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19 + Vite + Tailwind CSS v4 + React Router + Recharts + Axios |
| Backend   | FastAPI + SQLAlchemy 2.0 + Pydantic v2 + JWT auth (python-jose) + bcrypt |
| Database  | PostgreSQL in production (SQLite by default for local development) |
| Packaging | Docker + Docker Compose (Postgres + FastAPI + Nginx-served React build) |

The backend is a REST API (`/docs` for interactive Swagger docs) fully decoupled from the
frontend, so you can redeploy either independently or swap the frontend for a mobile app later.

---

## Quick start — local development (no Docker)

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Seed demo data (creates SQLite db + demo accounts, safe to re-run)
python -m app.seed

uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (interactive docs at `/docs`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. The dev server proxies `/api/*` to `http://localhost:8000`
(see `vite.config.js`), so no extra configuration is needed locally.

### Demo accounts (created by the seed script)

| Role    | Email                      | Password     |
|---------|-----------------------------|---------------|
| Admin   | admin@skis.edu.in           | Admin@123     |
| Teacher | meera.shah@skis.edu.in      | Teacher@123   |
| Parent  | parent@skis.edu.in          | Parent@123    |
| Student | student@skis.edu.in         | Student@123   |

The Login page also has one-tap buttons to autofill these for quick testing.

---

## Production deployment with Docker Compose

This spins up PostgreSQL, the FastAPI backend, and an Nginx-served React build, wired
together on one network.

```bash
docker compose up -d --build

# then seed demo data / initial admin account inside the running backend container
docker compose exec backend python -m app.seed
```

The site is now served on `http://<your-server>` (port 80), with the API reverse-proxied
through Nginx at `/api/*`.

**Before going live, change these in `docker-compose.yml` or a `.env` file:**
- `SECRET_KEY` — generate a long random string (e.g. `openssl rand -hex 32`)
- `POSTGRES_PASSWORD` — use a strong password
- `CORS_ORIGINS` — set to your real domain(s)

**Recommended for a real production rollout:**
- Put the whole stack behind HTTPS (Caddy, Traefik, or Nginx + Let's Encrypt / Certbot)
- Point `docker-compose.yml`'s `frontend` service through your TLS-terminating reverse proxy
  instead of exposing port 80 directly
- Take regular backups of the `skis_db_data` Postgres volume
- Replace the seed script's demo accounts with real admin credentials before launch, or
  simply skip running `app.seed` in production and create your admin account via
  `POST /api/auth/register` with `role: "admin"` once, then lock that endpoint down

### Where to host it
Any VPS that can run Docker (DigitalOcean, Hetzner, AWS Lightsail, Railway, Render) works.
For a low-maintenance managed option, Railway or Render can build directly from this repo
using the two Dockerfiles, with a managed Postgres add-on in place of the `db` service.

---

## Project structure

```
skis/
├── backend/
│   ├── app/
│   │   ├── core/          # config, database session, security (JWT/bcrypt), auth deps
│   │   ├── models/         # SQLAlchemy models (User, Student, Teacher, SchoolClass,
│   │   │                    Subject, Chapter, Attendance, Result, FeeRecord, Admission,
│   │   │                    GalleryImage, Event, BlogPost, ContactMessage)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── routers/        # auth, academics (syllabus), people, attendance, results,
│   │   │                    fees, admissions, content, dashboard
│   │   ├── seed.py         # demo data generator
│   │   └── main.py         # FastAPI app entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx # login/logout/session state
│   │   ├── components/             # Navbar, Footer, DashboardLayout, SyllabusLedger, etc.
│   │   ├── pages/                  # public site pages
│   │   └── pages/portal/           # Admin/Teacher/Student/Parent dashboards
│   ├── package.json
│   └── Dockerfile / nginx.conf
└── docker-compose.yml
```

---

## Extending it further

Ideas that fit naturally on top of this foundation:
- Online fee payment via Razorpay/Stripe webhook into the existing `FeeRecord` model
- Email/SMS notifications when a chapter is marked complete or an admission status changes
- File uploads (assignments, report cards) using the `pdf`/`docx` handling patterns already
  common in this stack, stored in S3-compatible storage
- A "parent digest" weekly email summarizing syllabus + attendance, generated from the
  existing `/syllabus/student/{id}` and `/attendance/student/{id}/summary` endpoints
- Push the admin syllabus/attendance/results screens behind more granular per-subject
  teacher permissions once you have more than a handful of staff accounts
