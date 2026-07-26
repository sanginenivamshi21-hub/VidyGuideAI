# Changelog

All notable changes to VidyGuideAI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.2] - 2026-07-26

### Fixed
- Authentication session persistence: login cookies were not set due to missing `{ tokens: ... }` wrapper in auth service login response
- Replaced `console.error` with structured `Logger` in OCR and Resume controllers
- Moved `@types/nodemailer` from `dependencies` to `devDependencies`

### Changed
- Replaced hardcoded `http://localhost:8000` API URLs with `API_BASE` constant from `lib/api.ts` across all frontend pages
- Consolidated and renamed all screenshots to professional lowercase filenames
- Full rewrite of README, ARCHITECTURE.md, API.md, DEPLOYMENT.md, and CONTRIBUTING.md
- Removed empty `services/` and `styles/` directories
- Removed unused imports from dashboard and sidebar components

---

## [3.1.1] - 2026-07-26

### Added
- Full settings synchronization with backend API
- Accent color customization across entire UI
- Notification preferences system
- Profile picture upload with Cloudinary integration
- Account data export as JSON

### Changed
- Migrated from Tailwind CSS v3 to v4
- Global accent color variables for theme consistency

---

## [3.0.0] - 2026-07-25

### Added
- Complete V3 architecture: Next.js 15 + NestJS 11 + PostgreSQL
- pnpm monorepo workspace structure
- JWT authentication with HTTP-only cookies, OTP verification, forgot/reset password
- AI Mentor chat with server-sent event streaming
- Interview preparation simulator with feedback
- Multilingual translator (10+ Indian languages)
- Career guidance and roadmap generation
- ATS resume builder, feedback analyzer, and PDF export
- OCR scanner (PDF/image text extraction via Tesseract)
- Conversation management with pinning and search
- Full interaction history audit trail
- User settings with theme, accent, model, and voice configuration
- Keyboard shortcuts throughout the application

### Security
- Helmet headers for API security
- Rate limiting (60 requests per minute)
- bcryptjs password hashing
- JWT access + refresh token rotation

### Infrastructure
- Docker Compose for full-stack orchestration
- GitHub Actions CI pipeline
- Prisma ORM with PostgreSQL migrations

---

## [0.2.0] - 2026-07-26

### Added
- GitHub Actions CI workflow
- Issue and PR templates
- Documentation files (ARCHITECTURE.md, CONTRIBUTING.md, SECURITY.md)

### Fixed
- Wiped all leaked API keys from git history
- Various backend syntax fixes

---

## [0.1.0] - 2026-03-09

### Added
- Initial prototype: Streamlit frontend + FastAPI backend + SQLite
- Basic resume scanner and PDF export
