# VidyGuideAI Technical Architecture Spec

This document details the software architecture, design patterns, database schemas, and data pipelines of the VidyGuideAI platform.

---

## 1. System Topology

VidyGuideAI is composed of two decoupled runtime nodes:
1. **Frontend (Streamlit UI)**: A multi-tab dashboard script managing validation, local state variables, and requesting resources from the backend API.
2. **Backend (FastAPI REST Server)**: An asynchronous ASGI web application validation engine communicating with LLM inference channels.

---

## 2. Core Request Flow

```mermaid
graph TD
    User([User Client]) -->|1. Submit Form| UI[Streamlit UI app.py]
    UI -->|2. Validate Input| Val[validators.py]
    Val -->|3. Success: HTTP POST| API[FastAPI backend/main.py]
    API -->|4. Pydantic Verification| Req[Request Model]
    Req -->|5. Forward Payload| Eng[Logic Engines]
    Eng -->|6. Call LLM API| Groq[Groq LLaMA-3.1]
    Groq -->|7. Return Response| Eng
    Eng -->|8. Clean String Output| API
    API -->|9. JSON Response| UI
    UI -->|10. Render View| User
```

---

## 3. Authentication & OTP Verification Flow

The user registration and security flow utilizes a salted SHA-256 hash database store:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Streamlit UI
    participant Auth as auth.py
    participant DB as SQLite DB
    participant SMTP as Gmail SMTP

    User->>UI: Enter Username, Email, Password
    UI->>Auth: register_user(username, email, password)
    Auth->>Auth: Hash password via SHA-256
    Auth->>DB: Insert user row (is_verified = 0)
    Auth->>Auth: Generate 6-digit OTP code
    Auth->>DB: Save OTP code + Expiry timestamp (Time + 10m)
    Auth->>SMTP: Connect to smtp.gmail.com (STARTTLS)
    Note over SMTP: Delivers OTP email to User inbox
    SMTP-->>UI: Delivery complete
    UI-->>User: Redirects to OTP verification form
    User->>UI: Enter OTP
    UI->>Auth: verify_registration_otp(otp)
    Auth->>DB: Verify OTP matching & expiry
    DB-->>Auth: Matches!
    Auth->>DB: Update user: is_verified = 1
    Auth-->>UI: Verification Success
    UI-->>User: Redirects to login panel
```

---

## 4. Feature Pipelines

### A. Career Recommendation & Roadmap Timeline
Parses and generates interactive timelines using regex patterns:

```mermaid
graph LR
    Input[Student Details] --> Engine[career_engine.py]
    Engine -->|Query LLaMA-3.1| LLM[LLM Output Text]
    LLM --> Parse[roadmap_viz.py Regex Parser]
    Parse -->|Match temporal blocks| Steps[Milestone Cards Array]
    Steps --> HTML[HTML Template Frame]
    HTML --> Streamlit[Streamlit components.html Iframe]
```

### B. Resume Scanner (OCR Pipeline)
Parses uploaded resumes using PDF/Image readers:

```mermaid
graph LR
    Upload[Resume PDF/Image] --> Scan[resume_scanner.py]
    Scan --> PDF{PDF File?}
    PDF -->|Yes| Plumber[PyPDF2/pdfplumber Parser]
    PDF -->|No| OCR[Image OCR Engine]
    Plumber --> Text[Plaintext Output]
    OCR --> Text
    Text --> Feedback[resume_feedback.py Evaluator]
```

---

## 5. Database Schema & Models
The local database uses SQLite (`vidyguide.db`) holding `users` and `history` tables linked by foreign key constraints.

See [DATABASE.md](docs/architecture/DATABASE.md) for table schemas and indices.

---

## 6. Future Next.js & Celery Target Architecture
To scale the system for production:

```mermaid
graph TD
    Next[Next.js Client React] -->|HTTPS Requests| API[FastAPI backend]
    API -->|JWT verification| Auth[JWT Cookies]
    API -->|Async Writes| Postgres[(PostgreSQL DB)]
    API -->|Offload heavy jobs| Redis{Redis Broker}
    Redis -->|Worker queue| Celery[Celery Tasks]
    Celery -->|Process OCR & PDF builds| S3[AWS S3 Storage]
```
