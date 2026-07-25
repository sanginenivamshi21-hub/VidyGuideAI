# VidyGuideAI Development Roadmap

This roadmap tracks the development milestones of VidyGuideAI as it transitions from a local prototype to a production-grade SaaS career counseling platform.

---

## 📅 Roadmap Schedule

```
  v0.1.0 (Prototype)       v0.2.0 (Stabilized)        v1.0.0 (Production SaaS)
  ┌─────────────────┐      ┌─────────────────┐       ┌────────────────────────┐
  │ • Basic UI      │ ───> │ • Security Fixes│ ────> │ • Next.js React UI     │
  │ • Mock logic    │      │ • Clean History │       │ • PostgreSQL database  │
  │ • SQLite DB     │      │ • Local run OK  │       │ • Resend REST SMTP     │
  │ • Hardcoded keys│      │ • Git release   │       │ • Docker containers    │
  └─────────────────┘      └─────────────────┘       └────────────────────────┘
```

---

## 🎯 Release Phases

### Phase 1 — Repository & Local Stabilization (Current)
* **Goal**: Fix bugs, clean history of API credentials, organize documentation, and establish Docker profiles.
* **Deliverables**:
  * Professional README, Architectural guidelines, and templates.
  * Corrected `.env` parsing logic.
  * Verified local runs of FastAPI backend and Streamlit UI.

### Phase 2 — Production Sprints
* **Sprint 1**: Security & Environment variables hardening.
* **Sprint 2**: Authentication refactoring (JSON Web Tokens).
* **Sprint 3**: PostgreSQL database migration.
* **Sprint 4**: API routing modularization.
* **Sprint 5**: Next.js & Tailwind CSS frontend migration.
* **Sprint 6**: PDF & Image Resume Scanner (OCR) optimization.
* **Sprint 7**: Voice Mentor voice synthesis player integrations.
* **Sprint 8**: Monitoring (Prometheus & Sentry) setups.
* **Sprint 9**: GitHub Actions linting/testing configurations.
* **Sprint 10**: Cloud Deployments (Docker cluster deployment).
