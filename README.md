# 🌿 VidyGuideAI

> **Intelligent, localized career discovery, resume building, and AI mentorship for Indian students and young professionals.**

VidyGuideAI is a production-grade AI-powered career counseling platform designed to guide students from Class 10 dropouts to Master's degree holders. It tailors recommendations to the Indian educational landscape, corporate hiring pipelines (e.g., TCS, Infosys, Wipro), and government exams (SSC, UPSC, Railway, PSUs).

---

## 🚀 Key Features

* **🌱 Localized Career Guidance**: Level-specific career recommendations (stream guidance for 10th, lateral entries for diplomas, ITI apprenticeships, etc.) with real-world Indian salary estimates.
* **📝 Targeted Resume Builder**: Plaintext ATS-friendly resume creation customized for specific roles and companies.
* **📄 Resume Analyzer (OCR & ATS)**: Audits resumes via copy-paste or file scan, returning keyword matches and improvement points.
* **🤖 Conversational AI Mentor**: Responsive chat counselor answering career transition questions.
* **🎙️ Voice Assistant**: Interactive speech recognition and text-to-speech voice synthesizer.
* **🌐 Multilingual Support**: Translates career outputs and advice into 10+ regional Indian languages.
* **🔐 OTP Secure Accounts**: SQLite user registration and login verified via 6-digit email OTPs.

---

## 🛠️ Tech Stack

* **Frontend**: Streamlit
* **Backend**: FastAPI / Uvicorn
* **Database**: SQLite (Moving to PostgreSQL)
* **LLM Engine**: Groq (LLaMA-3.1) / Anthropic (Claude-3)
* **Libraries**: ReportLab (PDF), PyPDF2 (Parser), FAISS (Vector database)

---

## 📦 Installation & Setup

### Prerequisites
* Python 3.10+
* Pip package manager

### 1. Clone & Install
```bash
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuideAI
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key
CLAUDE_API_KEY=your_claude_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
APP_BASE_URL=http://localhost:8501
```

### 3. Run Locally
**Start Backend API**:
```bash
uvicorn backend.main:app --reload --port 8000
```

**Start Streamlit Frontend**:
```bash
streamlit run app.py --server.port 8501
```

---

## 📐 System Architecture
VidyGuideAI decouples the visual client UI from the backend logic, allowing future migrations to React frameworks:

```
[Streamlit Frontend App] ──(HTTP POST)──> [FastAPI Web Server]
          │                                         │
          ▼ (SQLite Auth Actions)                   ▼ (LLM Prompts & Clients)
   [vidyguide.db]                            [Groq LLaMA-3.1 Inference]
```

---

## 🤝 Contributing
Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
