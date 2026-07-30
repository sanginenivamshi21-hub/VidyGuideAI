# Changelog

All notable changes to VidyGuideAI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-30

### Added
- AI Mentor chat with server-sent event streaming
- Interview preparation simulator with feedback
- Multilingual translator (10+ Indian languages)
- Career guidance and roadmap generation
- ATS resume builder, feedback analyzer, and PDF export
- OCR scanner (PDF/image text extraction)
- Conversation management with pinning and search
- Full interaction history audit trail
- User settings with theme, accent, model, and voice configuration
- JWT authentication with HTTP-only cookies, OTP verification, forgot/reset password
- User dashboard with activity statistics
- Profile management with picture upload
- Account data export and deletion
- Brevo email integration for OTP and password reset
- Mobile-responsive UI with sidebar navigation
- Keyboard shortcuts throughout the application
- GitHub Actions CI pipeline
- Prisma ORM with PostgreSQL

### Improved
- Session management with refresh token rotation
- Production stability across all auth flows
- Mobile UI layout and responsive design
- API wrapper with automatic 401 retry

### Fixed
- `/auth/me` now fetches full user data from database (fullName, profilePicture, isVerified)
- `refreshUser()` fetches from API instead of stale localStorage
- Profile picture upload/deletion syncs with auth context
- Login and verify-otp responses include fullName
- Dashboard greeting uses correct fullName

---

## [3.2.0] - 2026-07-29

### Added
- Social preview image (`social-preview.svg`) for GitHub sharing
- Professional architecture SVG diagram with emerald accent theme
- Metrics section in README (23+ pages, 18+ endpoints, 3 AI providers)
- "Why VidyGuideAI?" comparison table vs traditional platforms
- Full-width screenshot sections with descriptive captions
- GitHub badges (conventional commits, PRs welcome, license)
- Table of Contents with anchor navigation

### Changed
- README hero redesigned with logo, tagline, CTA buttons, and badges
- Architecture diagram rebuilt with modern startup visuals, rounded cards, professional arrows
- Version bumped to 3.2.0

### Fixed
- Restored missing screenshots from git index (12 files)
- Repository history cleaned via hard reset to stable commit `2be7f1a`

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
