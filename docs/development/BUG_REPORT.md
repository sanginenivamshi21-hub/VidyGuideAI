# Bug Report & Resolution log

This sheet lists all execution bugs found and fixed in the VidyGuideAI codebase.

---

## 1. Fixed Bugs

### Bug #1: Syntax Error in Mentor Chat module
* **File**: `backend/mentor_chat.py` (Line 1)
* **Description**: `rom groq import Groq` instead of `from groq import Groq`.
* **Resolution**: Fixed to `from groq import Groq`.

### Bug #2: SMTP_HOST Configuration Typo
* **File**: `.env` (Line 2)
* **Description**: `SMTP_HOST` was set to the email address `vidyaguideai@gmail.com` instead of the SMTP server hostname.
* **Resolution**: Updated to `SMTP_HOST=smtp.gmail.com`.

### Bug #3: Truncated API Keys in Git History
* **File**: Git commit nodes (Historic)
* **Description**: Credentials committed in `Resolved merge conflict` commit blocked push validation rules.
* **Resolution**: Scrubbed history using `git filter-branch`.
