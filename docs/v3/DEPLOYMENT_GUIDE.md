# Production Deployment Guide

Details for launching VidyGuideAI V3 clusters in cloud infrastructure.

---

## 1. Hosting Architecture Mappings

* **Frontend Dashboard**: Deployed on **Vercel** for edge performance, SSR caching, and instant Git pull integrations.
* **NestJS REST API**: Deployed on **Railway** (or Render) connected to PostgreSQL and Redis container nodes.

```
                  [Vercel Serverless]
                           │ (Next.js Client UI)
                           ▼
[User Browser] ──> [Railway API Gateway (NestJS)]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      [PostgreSQL DB]              [Redis Broker]
                                         │
                                         ▼
                                  [BullMQ Worker]
```

---

## 2. Environment Configurations
Configure the following production variables in Railway:
```env
PORT=8000
DATABASE_URL=postgresql://user:pass@host:port/db?schema=public
REDIS_URL=redis://default:pass@redis-host:port
JWT_SECRET=super_secure_sha_string
RESEND_API_KEY=re_Q123456...
GROQ_API_KEY=gsk_...
CLOUDINARY_URL=cloudinary://...
```

---

## 3. Docker Compose (Local Dev Replica)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: vidyguide
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```
