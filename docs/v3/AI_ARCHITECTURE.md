# AI Integration & Architecture

This document specifies the LLM inference setup and response schema validations for VidyGuideAI V3.

---

## 1. Provider & Model Matrix

| Feature | Primary Model | Alternative Fallback | Temperature | Max Tokens |
| --- | --- | --- | --- | --- |
| **Career Suggestions** | `llama3-70b-8192` (Groq) | `claude-3-5-sonnet` | `0.4` | `4000` |
| **Timeline Parser** | `llama3-8b-8192` (Groq) | `llama-3.1` | `0.1` | `1500` |
| **Resume Builder** | `llama3-70b-8192` (Groq) | `claude-3-5-sonnet` | `0.5` | `3000` |
| **ATS Evaluator** | `llama3-70b-8192` (Groq) | `llama-3.1` | `0.3` | `2000` |
| **Mentor chat** | `llama3-70b-8192` (Groq) | `claude-3-5-sonnet` | `0.7` | `1000` |

---

## 2. Structured JSON Output Schema (Target V3)
VidyGuideAI V3 moves from raw string completion parsing (fragile regex) to **Structured JSON Outputs** enforced by model configurations (or JSON Schema).

### Example JSON Schema: Career & Roadmap Response
```json
{
  "type": "object",
  "properties": {
    "career_suggestions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "salary_range": { "type": "string" },
          "job_growth": { "type": "string" }
        },
        "required": ["title", "salary_range", "job_growth"]
      }
    },
    "roadmap_milestones": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step_number": { "type": "integer" },
          "milestone_title": { "type": "string" },
          "duration": { "type": "string" },
          "description": { "type": "string" }
        },
        "required": ["step_number", "milestone_title", "duration"]
      }
    }
  },
  "required": ["career_suggestions", "roadmap_milestones"]
}
```

---

## 3. Resilience & Retry Framework
* **Exp-Backoff**: Wrap Groq API calls in exponential backoff retry algorithms to handle rate-limiting (`429 Too Many Requests`).
* **Fallback Strategy**: If Groq fails after 3 retries, failover to Anthropic Claude APIs using equivalent system prompts.
