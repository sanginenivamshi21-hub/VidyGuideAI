# Deployment Guide

This document describes how to deploy the VidyGuideAI platform in production.

---

## 1. Containerization (Target Multi-Stage Setup)

We recommend deploying the backend and frontend as isolated containers.

### Backend Dockerfile Profile (`Dockerfile.backend`)
```dockerfile
FROM python:3.10-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY backend/ ./backend/
COPY database/ ./database/
COPY ai_models/ ./ai_models/
COPY utils/ ./utils/
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile Profile (`Dockerfile.frontend`)
```dockerfile
FROM python:3.10-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app.py auth.py validators.py resume_pdf.py resume_scanner.py roadmap_viz.py robot_face.py translator.py voice_mentor.py logo.jpeg ./
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

---

## 2. Server Configuration
* **Reverse Proxy**: Use Nginx or Caddy to proxy requests and handle SSL certification mapping.
  ```nginx
  server {
      listen 80;
      server_name api.vidyguide.ai;

      location / {
          proxy_pass http://127.0.0.1:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```
* **Production Platforms**: Optimized for deployment on Render, Railway, Fly.io, or AWS ECS.
