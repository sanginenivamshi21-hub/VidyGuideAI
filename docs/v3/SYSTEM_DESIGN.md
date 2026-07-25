# System Design Specification

Detailed component design for VidyGuideAI V3.

---

## 1. System Block Diagram
VidyGuideAI V3 transitions from Streamlit/FastAPI to a fully decoupled client-server architecture:

```
[Next.js Client App (React/TS)]
              │
              ▼ (HTTPS REST / JSON Web Tokens)
    [NestJS API Gateway]
    ├── [Auth Module]      ──> bcrypt, JWT Strategy
    ├── [Career Module]    ──> Groq Client + Prompt Engines
    ├── [Resume Module]    ──> OCR Services + PDF Exporters
    └── [Database Module]  ──> Prisma Client / PostgreSQL DB
              │
              ▼ (Event broker)
        [Redis Cache / Queue]
              │
              ▼ (Worker thread)
    [Background Workers (NestJS / BullMQ)]
```

---

## 2. Component Directory Structure

### Backend (NestJS)
```
src/
├── app.module.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── strategies/
│       ├── jwt.strategy.ts
│       └── local.strategy.ts
├── career/
│   ├── career.controller.ts
│   └── career.service.ts
├── resume/
│   ├── resume.controller.ts
│   └── resume.service.ts
└── database/
    ├── prisma.service.ts
    └── schema.prisma
```

---

## 3. Asynchronous Task Queue & Cache Strategy
* **Queue Broker**: NestJS utilizing **BullMQ** on a **Redis** cluster.
* **Scope**: Heavy OCR text extraction jobs, PDF generation (ReportLab replacement), and third-party email (Resend API) requests are sent to the Redis queue, returning a job ID to prevent blocking main controller execution threads.
* **Cache Layer**: Cache frequent LLM career recommendation requests in Redis for 24 hours.
