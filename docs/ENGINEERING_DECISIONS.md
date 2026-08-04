# VidyGuideAI — Engineering Decisions Log

A record of the significant engineering decisions, written as decisions logs (context → decision → trade-offs → what was learned). This file is deliberately honest about trade-offs and deferred work.

## D-01 · Rebuild from Streamlit/FastAPI (v1) to Next.js + NestJS (v2)

- **Context:** v1 was a Streamlit + FastAPI + SQLite prototype that proved demand but was too constrained for a real product surface (23+ pages, auth, mobile, streaming UI).
- **Decision:** rebuild as a pnpm monorepo — Next.js 15 (App Router) frontend, NestJS 11 API, PostgreSQL 16 + Prisma, React 19, Tailwind 4, with shared Python services for OCR and PDF.
- **Trade-offs:** development speed dropped early (typed monorepo vs. script); gained maintainable structure, SSR/PWA, strict types, and a deployment story.
- **What I learned:** a prototype and a product have different cost curves. The v1 run was worth it — it de-risked the product before the rebuild.

## D-02 · AI provider factory with automatic fallback

- **Context:** a single AI provider means single-point failure and rate-limit risk for a free product.
- **Decision:** abstract providers behind a factory — Groq (primary) → Gemini → OpenRouter, with SSE streaming and per-user conversation context.
- **Trade-offs:** complexity added; gained zero-downtime AI features and price flexibility.
- **What I learned:** the factory pattern is only worth it when fallback is actually exercised and tested — see the testing debt note below.

## D-03 · JWT in http-only cookies + OTP email verification

- **Context:** session security on a web app serving student data.
- **Decision:** JWT stored in http-only cookies (XSS-resistant vs. localStorage), bcryptjs password hashing, email OTP via Brevo, `class-validator`/Zod validation, rate limiting via `@nestjs/throttler`.
- **Trade-offs:** no CSRF token yet (cookie security remains handled by CORS/validation); acceptable for current scope, tracked in the roadmap.

## D-04 · PostgreSQL + Prisma instead of SQLite

- **Context:** v1 used SQLite (followed it) — fine for a prototype, wrong for concurrent users, migrations, and relational integrity.
- **Decision:** PostgreSQL 16 with Prisma migrations; schema managed as code.
- **What I learned:** choosing a database is a product decision, not a stack preference.

## D-05 · OCR and PDF as Python microservices

- **Context:** OCR (EasyOCR + Tesseract, with PyTorch) and PDF generation (ReportLab) fit Python's ecosystem much better than TypeScript.
- **Decision:** a small, contained Python service alongside the TypeScript monorepo.
- **Trade-offs:** one more runtime to deploy; gained the strongest OCR/PDF tooling with minimal TypeScript interop glue.

## D-06 · Nik Caching, rate limits, and scaling (deferred)

- **Context:** single Postgres + deployed services are enough for current load.
- **Planned:** Upstash Redis for session cache and rate limiting; queue for AI/OCR heavy paths. Documented to prevent over-engineering today.

## Known engineering debt (tracked, not hidden)

1. **Test coverage** — CI runs a real Jest unit suite, but coverage should grow beyond 1 test (e2e for auth + resume analysis next).
2. **Lint hygiene** — the API has substantial auto-fixable Prettier errors; cleaning it requires a dedicated lint PR, not a silent `|| true`.
3. **CSRF strategy** to be revisited once cookie-based auth matures.
4. **Video recording** cleanliness — README screenshot assets should be deduplicated (presentation deck copies live in `~/Desktop`).