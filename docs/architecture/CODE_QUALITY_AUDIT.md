# Code Quality Audit

Review of SOLID design standards, code duplication, and modular decoupling.

---

## 1. SOLID Compliance
* **Single Responsibility Principle (SRP) violated**:
  * `app.py` manages UI layouts, validation rules, direct database queries, and pdf report generation.
* **Open/Closed Principle (OCP) violated**:
  * Switching the LLM provider (e.g. from Groq to Anthropic) requires modifying the code in `career_engine.py` or `resume_builder.py` directly. There is no provider interface abstraction.

---

## 2. Dead Code & Duplicate Logic
* **Unused modules**:
  * `ai_models/claude_client.py` and `database/vector_store.py` are present but never imported or called.
* **Duplicate Groq Client Initialization**:
  * `career_engine.py`, `resume_builder.py`, `resume_feedback.py`, and `mentor_chat.py` each initialize their own Groq client instance. This should be consolidated.
