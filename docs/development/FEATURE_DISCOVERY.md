# Feature Discovery

Catalog of all operational features found in VidyGuideAI.

---

## 1. Core Feature Matrix

| Feature Name | View Component | Backend Logic File | AI Provider | Local Status |
| --- | --- | --- | --- | --- |
| **User Sign-up & Verification** | `app.py` auth panels | `auth.py` operations | None | ✅ Working |
| **Career Suggestions** | `app.py` (Tab 1) | `backend/career_engine.py` | Groq LLaMA-3 | ✅ Working |
| **Interactive Timeline** | `app.py` / `roadmap_viz.py` | None | None | ✅ Working |
| **ATS Resume Exporter** | `app.py` (Tab 2) | `backend/resume_builder.py` | Groq LLaMA-3 | ✅ Working |
| **ReportLab PDF Export** | `app.py` / `resume_pdf.py` | None | None | ✅ Working |
| **Resume Evaluator** | `app.py` (Tab 3) | `backend/resume_feedback.py` | Groq LLaMA-3 | ✅ Working |
| **Resume Text Scanner (OCR)** | `app.py` / `resume_scanner.py` | None | None | ✅ Working |
| **AI Mentor Assistant** | `app.py` (Tab 4) | `backend/mentor_chat.py` | Groq LLaMA-3 | ✅ Working |
| **Voice Playback & Synthesizer** | `app.py` / `voice_mentor.py` | None | None | ✅ Working |
