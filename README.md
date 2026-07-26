<div align="center">

# 🌿 VidyGuideAI

**AI-powered localized career counseling platform for Indian students**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-llama3-FF6600?style=for-the-badge)](https://groq.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-3DDC84?style=for-the-badge)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=for-the-badge)](https://github.com/sanginenivamshi21-hub/VidyGuideAI/actions)

<br/>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Overview](#-api-overview) • [Documentation](#-documentation) • [Roadmap](#-roadmap)

</div>

---

VidyGuideAI bridges the gap between raw student profiles and the unique demands of the Indian educational and professional landscape. It provides tailored academic routing, ATS-optimized resume building, OCR scanning, AI mentorship in regional languages, and career guidance aligned with Indian tech giants, civil services, and PSUs.

## ✨ Features

| Module | Description |
|--------|-------------|
| **🔐 Auth** | JWT-based registration, login, OTP verification, forgot/reset password |
| **🎯 Career Guidance** | Personalized recommendations for 10th/12th/ITI/diploma/graduates |
| **🗺️ Career Roadmap** | Visual milestone timeline for academic and career paths |
| **📝 Resume Builder** | ATS-compliant plaintext resume generation with Groq AI |
| **📄 Resume Feedback** | ATS scoring and detailed section-by-section improvement suggestions |
| **🖨️ PDF Export** | Professional PDF generation via ReportLab |
| **🔍 OCR Scanner** | Text extraction from PDF/image resumes (EasyOCR + Tesseract) |
| **🤖 AI Mentor** | Regional language career counseling (10+ Indian languages) |
| **🎤 Voice Mentor** | Speech-based Q&A with real-time audio responses |
| **🌐 Translator** | Career article translation across 10+ Indian dialects |
| **💼 Interview Prep** | Mock technical/behavioral interviews for Indian companies |
| **📊 Dashboard** | Usage analytics and progress tracking |
| **📜 History** | Complete audit trail of all user interactions |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 Frontend                   │
│  (React 19, Tailwind CSS, Framer Motion, lucide-react)   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP (JSON) / Cookies
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS 11 API Gateway                  │
│  (JWT Auth, Validation, CORS, Rate Limiting)             │
├─────────────────────────────────────────────────────────┤
│  Auth   Career   Resume   Mentor   OCR   Translator     │
│  Users  History  Voice    AI       Mail  Settings       │
└───────┬──────────────────────────────────────┬──────────┘
        │                                      │
        ▼                                      ▼
┌──────────────┐                  ┌──────────────────────┐
│  PostgreSQL   │                  │     Groq AI (LLaMA)  │
│  + Prisma ORM │                  │  + Cloudinary Files  │
└──────────────┘                  └──────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.1, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | NestJS 11, TypeScript, Passport JWT |
| **Database** | PostgreSQL 16, Prisma ORM 5.21 |
| **AI** | Groq SDK (llama3-70b, llama3-8b) |
| **Email** | Nodemailer (SMTP) |
| **OCR** | EasyOCR, Tesseract, pypdf, pdf2image |
| **PDF** | ReportLab |
| **Auth** | JWT (access + refresh tokens), bcryptjs, OTP |
| **DevOps** | pnpm workspaces, Docker, GitHub Actions |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18, pnpm, PostgreSQL 16, Redis

### Setup

```bash
# Clone
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuideAI

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Database
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# Build
pnpm --filter api build
pnpm --filter web build

# Run (development)
pnpm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 16 chars) |
| `GROQ_API_KEY` | Groq AI API key |
| `SMTP_HOST` | SMTP server host |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP app password |
| `CLIENT_URL` | Frontend URL (default: localhost:3000) |
| `CLOUDINARY_URL` | Cloudinary URL (optional) |

## 📘 API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login (returns JWT cookies) |
| `/auth/verify-otp` | POST | Verify OTP (register/login) |
| `/auth/forgot-password` | POST | Request password reset |
| `/auth/reset-password` | POST | Reset password with OTP |
| `/auth/logout` | POST | Clear auth cookies |
| `/resume` | POST | Generate resume via AI |
| `/resume/feedback` | POST | Get ATS feedback |
| `/resume/pdf` | POST | Export resume as PDF |
| `/ocr/scan` | POST | OCR extract text from file |
| `/career` | POST | Get career suggestions |
| `/career/roadmap` | POST | Generate career roadmap |
| `/mentor` | POST | Ask AI mentor |
| `/mentor/interview` | POST | Start mock interview |
| `/mentor/interview/feedback` | POST | Get interview feedback |
| `/translator` | POST | Translate text |
| `/voice/widget` | GET | Voice widget HTML |
| `/users/profile` | GET/PUT | User profile |
| `/history` | GET/POST/DELETE | Interaction history |

Full API documentation: [docs/API.md](docs/API.md)

## 📂 Project Structure

```
VidyGuideAI/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/             # Schema & migrations
│   │   ├── src/
│   │   │   ├── auth/           # JWT auth, OTP, guards
│   │   │   ├── career/         # Career guidance
│   │   │   ├── common/         # Cloudinary service
│   │   │   ├── config/         # Env validation
│   │   │   ├── database/       # Prisma service
│   │   │   ├── history/        # User audit trail
│   │   │   ├── mail/           # Email (SMTP)
│   │   │   ├── mentor/         # AI mentor chat
│   │   │   ├── ocr/            # Resume scanner
│   │   │   ├── resume/         # Resume + PDF
│   │   │   ├── translator/     # Language translation
│   │   │   ├── users/          # Profile management
│   │   │   └── voice/          # Voice widget
│   │   └── test/
│   └── web/                    # Next.js frontend
│       ├── app/                # Pages (19 routes)
│       ├── components/         # Shared UI components
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utilities & config
│       ├── services/           # API client services
│       ├── styles/             # Global styles
│       └── types/              # TypeScript definitions
├── docker/                     # Dockerfiles
├── docs/                       # Documentation
├── .github/                    # CI/CD, templates
├── resume_pdf.py               # PDF generation
└── resume_scanner.py           # OCR engine
```

## 📸 Screenshots

> Screenshots are available in [`docs/screenshots/`](docs/screenshots/)

## 🗺️ Roadmap

- [x] V3 Monorepo (NestJS + Next.js + PostgreSQL)
- [x] JWT Auth with OTP verification
- [x] Groq AI integration (resume, mentor, career)
- [x] PDF export via ReportLab
- [x] OCR engine (EasyOCR + Tesseract)
- [x] Regional language support (10+ languages)
- [x] Mock interview system
- [x] Voice mentor (speech synthesis)
- [ ] OAuth (Google/GitHub login)
- [ ] Admin dashboard
- [ ] pgvector semantic search
- [ ] CI/CD production pipeline
- [ ] Mobile responsive PWA

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and contribution guidelines.

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Credits

Built with [Groq AI](https://groq.com/), [Next.js](https://nextjs.org/), [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), and many other open-source tools.
