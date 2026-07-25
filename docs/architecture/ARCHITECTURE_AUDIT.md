# Architecture Audit

This report reviews the current client-server design of the VidyGuideAI platform.

---

## 1. System Topology
The application runs as two decoupled local processes:
1. **Streamlit UI (`app.py`)**: Renders layout panels, checks validators, queries SQLite database tables directly, and connects to the backend API over HTTP.
2. **FastAPI Web Server (`backend/main.py`)**: Validates JSON payloads via Pydantic and requests inferences from the Groq LLaMA model.

```
+------------------+         HTTP POST         +------------------+
|    Streamlit     | ────────────────────────> |     FastAPI      |
|    Frontend      | <──────────────────────── |      Server      |
+--------┬---------+        JSON Response      +--------┬---------+
         │                                              │
         ▼ (Direct SQL Queries)                         ▼ (LLM completion calls)
   [vidyguide.db]                                [Groq API Endpoint]
```

---

## 2. Design Bottlenecks
* **Direct UI DB Queries**: The Streamlit frontend performs direct SQLite database calls instead of going through backend REST routes.
* **Blocking Thread Pools**: FastAPI endpoints are synchronous (`def` instead of `async def`), limiting throughput under high request volume.
* **Synchronous SMTP Calls**: Sending OTP emails blocks Streamlit runtime execution for up to 10 seconds.
