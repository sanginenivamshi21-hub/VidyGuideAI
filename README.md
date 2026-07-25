# 🎓 VidyaGuideAI — Intelligent Multilingual Career Guidance Platform

An open-source, web-based intelligent career guidance platform designed to bridge the accessibility gap for career counseling by combining modern generative AI with localized multilingual scripts.

---

## 🚀 Key Features

*   **AI Career Guidance Engine:** Synthesizes custom career roadmaps, job tracks, and study guides based on academic and demographic profiles.
*   **ATS-Compliant Resume Builder:** Formats user inputs into clean, standard ATS-readable resume structures.
*   **OCR Resume Analyzer:** Provides 8-dimensional feedback (grammar, format, keywords, spacing, etc.) using Pytesseract OCR extraction.
*   **AI Mentor Chat:** A multi-turn conversational agent powered by Meta's LLaMA models.
*   **Voice-Native Mentoring:** Integrates browser-based voice inputs using Groq Whisper Speech-to-Text and voice outputs.
*   **ISO Code Script Injection:** Uses localized prompt-injections to force native-script outputs in **12 regional Indian languages** (Telugu, Hindi, Bengali, Tamil, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, Urdu, and English) at sub-second inference speeds.
*   **User Dashboard:** Features SQLite-backed session history and personalized learning analytics.

---

## 🛠 Tech Stack

*   **Frontend:** Streamlit (Python)
*   **Backend Middleware:** FastAPI (Python, Asynchronous API design)
*   **Database:** SQLite (Lightweight SQL data store)
*   **AI Inference API:** Groq (LLaMA-3.1-8b-instant & LLaMA-3.3-70b-versatile)
*   **OCR Parsing:** Pytesseract
*   **PDF Compilation:** ReportLab (Python PDF library)
*   **Notification Dispatch:** SMTP

---

## 📁 System Architecture

```
VidyGuide-ai/
├── app.py              # Main Streamlit user interface & navigation
├── auth.py             # User authorization & session logic
├── resume_pdf.py       # ReportLab script compiling raw text into PDF templates
├── resume_scanner.py   # OCR image extraction & analysis scoring engine
├── voice_mentor.py     # Voice recording pipelines & Groq Whisper interface
├── roadmap_viz.py      # Network graph visualizations for career roadmaps
├── database/           # SQLite schema declarations & migrations
├── backend/            # FastAPI router endpoints & service controllers
└── requirements.txt    # Library dependencies
```

---

## ⚙️ Local Setup & Installation

### Prerequisites

*   Python 3.10 or higher
*   Tesseract OCR engine installed on your local system:
    *   **macOS:** `brew install tesseract`
    *   **Linux/Ubuntu:** `sudo apt-get install tesseract-ocr`

### 1. Clone the Repository
```bash
git clone https://github.com/sanginenivamshi21-hub/VidyGuide-ai.git
cd VidyGuide-ai
```

### 2. Setup Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=gsk_your_groq_key_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
DATABASE_URL=sqlite:///vidyguide.db
```

### 5. Initialize the Database & Run
Launch the FastAPI backend service:
```bash
uvicorn backend.main:app --port 8000 --reload
```

In a separate terminal, launch the Streamlit frontend:
```bash
streamlit run app.py
```
Open `http://localhost:8501` to use the platform.
