# Performance Audit

Analysis of network latencies, threading blocking, and rendering overheads.

---

## 1. Streamlit View Performance
* **Re-render overhead**: Streamlit re-runs the entire `app.py` script from top-to-bottom on every user click or input change.
* **UI Freeze**: Synchronous calls (like LLM request generation or email sending) freeze the UI until completion, which blocks the user experience.

---

## 2. API latency
* **FastAPI Sync Handlers**: Since route handlers are synchronous `def` functions, each connection locks an execution thread from the thread pool. This restricts concurrent user traffic.
* **Groq API Throughput**: Groq LLaMA models are highly performant (typically >200 tokens/sec), but latency is blocked by synchronous network calls (approx. 1s - 3s per call).
