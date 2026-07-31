<div align="center">

<br/>

# VidyGuideAI

<br/>

### Your AI-Powered Career Companion

**AI Mentor** · **Resume Builder** · **Career Roadmaps** · **Interview Preparation** · **Resume Review**

<br/>

---

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-84CC16?style=flat-square)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Commits-Conventional-FE5196?style=flat-square)](https://www.conventionalcommits.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-8B5CF6?style=flat-square)](CONTRIBUTING.md)

<br/>

[📖 **Documentation**](docs/ARCHITECTURE.md) ·
[🔌 **API Reference**](docs/API.md) ·
[🤝 **Contributing**](CONTRIBUTING.md) ·
[🔒 **Security**](SECURITY.md)

<br/>

<img src="assets/screenshots/dashboard.jpg" alt="VidyGuideAI Dashboard" width="780" style="border-radius: 16px; border: 1px solid #1e293b;" />

<br/>

*Build your career with AI.*

</div>

<br/>

---

## Table of Contents

- [The Problem](#the-problem)
- [Features](#features)
- [Screenshots](#screenshots)
- [Why VidyGuideAI?](#why-vidyguideai)
- [Metrics](#metrics)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [AI Architecture](#ai-architecture)
- [Performance](#performance)
- [Mobile Experience](#mobile-experience)
- [Security](#security)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem

Students and early-career professionals face a fragmented job preparation landscape:

- **No unified platform** for resumes, interviews, and career guidance
- **Generic advice** that doesn't adapt to individual backgrounds
- **Outdated tools** that ignore ATS systems and modern hiring practices
- **Language barriers** for non-English speakers

VidyGuideAI solves this with an **all-in-one AI-powered career platform** that adapts to your background, speaks your language, and provides real-time, personalized guidance.

---

## Features

| Module | Capabilities |
|--------|-------------|
| **🤖 AI Mentor** | Real-time streaming chat with Groq AI, file attachments (drag & drop, paste), voice input, keyboard shortcuts, conversation search/pin/rename, markdown rendering |
| **📄 Resume Builder** | 10-step guided wizard with 5 ATS-optimized templates, role-specific skill suggestions, live preview, auto-save, quality checks, PDF export |
| **🔍 Resume Review** | One-click ATS scoring, keyword analysis, formatting audit, grammar suggestions, missing skills detection, AI coach feedback, enhanced resume generation |
| **🧭 Career Guidance** | AI-driven role validation, industry-specific recommendations, personalized career roadmaps with visual timelines |
| **💼 Interview Prep** | Mock technical + behavioral interviews with role-specific questions, AI-generated feedback, performance tracking |
| **📷 OCR Scanner** | Extract text from PDF and image resumes using EasyOCR with Tesseract fallback |
| **🌐 Translator** | Translate career content between English and 10+ Indian languages (Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati) |
| **📊 Dashboard** | Central intelligence hub with streaks, XP, weekly progress, quick actions, activity timeline, achievement badges |
| **⚙️ Settings** | Theme (dark/light/system), accent color, AI model selection, voice configuration, speech rate/pitch |
| **🔐 Authentication** | Email/password registration with OTP verification, JWT cookie-based sessions, forgot/reset password, guest mode |

---

## Screenshots

<div align="center">

### Dashboard
<img src="assets/screenshots/dashboard.jpg" alt="Dashboard" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>The central intelligence hub — streaks, XP, weekly progress, quick actions, activity timeline, and achievement badges at a glance.</sub>

<br/>
<br/>

### AI Mentor
<img src="assets/screenshots/ai-mentor.jpg" alt="AI Mentor" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>Real-time streaming chat with Groq AI (LLaMA 3 70B). Supports file attachments, voice input, markdown rendering, and conversation management.</sub>

<br/>
<br/>

### AI Mentor (Mobile)
<img src="assets/screenshots/ai-mentor-mobile.jpeg" alt="AI Mentor Mobile" width="350" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>Fully responsive mobile experience with sticky composer, voice recording, and bottom tab navigation.</sub>

<br/>
<br/>

### Resume Builder
<img src="assets/screenshots/resume-builder.jpg" alt="Resume Builder" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>10-step guided wizard with 5 ATS-optimized templates, role-specific skill suggestions, live preview, and auto-save.</sub>

<br/>
<br/>

### Resume Review
<img src="assets/screenshots/resume-feedback.jpg" alt="Resume Review" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>One-click ATS scoring, keyword analysis, formatting audit, grammar suggestions, and AI-powered feedback.</sub>

<br/>
<br/>

### Career Guidance
<img src="assets/screenshots/career-guidance.jpg" alt="Career Guidance" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>AI-driven role validation, industry-specific recommendations, and personalized career roadmaps with visual timelines.</sub>

<br/>
<br/>

### Interview Prep
<img src="assets/screenshots/interview-prep.jpg" alt="Interview Prep" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>Mock technical and behavioral interviews with role-specific questions, AI-generated feedback, and performance tracking.</sub>

<br/>
<br/>

### Translator
<img src="assets/screenshots/translator.jpg" alt="Translator" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>Translate career content between English and 10+ Indian languages. Real-time translation with context-aware phrasing.</sub>

<br/>
<br/>

### History
<img src="assets/screenshots/history.jpg" alt="History" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>Complete activity and conversation log with search, filter, and timeline views.</sub>

<br/>
<br/>

### Settings
<img src="assets/screenshots/settings.jpg" alt="Settings" width="780" style="border-radius: 12px; border: 1px solid #1e293b;" />
<br/>
<sub>Theme (dark/light/system), accent color picker, AI model selection, voice configuration, and speech rate/pitch controls.</sub>

</div>

---

## Why VidyGuideAI?

| Feature | VidyGuideAI | Traditional Platforms |
|---------|------------|---------------------|
| **AI Mentor** | Real-time streaming with Groq, Gemini, GPT fallback | Usually static Q&A or forums |
| **Resume Builder** | 5 ATS-optimized templates, AI skill suggestions, live preview | Basic templates, no intelligence |
| **Resume Review** | Automated ATS scoring + AI feedback in one click | None or paid manual review |
| **Career Guidance** | Personalized roadmaps based on your background | Generic blog posts |
| **Interview Prep** | AI-powered mock interviews with scoring | Static question banks |
| **Language Support** | 10+ Indian languages with context-aware translation | English-only |
| **OCR Scanner** | Extract text from PDFs and images (EasyOCR + Tesseract) | Not available |
| **Real-time Streaming** | Token-by-token AI responses via SSE | Response-after-wait |
| **Offline Cache** | Conversations work offline with localStorage | Online-only |
| **Pricing** | **Free** — No subscription required | $10–50/month |

---

## Metrics

<div align="center">

| | |
|---|---|
| **23+ Pages** | Full-featured application |
| **18+ API Endpoints** | RESTful NestJS backend |
| **3 AI Providers** | Groq · Gemini · OpenRouter with automatic fallback |
| **10+ Languages** | Indian language support for translation |
| **5 ATS Templates** | Resume builder with live preview |
| **105 kB** | Shared JavaScript bundle (tree-shaken) |
| **2 Microservices** | Web (Next.js) + API (NestJS) |
| **1 Python Service** | OCR + PDF generation |
| **Monorepo** | pnpm workspace with shared config |

</div>

---

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | SSR, Streaming, PWA |
| **UI** | React 19 + Tailwind CSS 4 | Component framework, styling |
| **Animation** | Framer Motion + OGL (WebGL) | UI animations, 3D visuals |
| **Icons** | Lucide React | Consistent icon set |
| **Backend** | NestJS 11 | Modular API gateway |
| **Database** | PostgreSQL 16 + Prisma 5.21 | Relational data, ORM |
| **AI (Primary)** | Groq (LLaMA 3 70B) | Fastest inference, reasoning |
| **AI (Fallback 1)** | Gemini 1.5 Flash | Free tier, high rate limits |
| **AI (Fallback 2)** | OpenRouter (GPT-4o-mini) | Broad model selection |
| **Auth** | JWT (http-only cookies) + bcryptjs | Secure sessions |
| **OCR** | EasyOCR (PyTorch) + Tesseract | Text extraction |
| **PDF** | ReportLab (Python) | Resume PDF generation |
| **Email** | Brevo (Sendinblue) API | OTP, notifications |
| **Storage** | Cloudinary | File uploads |
| **Cache** | Upstash Redis | Session, rate limiting |
| **Infrastructure** | Docker Compose | Containerization |
| **CI/CD** | GitHub Actions | Automated builds |

</div>

---

## Architecture

<img src="assets/images/architecture.svg" alt="VidyGuideAI Architecture Diagram" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" />

### Key Design Decisions

- **Provider Factory Pattern** — AI providers are abstracted behind a strategy pattern. If Groq fails, the system automatically falls back to Gemini, then OpenRouter. Zero downtime for your AI features.
- **Real-time Streaming** — All AI responses stream via SSE (Server-Sent Events). Users see responses token-by-token, not after a long wait.
- **Memory Layer** — User context is persisted across conversations and used to personalize every response. The AI remembers your background, skills, and goals.
- **JWT Auth** — HTTP-only cookies with automatic refresh. Guest mode for exploration without sign-up.
- **Offline Cache** — Conversations and user data cached locally. Core functionality works even with intermittent connectivity.

---

## Project Structure

```
VidyGuide-ai/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── prisma/                    # Schema + migrations
│   │   └── src/
│   │       ├── auth/                  # Authentication module (JWT, OTP)
│   │       ├── career/                # Career guidance & roadmaps
│   │       ├── conversations/         # AI Mentor conversation CRUD
│   │       ├── history/               # Activity history tracking
│   │       ├── mentor/                # AI streaming chat (SSE)
│   │       ├── ocr/                   # OCR text extraction
│   │       ├── resume/                # Analysis, feedback, PDF generation
│   │       ├── settings/              # User settings & preferences
│   │       ├── translator/            # Language translation service
│   │       └── users/                 # User profiles & management
│   └── web/                           # Next.js frontend
│       ├── app/                       # Pages (App Router)
│       ├── components/                # Reusable UI components
│       │   ├── mobile/                # Mobile shell & navigation
│       │   └── resume/                # Resume builder components
│       ├── hooks/                     # Custom React hooks
│       ├── lib/                       # Utilities, API clients, config
│       └── types/                     # TypeScript declarations
├── python/                            # Python scripts
│   ├── requirements.txt
│   ├── resume_pdf.py                  # ReportLab PDF generation
│   └── resume_scanner.py              # EasyOCR + Tesseract
├── assets/                            # Static assets
│   ├── images/                        # Diagrams, logo, screenshots
│   └── screenshots/                   # App screenshots
├── docker/                            # Docker configs
├── docs/                              # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   └── DEPLOYMENT.md
├── .github/                           # CI/CD, issue templates
│   └── workflows/ci.yml
├── docker-compose.yml
└── package.json                       # pnpm workspace root
```

---

## Quick Start

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22.x | Required |
| pnpm | 10.x | `npm install -g pnpm@10` |
| Python | 3.11+ | For OCR + PDF generation |
| PostgreSQL | 16+ | Or [Neon](https://neon.tech) serverless |
| Groq API Key | Free | Get at [console.groq.com](https://console.groq.com) |

### Installation

```bash
# Clone the repository
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuide-ai

# Install all dependencies
pnpm install

# Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r python/requirements.txt
```

### Environment Setup

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GROQ_API_KEY` | Yes | Groq AI API key | `gsk_your_key` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/vidyguide` |
| `JWT_SECRET` | Yes | JWT signing secret (min 16 chars) | `your_jwt_secret_min_16_chars` |
| `BREVO_API_KEY` | Yes | Brevo email API key | `your_brevo_api_key` |
| `BREVO_SENDER_EMAIL` | Yes | Verified sender email | `your-sender@example.com` |
| `API_PROXY_TARGET` | Yes* | Backend origin proxied by the Next.js `/api/*` rewrite (web only; defaults to `https://vidyguideai-api.onrender.com`) | `http://localhost:8000` |
| `APP_BASE_URL` | Yes | Frontend base URL | `http://localhost:3000` |
| `GEMINI_API_KEY` | No | Gemini API key (fallback) | `your_gemini_key` |
| `OPENROUTER_API_KEY` | No | OpenRouter key (fallback) | `your_openrouter_key` |
| `REDIS_URL` | No | Redis connection string | `redis://127.0.0.1:6379` |

> **Security:** Never commit `.env` to version control. All secret values are gitignored.

### Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:deploy
```

### Start Development

```bash
# Terminal 1 — API (NestJS) → http://localhost:8000
pnpm --filter api dev

# Terminal 2 — Web (Next.js) → http://localhost:3000
pnpm --filter web dev
```

### Production Build

```bash
# Build everything
pnpm build

# Run with Docker
docker compose up --build
```

---

## AI Architecture

### Provider Factory with Automatic Fallback

```
                    ┌─────────────────────────┐
                    │   AI Service (NestJS)    │
                    │  ┌───────────────────┐  │
                    │  │  Provider Factory  │  │
                    │  └────────┬──────────┘  │
                    │           │              │
                    └───────────┼──────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Groq (Primary) │  │  Gemini 1.5      │  │  OpenRouter      │
│   LLaMA 3 70B    │  │  Flash           │  │  GPT-4o-mini     │
│                   │  │                  │  │                   │
│  ▲ Fastest        │  │  ▲ Free tier      │  │  ▲ Broad model   │
│  ▲ Best reasoning │  │  ▲ High rate limit│  │  │  selection      │
│  └ Rate limited   │  │  └ Good fallback  │  │  └ Paid per use   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
                   ┌──────────────────────┐
                   │  Streaming Response   │
                   │  (Server-Sent Events) │
                   └──────────────────────┘
```

- **Primary:** Groq (LLaMA 3 70B) — fastest inference, strongest reasoning
- **Fallback 1:** Gemini 1.5 Flash — free tier, high rate limits
- **Fallback 2:** OpenRouter (GPT-4o-mini) — broad model selection
- **Failure Mode:** If all providers fail, the user sees a friendly error with retry option. No data loss — conversations are saved.

### Streaming Architecture

```
User Message → API → AI Provider → Token Stream → SSE → React State → UI Update
```

AI responses use **Server-Sent Events** (SSE) for real-time token-by-token streaming. The frontend processes each chunk via `ReadableStream` and updates the message content incrementally. A blinking cursor indicates active streaming.

### Memory System

User context is persisted across sessions:

- **Per-user memory** — Background, skills, education, goals
- **Conversation context** — Last N messages sent with each request
- **Automatic injection** — Memory prepended to AI prompts as context

---

## Performance

| Optimization | Implementation |
|-------------|----------------|
| **Server-Side Rendering** | All pages pre-rendered on the server for fast initial loads |
| **Streaming SSR** | AI responses stream via SSE — no blocking |
| **Lazy Loading** | Markdown renderer, heavy components loaded on demand |
| **Route Prefetching** | Next.js automatically prefetches visible links |
| **Optimized Bundle** | 105 kB shared JS — tree-shaken, code-split |
| **Image Optimization** | Next.js Image component with automatic WebP |
| **Offline Cache** | Conversations and user data cached in localStorage |
| **Debounced State** | Chat composer, search inputs debounced to reduce renders |

---

## Mobile Experience

| Feature | Details |
|---------|---------|
| **Responsive Design** | Fully adaptive layout from 320px to 4K displays |
| **Touch-Friendly** | All interactive elements ≥44px tap targets |
| **Bottom Tab Bar** | Core destinations always one tap away |
| **Drawer Navigation** | Full sidebar for secondary sections |
| **Voice Recording** | Native microphone integration for chat input |
| **Camera Capture** | Take photos of documents directly |
| **Sticky Composer** | Chat input always accessible at bottom |
| **Safe Area Support** | Proper notch and home indicator handling |
| **PWA Ready** | Manifest, service worker, offline fallback |

---

## Security

| Practice | Implementation |
|----------|---------------|
| **Authentication** | JWT stored in HTTP-only cookies — XSS resistant |
| **Password Security** | bcryptjs hashing with salt rounds |
| **Input Validation** | class-validator + Zod schemas on all endpoints |
| **Rate Limiting** | @nestjs/throttler protects API endpoints |
| **Helmet Headers** | Security headers set on all responses |
| **CORS** | Strict origin validation |
| **Provider Isolation** | API keys never exposed to the frontend |
| **Environment Variables** | All secrets managed via `.env`, gitignored |
| **OTP Verification** | Email-based verification for new accounts |

---

## API Overview

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/auth/register` | POST | Create account | No |
| `/auth/login` | POST | Sign in | No |
| `/auth/verify-otp` | POST | Verify OTP | No |
| `/auth/forgot-password` | POST | Request password reset | No |
| `/auth/reset-password` | POST | Reset password | No |
| `/resume/analyze` | POST | ATS resume analysis | Yes |
| `/resume/feedback` | POST | AI resume feedback | Yes |
| `/resume/validate-role` | POST | Validate target role | No |
| `/resume/pdf` | POST | Generate PDF resume | Yes |
| `/resume` | POST | Generate AI resume | Yes |
| `/ocr/scan` | POST | OCR text extraction | Yes |
| `/mentor/chat` | POST | AI mentor streaming chat | Yes |
| `/conversations` | CRUD | Conversation management | Yes |
| `/career/*` | GET | Career recommendations | Yes |
| `/translator/translate` | POST | Language translation | Yes |
| `/users/profile` | GET | User profile | Yes |
| `/settings/*` | CRUD | User settings | Yes |
| `/history/*` | GET | Activity history | Yes |

See [docs/API.md](docs/API.md) for complete API documentation.

---

## Deployment

### Deploy to Render + Neon

```bash
# 1. Set up PostgreSQL at neon.tech
# 2. Deploy API to Render
#    - Build command: pnpm --filter api build
#    - Start command: pnpm --filter api start:prod
#    - Set environment variables in Render dashboard
# 3. Deploy frontend to Render (Static Site) or Vercel
#    - Build command: pnpm --filter web build
#    - Publish directory: apps/web/.next
```

### Docker

```bash
docker compose up --build
```

Environment variables are managed via `.env` in development and Render's dashboard in production.

---

## Roadmap

### Completed

- [x] Resume Builder with 5 ATS-optimized templates and live preview
- [x] Resume Review with unified ATS scoring and AI feedback
- [x] AI Mentor with streaming, file attachments, and voice input
- [x] Career Guidance and role validation
- [x] OCR resume scanning (PDF + images)
- [x] Multilingual translator (10+ Indian languages)
- [x] Interview preparation simulator
- [x] JWT authentication with OTP verification
- [x] Dashboard with streaks, XP, and progress tracking
- [x] Mobile-responsive design
- [x] Dark/light/system theme with accent colors
- [x] PWA support with offline cache
- [x] Docker deployment

### Upcoming

- [ ] AI-powered skill gap analysis
- [ ] Company-specific interview question banks
- [ ] Community resume templates
- [ ] Resume version history and comparison
- [ ] LinkedIn API integration
- [ ] Offline-first PWA with full service worker
- [ ] Custom domain (vidyguide.is-a.dev)

---

## Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** — Open an issue with a clear title and reproduction steps
2. **Suggest features** — Open a feature request issue
3. **Submit PRs** — Follow the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines
4. **Improve docs** — Fix typos, add examples, clarify instructions

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

### Built with ❤️ by [Sangineni Vamshi](https://github.com/sanginenivamshi21-hub)

[![GitHub](https://img.shields.io/badge/GitHub-@sanginenivamshi21--hub-181717?style=flat-square&logo=github)](https://github.com/sanginenivamshi21-hub)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Vamshi_Sangineni-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/vamshi-sangineni)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=flat-square&logo=gmail)](mailto:vamshi@example.com)

<sub>Empowering students with AI-driven career guidance — because everyone deserves a mentor.</sub>

</div>
