# 🌿 VidyGuideAI

<div align="center">

![VidyGuideAI Banner](docs/images/landing_page.png)

[![GitHub License](https://img.shields.io/github/license/sanginenivamshi21-hub/VidyGuideAI?style=for-the-badge&color=3DDC84)](LICENSE)
[![GitHub Contributors](https://img.shields.io/github/contributors/sanginenivamshi21-hub/VidyGuideAI?style=for-the-badge&color=5B9BD5)](https://github.com/sanginenivamshi21-hub/VidyGuideAI/graphs/contributors)
[![GitHub Issues](https://img.shields.io/github/issues/sanginenivamshi21-hub/VidyGuideAI?style=for-the-badge&color=F0A500)](https://github.com/sanginenivamshi21-hub/VidyGuideAI/issues)

**Intelligent, localized career guidance, resume crafting, and AI mentorship tailored for Indian students.**

[Local Setup Guide](docs/development/LOCAL_SETUP.md) • [System Architecture](docs/architecture/ARCHITECTURE_AUDIT.md) • [API Reference](docs/api/API_DOCUMENTATION.md) • [Security Policy](SECURITY.md)

</div>

---

## 🎯 Why VidyGuideAI is Unique

VidyGuideAI bridges the gap between raw student profiles and the unique demands of the Indian educational and professional landscape. Unlike generic AI assistants:
* **Tailored Academic Routing**: Provides clear paths for Class 10/12 dropouts, ITI trades, polytechnic lateral entries, and university graduates.
* **National System Alignment**: Directly targets recruitment criteria for Indian tech giants (TCS, Infosys, Wipro), civil services (SSC, UPSC, Railway), and public sector undertakings (PSUs).
* **High-Context Prompts**: Uses level-specific heuristics to ensure career paths are realistic and action-oriented.

---

## 🏗️ AI & System Architecture

```
[Streamlit Frontend App] ────(REST API payload)────> [FastAPI Server]
          │                                                   │
          ▼ (Reads SQLite data)                               ▼ (Queries Groq SDK)
   [vidyguide.db]                                      [LLaMA-3.1 Model]
```

---

## 📊 Feature Matrix (Prototype vs. Next.js SaaS Target)

| Feature | Streamlit Prototype (`v0.2.0`) | Next.js Production SaaS (`v1.0.0`) |
| --- | --- | --- |
| **Authentication** | SQLite + On-screen OTP Fallback | Auth0 / JWT HTTP-only Cookies + PostgreSQL |
| **Database** | SQLite Single-file (Thread blocked) | PostgreSQL + `pgvector` Vector Search |
| **Asynchronous Jobs** | Blocked UI thread execution | Celery / RQ background queues + Redis cache |
| **Speech Synthesizer** | Client Browser Web Speech API | Native Browser Speech + Edge Synthesis Cache |
| **Timeline Roadmap** | Custom Regex HTML connector card | Framer Motion Native React timeline |

---

## 📸 Screenshots

### Landing Page & Authentication
![Landing Page](docs/images/landing_page.png)

### Personalised Career Suggestions
![Career Guidance](docs/images/career_guidance.png)

### Targeted Resume Builder
![Resume Builder](docs/images/resume_builder.png)

### Interactive AI Mentor Chat
![Mentor Chat](docs/images/mentor_chat.png)

### PDF & Image Resume OCR Scanner
![OCR Scanner](docs/images/ocr_scanner.png)

### Progress Analytics Dashboard
![Dashboard](docs/images/dashboard.png)

---

## 🎓 Recruiter-Friendly Review Guide
If you are reviewing this codebase for an engineering role (Google, Microsoft, Meta, etc.), please check:
* **Clean Routing**: FastAPI endpoints in [backend/main.py](file:///Users/vamshi/projects/VidyGuide-ai/backend/main.py) parse structures using Pydantic validation schemas.
* **Input Validation**: Sanitization and syntax checking rules inside [validators.py](file:///Users/vamshi/projects/VidyGuide-ai/validators.py).
* **Decoupled Key Management**: Read from environment variables ([ENVIRONMENT.md](docs/development/ENVIRONMENT.md)) with zero committed secrets.
* **Interactive Timelines**: Parsing and horizontal scroll connection engine inside [roadmap_viz.py](file:///Users/vamshi/projects/VidyGuide-ai/roadmap_viz.py).

---

## 🚀 Local Installation
```bash
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuideAI
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
streamlit run app.py
```

See [Local Setup Guide](docs/development/LOCAL_SETUP.md) for step-by-step configurations.
