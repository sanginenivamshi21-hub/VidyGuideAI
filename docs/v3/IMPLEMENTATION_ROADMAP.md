# Implementation Roadmap

This document maps out the timeline and sprint tasks for building VidyGuideAI V3.

---

## 📅 Sprint Schedule

```
  Sprint 1 (Backend Core)     Sprint 2 (Frontend Base)     Sprint 3 (AI & Timelines)
  ┌──────────────────────┐    ┌───────────────────────┐    ┌──────────────────────┐
  │ • NestJS Setup       │ ─> │ • Next.js + Tailwind  │ ─> │ • Groq client hookup │
  │ • Prisma Models      │    │ • shadcn/ui framework │    │ • Framer timelines   │
  │ • JWT/OTP logic      │    │ • Login auth panels   │    │ • OCR scanner queue  │
  └──────────────────────┘    └───────────────────────┘    └──────────────────────┘
```

---

## 🎯 Target Milestones

### Sprint 1: Backend Infrastructure (Weeks 1-2)
* **Deliverables**:
  * NestJS server initialization with Prisma client connector.
  * PostgreSQL database provisioning.
  * Register, login, and Resend-based OTP validation endpoints.

### Sprint 2: Frontend Layout & Auth Integration (Weeks 3-4)
* **Deliverables**:
  * Next.js repository setup using Tailwind CSS styling and shadcn/ui.
  * Integrated SoftAurora canvas overlay.
  * Login, signup, and verification pages connected to NestJS endpoints.

### Sprint 3: AI Feature Migrations (Weeks 5-6)
* **Deliverables**:
  * NestJS AI services validating outputs via Zod schema parsers.
  * Interactive Framer Motion timelines on the dashboard.
  * Background OCR workers using BullMQ.
