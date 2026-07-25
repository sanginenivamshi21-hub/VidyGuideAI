# Project State Tracker

Operational state tracking for VidyGuideAI services.

---

## 1. Local Runtime Cluster
* **Backend API**: FastAPI serving from [http://localhost:8000](http://localhost:8000) (PID task-148)
* **Frontend Web**: Streamlit dashboard serving from [http://localhost:8501](http://localhost:8501) (PID task-150)
* **Database**: SQLite database file [vidyguide.db](vidyguide.db) (untracked)

---

## 2. API Routes Mapping
* `GET /` — Health status. Returns version `2.0`.
* `POST /career` — Career suggestion prompts handler.
* `POST /resume` — Resume plain text generator.
* `POST /resume-feedback` — ATS feedback reviewer.
* `POST /mentor` — Conversational advice replies.

---

## 3. Professionalization Status
* **Git History Sanitization**: Complete. All API keys scrubbed from git history on all branches.
* **Environment Configuration**: Verified. `.env` file loads variables securely without hardcoded credentials in source files.
* **GitHub Integration**: Safe. Cleaned codebase pushed to remote repository.
* **CI/CD Build Validations**: GitHub Actions configuration staged.
