# Tech Stack Decisions & Rationale

Justifications for stack selections in VidyGuideAI V3.

---

## 🛠️ Stack Component Matrix

### 1. Frontend Framework: Next.js (React / TypeScript)
* **Rationale**: Enables server-side rendering (SSR) for fast page loading and clean SEO. Static site generation (SSG) caches landing pages, while TypeScript ensures compile-time safety.

### 2. Backend API: NestJS (TypeScript)
* **Rationale**: Out-of-the-box support for modular structure, dependency injection, and TypeScript. Replaces FastAPI to maintain a unified language stack (TypeScript) across both frontend and backend.

### 3. Database & ORM: PostgreSQL + Prisma
* **Rationale**: PostgreSQL supports high-concurrency connections. Prisma provides type-safe query builders and automatic migrations, matching the NestJS TypeScript models.

### 4. Background Queue Broker: Redis + BullMQ
* **Rationale**: BullMQ handles task queuing, job delays, and auto-retries for heavy image processing and OCR scans without blocking the main API gateway threads.

### 5. Services Integrations
* **Email Delivery**: **Resend** (cleaner REST API than legacy SMTP connections).
* **Storage**: **Cloudinary** (manages parsed resume images and documents).
* **AI Provider**: **Groq Cloud** (sub-second LLaMA-3 completions).
