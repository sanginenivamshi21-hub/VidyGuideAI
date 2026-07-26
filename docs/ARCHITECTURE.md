# VidyGuideAI Technical Architecture

This document describes the production architecture of VidyGuideAI — a full-stack AI-powered career counseling platform.

---

## 1. System Topology

The application consists of two decoupled services within a pnpm monorepo:

| Service | Stack | Port |
|---------|-------|------|
| **Web** | Next.js 15 (App Router) + React 19 | `:3000` |
| **API** | NestJS 11 + Prisma ORM | `:8000` |

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js 15 Frontend                    │
│  (React 19, Tailwind CSS 4, Framer Motion, Lucide Icons) │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTP/JSON (credentials: include)
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   NestJS 11 API Gateway                    │
│   Helmet · CORS · Rate Limiting · Validation · JWT Auth   │
├──────────────────────────────────────────────────────────┤
│  Auth │ Career │ Resume │ Mentor │ OCR │ Translator        │
│  Users │ History │ Conversations │ Settings │ Prisma       │
└───────┬──────────────────────────────────────┬───────────┘
        │                                      │
        ▼                                      ▼
┌──────────────────┐              ┌────────────────────────┐
│   PostgreSQL 16   │              │   Groq AI (LLaMA 3)    │
│   + Prisma ORM    │              │   + SMTP (Nodemailer)  │
│   + Migrations    │              │   + Cloudinary Files   │
└──────────────────┘              └────────────────────────┘
```

---

## 2. Core Request Flow

```
User → Next.js Page → fetch() with credentials → NestJS Controller
  → Guard (JWT validation) → Service → AI/Prisma → JSON Response
  → React re-render
```

### Authentication Flow

```
Login: User → /auth/login → email+password → bcryptjs verify
  → JWT tokens issued → httpOnly cookies set → response
  → Frontend stores user in localStorage → redirect to dashboard

Session: Each request includes cookies → JwtStrategy validates
  → Passport guard attaches user to request object
```

---

## 3. Module Breakdown

### API Modules (`apps/api/src/`)

| Module | Responsibility |
|--------|---------------|
| `auth/` | JWT strategy, guards, registration, login, OTP, password reset |
| `career/` | Career guidance recommendations, roadmap generation |
| `resume/` | ATS resume generation via AI, feedback analysis, PDF export |
| `mentor/` | AI mentor chat, interview simulation, streaming responses |
| `ocr/` | Resume/PDF text extraction via Python Tesseract subprocess |
| `translator/` | Multilingual translation for Indian regional languages |
| `conversations/` | Chat history CRUD with pinning and search |
| `users/` | Profile management, account deletion, data export |
| `settings/` | User preferences (theme, accent, model, voice, etc.) |
| `history/` | Full audit trail of all user interactions |
| `mail/` | SMTP email delivery via Nodemailer |
| `ai/` | Groq SDK wrapper for LLM inference |
| `database/` | Prisma ORM service |
| `common/` | Shared utilities (Cloudinary file uploads) |
| `config/` | Environment variable validation (Zod) |

### Web Pages (`apps/web/app/`)

| Route | Page |
|-------|------|
| `/` | Landing page with feature overview |
| `/auth` | Login, register, OTP verification, password reset |
| `/dashboard` | Usage stats and quick-launch cards |
| `/career` | Career guidance form |
| `/career/roadmap` | Visual career timeline |
| `/resume` | ATS resume builder |
| `/resume/feedback` | Resume scoring and improvement |
| `/ocr` | PDF/image text scanner |
| `/mentor` | AI mentor chat with streaming and voice |
| `/interview-prep` | Mock interview simulator |
| `/translator` | Multilingual translator |
| `/history` | Interaction audit trail |
| `/profile` | User profile management |
| `/settings` | Full user preferences |

---

## 4. Data Flow: User Interaction Logging

Mermaid diagram showing how user actions are tracked:

```
User → Page → API call → Controller
  → On success, record to history table
  → Response returned → UI updated
```

---

## 5. Database Schema (PostgreSQL + Prisma)

The database uses the `prisma/schema.prisma` definition with these core models:

- **User**: Accounts, passwords, verification status
- **History**: Interaction audit trail (action type, payload, result)
- **Conversation**: Chat sessions with title, pin, archive state
- **Message**: Individual chat messages within conversations
- **Settings**: Per-user preferences stored as structured data

Migrations are managed via `prisma migrate` and tracked in `prisma/migrations/`.

---

## 6. Infrastructure & DevOps

### Containerized Deployment

```
docker/
├── Dockerfile.api    # NestJS production build
├── Dockerfile.web    # Next.js production build
└── docker-compose.yml  # PostgreSQL + Redis + API + Web
```

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
- On push/PR to `main`
- Install dependencies (pnpm)
- Run lint
- Run build (both API and Web)

### Environment Variables

Managed via `.env.example`. See `docs/DEPLOYMENT.md` for details.
