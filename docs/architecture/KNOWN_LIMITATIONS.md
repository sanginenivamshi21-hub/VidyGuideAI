# Known Limitations & Gaps

Below are the architectural and functional limitations identified in the current version of VidyGuideAI.

---

## 1. Architectural Limitations
* **Monolithic Streamlit Client**: Streamlit is designed for prototyping. The monolithic `app.py` script executes sequentially on every click, causing significant re-rendering latency.
* **SQLite Database Lockups**: The backend uses SQLite (`vidyguide.db`). Concurrent writes by multiple active users will trigger `Database Locked` exceptions.
* **Synchronous API Threading**: Endpoints in `main.py` use synchronous python handlers (`def` instead of `async def`), which blocks the ASGI worker thread pool during long-running LLM completions.

---

## 2. Feature Limitations
* **Roadmap Regex Parsing**: The visual timeline generator relies on hardcoded English regex patterns. If the LLM replies in a regional language (Telugu, Hindi), the timeline parser returns an empty array.
* **Exposed OTP Fallback**: If email delivery fails, the OTP code is displayed directly on the screen, bypassing registration security.
* **Speech Synthesis Interruption**: The speech output synthesizer runs on the client-side browser Web Speech API, which can easily be interrupted or blocked by browser permissions.
