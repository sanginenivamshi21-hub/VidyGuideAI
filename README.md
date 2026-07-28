<div align="center">

# VidyGuideAI

**AI-Powered Career Preparation Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq%20AI-Llama%203-FF6600?style=for-the-badge)](https://groq.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-3DDC84?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-8A2BE2?style=for-the-badge)](CONTRIBUTING.md)

<sub>Empowering students with AI-driven career guidance — Resume Builder, ATS Resume Review, AI Mentor, Career Guidance, and more.</sub>

---

[Features](#features) • [Screenshots](#screenshots) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Quick Start](#quick-start) • [API Overview](#api-overview) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>

---

## Overview

VidyGuideAI is a full-stack, AI-powered career preparation platform built for students and job seekers. It combines a modern Next.js frontend with a NestJS backend, PostgreSQL database, and Groq AI (LLaMA 3) to deliver:

- **Resume Builder** — 10-step guided wizard with 5 ATS-optimized templates, role-specific skill suggestions, and live preview
- **Resume Review** — Unified ATS scoring, keyword analysis, grammar/formatting check, AI feedback, and enhanced resume generation
- **AI Mentor** — Chat-based career assistant with streaming responses, file attachments (drag & drop, paste), voice input, keyboard shortcuts, and conversation management
- **Career Guidance** — Role recommendations, industry insights, and personalized career roadmaps
- **OCR Processing** — Extract text from PDF and image resumes using EasyOCR + Tesseract
- **PDF Export** — Generate professional PDF resumes via ReportLab
- **Translator** — Multilingual support across 10+ Indian languages
- **Interview Preparation** — Mock technical and behavioral interviews with AI feedback

---

## Features

| Module | Description |
|--------|-------------|
| **Resume Builder** | 10-step guided wizard with 5 templates, role-specific skill suggestions, live preview, auto-save, ATS quality checks, and PDF export |
| **Resume Review** | One-click ATS score analysis, keyword density, formatting issues, grammar suggestions, missing skills, strengths/improvements, AI coach feedback, and enhanced resume generation |
| **AI Mentor** | Real-time streaming chat with Groq AI, drag-and-drop file attachments, image paste, voice input, keyboard shortcuts (Ctrl+/, Ctrl+Enter, etc.), conversation search/pin/rename, and markdown rendering |
| **Career Guidance** | AI-driven role validation, industry-specific suggestions, personalized career roadmaps with visual timelines |
| **OCR Scanner** | Extract text from uploaded PDF and image resumes using EasyOCR with Tesseract fallback |
| **Translator** | Translate career content between English and Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, and more |
| **Interview Prep** | Practice mock interviews with role-specific questions, AI-generated feedback, and performance tracking |
| **Dashboard** | Central hub with usage stats, quick-access cards for all modules, and activity history |
| **Settings** | Theme (dark/light), accent color, AI model selection, voice configuration, and notification preferences |
| **Authentication** | Email/password registration with OTP verification, JWT cookie-based sessions, forgot/reset password, and guest mode |

---

## Screenshots

<div align="center">
  <img src="assets/screenshots/landing-page.jpg" alt="Landing Page" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Landing page</em></p>
  <img src="assets/screenshots/dashboard.jpg" alt="Dashboard" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Career dashboard</em></p>
  <img src="assets/screenshots/resume-builder.jpg" alt="Resume Builder" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Resume Builder with live preview</em></p>
  <img src="assets/screenshots/resume-feedback.jpg" alt="Resume Review" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Resume Review with ATS scoring and AI feedback</em></p>
  <img src="assets/screenshots/ai-mentor.jpg" alt="AI Mentor" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>AI Mentor chat interface</em></p>
  <img src="assets/screenshots/career-guidance.jpg" alt="Career Guidance" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Career guidance recommendations</em></p>
  <img src="assets/screenshots/interview-prep.jpg" alt="Interview Prep" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Interview preparation module</em></p>
  <img src="assets/screenshots/history.jpg" alt="History" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Activity history</em></p>
  <img src="assets/screenshots/profile.jpg" alt="Profile" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>User profile</em></p>
  <img src="assets/screenshots/settings.jpg" alt="Settings" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Settings panel</em></p>
  <img src="assets/screenshots/translator.jpg" alt="Translator" width="700" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <p><em>Multilingual translator</em></p>
</div>

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4, Framer Motion
- **Icons:** Lucide React
- **3D Graphics:** OGL (WebGL)

### Backend
- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 5.21
- **Database:** PostgreSQL 16
- **Authentication:** JWT (HTTP-only cookies), bcryptjs, Passport
- **Email:** Resend API
- **Validation:** class-validator, class-transformer, Zod
- **Security:** Helmet, Rate Limiting (@nestjs/throttler)

### AI & ML
- **AI Provider:** Groq (LLaMA 3 70B)
- **OCR:** EasyOCR (PyTorch), Tesseract (pytesseract)
- **PDF Generation:** ReportLab (Python)

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **File Storage:** Cloudinary
- **Deployment:** Render (API), Neon (PostgreSQL)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js 15 Frontend                    │
│  (React 19, Tailwind CSS 4, Framer Motion, Lucide Icons) │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTP/JSON (credentials: include)
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   NestJS 11 API Gateway                   │
│   Helmet · CORS · Rate Limiting · Validation · JWT Auth   │
├──────────────────────────────────────────────────────────┤
│  Auth │ Career │ Resume │ Mentor │ OCR │ Translator        │
│  Users │ History │ Conversations │ Settings │ Prisma       │
└───────┬──────────────────────────────────────┬───────────┘
        │                                      │
        ▼                                      ▼
┌──────────────────┐              ┌────────────────────────┐
│   PostgreSQL 16   │              │   Groq AI (LLaMA 3)    │
│   + Prisma ORM    │              │   + Resend (Email)     │
│   + Migrations    │              │   + Cloudinary Files   │
└──────────────────┘              └────────────────────────┘
```

---

## Project Structure

```
VidyGuide-ai/
├── apps/
│   ├── api/                     # NestJS backend
│   │   ├── prisma/              # Schema + migrations
│   │   └── src/                 # Controllers, services, modules
│   │       ├── auth/            # Authentication module
│   │       ├── career/          # Career guidance
│   │       ├── conversations/   # AI Mentor conversations
│   │       ├── history/         # User activity history
│   │       ├── mentor/          # AI chat mentor
│   │       ├── ocr/             # OCR processing
│   │       ├── resume/          # Resume analysis/feedback/PDF
│   │       ├── settings/        # User settings
│   │       ├── translator/      # Language translation
│   │       └── users/           # User profiles
│   └── web/                     # Next.js frontend
│       ├── app/                 # Pages (App Router)
│       ├── components/          # Reusable components
│       │   └── resume/          # Resume builder components
│       ├── hooks/               # Custom React hooks
│       ├── lib/                 # Utilities + config
│       └── types/               # TypeScript declarations
├── python/                      # Python scripts (OCR, PDF)
│   ├── requirements.txt
│   ├── resume_pdf.py
│   └── resume_scanner.py
├── assets/                      # Static assets
│   ├── images/                  # Diagrams, logo
│   └── screenshots/             # App screenshots
├── docker/                      # Docker configs
│   ├── Dockerfile.api
│   └── Dockerfile.web
├── docs/                        # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   └── DEPLOYMENT.md
├── .github/                     # GitHub templates + CI
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docker-compose.yml
├── package.json                 # Workspace root
├── pnpm-workspace.yaml
└── python/requirements.txt      # Python dependencies
```

---

## Quick Start

### Prerequisites

- **Node.js** 22.x
- **pnpm** 10.x (`npm install -g pnpm@10`)
- **Python** 3.11+
- **PostgreSQL** 16+ (or [Neon](https://neon.tech) serverless)
- **Groq API key** (free at [console.groq.com](https://console.groq.com))

### 1. Clone & Install

```bash
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuide-ai

# Install all dependencies
pnpm install

# Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r python/requirements.txt
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) section below).

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:deploy
```

### 4. Start Development

```bash
# Start API (NestJS) — http://localhost:8000
pnpm --filter api dev

# Start Web (Next.js) — http://localhost:3000
pnpm --filter web dev
```

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GROQ_API_KEY` | Yes | Groq AI API key for LLM inference | `gsk_your_key` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/vidyguide` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (min 16 chars) | `your_jwt_secret_min_16_chars` |
| `RESEND_API_KEY` | Yes | Resend API key for email delivery | `re_your_resend_key` |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email for Resend | `noreply@yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL (used by frontend) | `http://localhost:8000` |
| `APP_BASE_URL` | Yes | Frontend base URL | `http://localhost:3000` |
| `REDIS_URL` | No | Redis connection string (optional) | `redis://127.0.0.1:6379` |

> **Security:** Never commit `.env` to version control. All secret values are gitignored.

---

## Running in Production

### Using Docker

```bash
docker compose up --build
```

### Manual Deployment

```bash
# Build frontend
pnpm --filter web build

# Build API
pnpm --filter api build

# Start API (with Python deps)
pnpm --filter api start:prod

# Serve web
pnpm --filter web start
```

---

## API Overview

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/auth/register` | POST | Create account | No |
| `/auth/login` | POST | Sign in | No |
| `/auth/verify-otp` | POST | Verify OTP | No |
| `/auth/forgot-password` | POST | Request reset | No |
| `/auth/reset-password` | POST | Reset password | No |
| `/resume/analyze` | POST | ATS resume analysis | Yes |
| `/resume/feedback` | POST | AI resume feedback | Yes |
| `/resume/validate-role` | POST | Validate target role | No |
| `/resume/pdf` | POST | Generate PDF resume | Yes |
| `/resume` | POST | Generate AI resume | Yes |
| `/ocr/scan` | POST | OCR text extraction | Yes |
| `/mentor/chat` | POST | AI mentor streaming chat | Yes |
| `/conversations/*` | CRUD | Conversation management | Yes |
| `/career/*` | GET | Career recommendations | Yes |
| `/translator/translate` | POST | Language translation | Yes |
| `/users/profile` | GET | User profile | Yes |
| `/settings/*` | CRUD | User settings | Yes |
| `/history/*` | GET | Activity history | Yes |

See [docs/API.md](docs/API.md) for full documentation.

---

## Roadmap

- [x] Resume Builder with 5 templates and live preview
- [x] ATS Resume Review with AI feedback
- [x] AI Mentor with streaming, attachments, and voice input
- [x] Career Guidance and role validation
- [x] OCR resume scanning (PDF + images)
- [x] Multilingual translator (10+ Indian languages)
- [x] Interview preparation simulator
- [x] JWT authentication with OTP verification
- [ ] Custom domain (vidyguide.is-a.dev)
- [ ] Mobile responsive refinements
- [ ] AI-powered skill gap analysis
- [ ] Company-specific interview question banks
- [ ] Community resume templates
- [ ] Resume version history and comparison
- [ ] Integration with LinkedIn API
- [ ] Offline-first PWA support

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get involved.

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Sangineni Vamshi**

- GitHub: [@sanginenivamshi21-hub](https://github.com/sanginenivamshi21-hub)
- LinkedIn: (add your LinkedIn URL)

---

<div align="center">
  <sub>Built with ❤️ for students everywhere</sub>
</div>
