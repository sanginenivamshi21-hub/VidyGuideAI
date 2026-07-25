# VidyGuideAI System Architecture

Reference guide for system architecture, layout structures, and data flows.

---

## 1. Directory Structure

```
VidyGuide-ai/
├── .github/                     # GitHub Actions and Issue/PR templates
├── ai_models/                   # LLM client classes (Groq, Anthropic, HuggingFace)
│   ├── claude_client.py
│   ├── groq_client.py
│   └── huggingface_models.py
├── backend/                     # FastAPI backend app
│   ├── main.py                  # API endpoints and Pydantic schemas
│   ├── career_engine.py         # Career guidance prompts
│   ├── resume_builder.py        # Plaintext resume prompts
│   ├── resume_feedback.py       # ATS evaluation logic
│   └── mentor_chat.py           # Mentorship chat
├── database/                    # Data models and indexing
│   ├── career_dataset.py        # In-memory career list
│   └── vector_store.py          # Local FAISS/NumPy index
├── prompts/                     # Prompt templates
├── utils/                       # Common utilities
│   ├── helpers.py               # file loading and retries
│   └── parser.py                # String parsing and cleaning
├── app.py                       # Monolithic Streamlit frontend
├── auth.py                      # User SQLite database actions and SMTP
├── resume_pdf.py                # ReportLab PDF generator
├── resume_scanner.py            # PDF/Image OCR scanner
├── roadmap_viz.py               # Custom HTML timeline iframe
├── robot_face.py                # SVG anim controller
├── translator.py                # Text translation helpers
├── validators.py                # User input validator checks
└── voice_mentor.py              # Web Speech synthesizer
```

---

## 2. Current vs. Target Production Architecture

### Current Phase (v0.2.0)
* **Frontend**: Streamlit dashboard rendering elements and calling FastAPI over HTTP POST.
* **Backend**: FastAPI web server passing requests synchronously to LLM providers.
* **Database**: Local file-based SQLite database with user profile tables.
* **Email**: Legacy `smtplib` connection logic.

### Target Next.js Phase (v1.0.0)
* **Frontend**: Decoupled **Next.js (React/TypeScript)** dashboard utilizing Framer Motion for animations.
* **Backend**: **FastAPI** ASGI web server executing asynchronous tasks (`async def`).
* **Database**: Managed **PostgreSQL** cluster using `pgvector` for similarity matching.
* **Background Queue**: **Celery / RQ** with **Redis** to offload long-running OCR tasks and PDF builds.
* **Security**: JSON Web Token cookies (HMAC-SHA256) and HTTPS connections.
