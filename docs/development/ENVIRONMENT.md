# Environment Configuration

The application loads configuration variables from a git-ignored `.env` file in the root directory.

---

## 🛠️ Environment Variables Reference

| Variable | Description | Default | Example Value |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | API Key for LLaMA-3 inference on Groq | Required | `gsk_JIAn...` |
| `CLAUDE_API_KEY` | API Key for Claude model queries | Optional | `sk-ant-...` |
| `SMTP_HOST` | Host address of SMTP server | `smtp.gmail.com` | `smtp.gmail.com` |
| `SMTP_PORT` | Connection port for SMTP | `587` | `587` |
| `SMTP_USER` | Email address sending OTPs | Required | `sender@gmail.com` |
| `SMTP_PASS` | Gmail 16-character App Password | Required | `mqaz scqk...` |
| `APP_BASE_URL` | Application root URL for verification paths | `http://localhost:8501` | `http://localhost:8501` |

---

## ⚙️ Security Guidelines
* **Commit protection**: Never check `.env` into version control.
* **Typo warning**: Ensure `SMTP_HOST` is configured to the SMTP domain (e.g. `smtp.gmail.com`), not the user email address.
