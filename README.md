<div align="center">

# 🌿 VidyGuideAI

**AI-powered localized career counseling platform for Indian students**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-llama3-FF6600?style=for-the-badge)](https://groq.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-3DDC84?style=for-the-badge)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge)](https://github.com/sanginenivamshi21-hub/VidyGuideAI/actions)

<sub>Empowering 250M+ Indian students with AI-driven career guidance in 10+ regional languages</sub>

<br/>

[✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Quick Start](#-quick-start) • [📖 API Docs](#-api-docs) • [🐳 Docker](#-docker) • [📸 Screenshots](#-screenshots) • [🗺️ Roadmap](#️-roadmap)

</div>

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **🔐 Auth** | JWT-based registration/login, OTP verification via SMTP, forgot/reset password, guest access |
| **🎯 Career Guidance** | Personalized 10th/12th/ITI/diploma/graduate recommendations with detailed roadmaps |
| **🗺️ Career Roadmap** | Visual timeline with scroll-triggered milestone animations |
| **📝 Resume Builder** | ATS-compliant plaintext resumes via Groq AI + ReportLab PDF export |
| **📄 Resume Feedback** | ATS scoring with section-by-section improvement suggestions |
| **🖨️ PDF Export** | Professional PDF generation via ReportLab with Indian formatting |
| **🔍 OCR Scanner** | Text extraction from PDF/images via EasyOCR + Tesseract |
| **🤖 AI Mentor** | Regional language counseling (10+ Indian languages) with conversation history |
| **🎤 Voice Mentor** | Speech-to-text Q&A with Groq AI + browser SpeechSynthesis |
| **🌐 Translator** | Career article translation across English + 10 Indian dialects |
| **💼 Interview Prep** | Mock technical/behavioral interviews for top Indian companies |
| **📊 Dashboard** | Usage analytics, interaction stats, and progress tracking |
| **📜 History** | Complete audit trail of all user interactions with search & delete |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js 15 Frontend                    │
│  (React 19, Tailwind CSS 4, Framer Motion, Lucide Icons)  │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTP/JSON with credentials (cookies)
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   NestJS 11 API Gateway                    │
│   Helmet · CORS · Rate Limiting · Validation · JWT Auth   │
├──────────────────────────────────────────────────────────┤
│  Auth │ Career │ Resume │ Mentor │ OCR │ Translator       │
│  Users │ History │ Voice │ AI │ Mail │ Prisma Service     │
└───────┬──────────────────────────────────────┬───────────┘
        │                                      │
        ▼                                      ▼
┌──────────────────┐              ┌────────────────────────┐
│   PostgreSQL 16   │              │   Groq AI (LLaMA 3)    │
│   + Prisma ORM    │              │   + SMTP (Nodemailer)  │
│   + Redis Cache   │              │   + Cloudinary Files   │
└──────────────────┘              └────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.1 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide React |
| **Backend** | NestJS 11, TypeScript, Passport JWT, Helmet, Throttler |
| **Database** | PostgreSQL 16, Prisma ORM 5.21, Redis 7 |
| **AI/ML** | Groq SDK (llama3-70b, llama3-8b), EasyOCR, Tesseract |
| **Infrastructure** | pnpm workspaces, Docker, GitHub Actions |
| **Security** | Helmet headers, Rate limiting (60 req/min), CORS, bcryptjs, JWT access + refresh tokens |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- PostgreSQL 16
- Redis 7 (optional, for rate limiting)
- Groq API key ([get one free](https://console.groq.com/))

### Local Development

```bash
# 1. Clone
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuideAI

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials (Groq API key, SMTP, DB URL)

# 4. Database setup
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# 5. Start development servers
pnpm run dev
# API: http://localhost:8000
# Web: http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Groq AI API key |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 16 chars) |
| `SMTP_HOST` | ✅ | SMTP server host |
| `SMTP_USER` | ✅ | SMTP email address |
| `SMTP_PASS` | ✅ | SMTP app password |
| `APP_BASE_URL` | ❌ | Base URL for email links |
| `NEXT_PUBLIC_API_URL` | ❌ | API URL (default http://localhost:8000) |
| `REDIS_URL` | ❌ | Redis connection string |

## 🐳 Docker

```bash
# Build and run all services (PostgreSQL + Redis + API + Web)
docker compose up --build

# Individual services
docker compose up -d postgres redis
docker compose up api
docker compose up web
```

> **Note:** Set required env vars (GROQ_API_KEY, SMTP_*) before running Docker.

## 📖 API Docs

Full API documentation: [`docs/API.md`](docs/API.md)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | - | Register new user |
| `/auth/login` | POST | - | Login (returns JWT cookies) |
| `/auth/verify-otp` | POST | - | Verify OTP |
| `/auth/forgot-password` | POST | - | Request password reset |
| `/auth/reset-password` | POST | - | Reset password with OTP |
| `/auth/logout` | POST | - | Clear auth cookies |
| `/career` | POST | ✅ | Career suggestions |
| `/career/roadmap` | POST | ✅ | Career roadmap |
| `/resume` | POST | ✅ | Generate resume |
| `/resume/feedback` | POST | ✅ | ATS feedback |
| `/resume/pdf` | POST | ✅ | PDF export |
| `/ocr/scan` | POST | ✅ | OCR text extraction |
| `/mentor` | POST | ✅ | AI mentor chat |
| `/mentor/interview` | POST | ✅ | Mock interview |
| `/translator` | POST | ✅ | Text translation |
| `/voice/widget` | GET | - | Voice widget HTML |
| `/users/profile` | GET/PUT | ✅ | User profile |
| `/history` | GET/POST/DELETE | ✅ | Interaction history |

## 📂 Project Structure

```
VidyGuideAI/
├── apps/
│   ├── api/                  # NestJS backend (18 modules)
│   │   ├── prisma/           # Schema & migrations
│   │   ├── src/
│   │   │   ├── auth/         # JWT, OTP, guards, strategies
│   │   │   ├── career/       # Career guidance & roadmaps
│   │   │   ├── common/       # Shared services
│   │   │   ├── config/       # Env validation
│   │   │   ├── database/     # Prisma service
│   │   │   ├── history/      # User audit trail
│   │   │   ├── mail/         # SMTP email service
│   │   │   ├── mentor/       # AI mentor & interview
│   │   │   ├── ocr/          # Resume scanning
│   │   │   ├── resume/       # Resume & PDF generation
│   │   │   ├── translator/   # Language translation
│   │   │   ├── users/        # Profile management
│   │   │   └── voice/        # Voice widget
│   │   └── test/             # E2E tests
│   └── web/                  # Next.js frontend
│       ├── app/              # 15 pages (App Router)
│       └── components/       # Shared components
├── docker/                   # Dockerfiles
├── docs/                     # Documentation
├── .github/                  # CI/CD & templates
├── .env.example              # Environment template
├── docker-compose.yml        # Full stack orchestration
└── pnpm-workspace.yaml       # Monorepo config
```

## 📸 Screenshots

> Screenshots are available in [`docs/screenshots/`](docs/screenshots/)

| Page | Description |
|------|-------------|
| Auth | Login, register, OTP, forgot/reset password flows |
| Dashboard | Usage stats, quick-launch cards |
| Career | Form inputs, AI-generated guidance |
| Resume Builder | ATS-compatible resume generation |
| Resume Feedback | ATS scoring with improvement suggestions |
| AI Mentor | Multi-language chat interface |
| Voice Mentor | Speech-based Q&A widget |
| Interview Prep | Mock interview simulator |

## 🧪 Testing

```bash
# API tests
cd apps/api
pnpm test

# Web build validation
cd apps/web
pnpm build
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Report bugs via [GitHub Issues](https://github.com/sanginenivamshi21-hub/VidyGuideAI/issues)
- Submit fixes via [Pull Requests](https://github.com/sanginenivamshi21-hub/VidyGuideAI/pulls)
- View our [Code of Conduct](CODE_OF_CONDUCT.md)

## 🗺️ Roadmap

- [x] V3 Architecture (NestJS + Next.js + PostgreSQL)
- [x] JWT Auth with OTP verification
- [x] Groq AI integration (resume, mentor, career)
- [x] PDF export via ReportLab
- [x] OCR engine (EasyOCR + Tesseract)
- [x] 10+ Indian language support
- [x] Mock interview system
- [x] Voice mentor (speech synthesis)
- [ ] OAuth (Google/GitHub login)
- [ ] Admin dashboard
- [ ] pgvector semantic search
- [ ] CI/CD production pipeline
- [ ] Mobile-responsive PWA

## 📄 License

MIT © [Vamshi Sangineni](https://github.com/sanginenivamshi21-hub)

---

<div align="center">
  <sub>Built with ❤️ and <a href="https://groq.com/">Groq AI</a> · 
  <a href="https://nextjs.org/">Next.js</a> · 
  <a href="https://nestjs.com/">NestJS</a> · 
  <a href="https://www.prisma.io/">Prisma</a></sub>
</div>
