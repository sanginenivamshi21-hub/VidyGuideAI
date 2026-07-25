# Product Requirements Document (PRD)

This document maps user workflows and functional scopes for VidyGuideAI V3.

---

## 1. User Personas & Scope

### 🎓 1. School Leaver (Class 10/12)
* **Goal**: Needs guidance on stream choices (Science, Commerce, Arts) or technical trades (ITI).
* **Pain Point**: Overwhelmed by exam options; lacks access to counselors.

### 💼 2. Diploma/Graduate Career Switcher
* **Goal**: Transition from a mechanical engineering diploma/B.Sc. to IT or private-sector roles.
* **Pain Point**: Needs ATS-compliant resumes and structured timeline steps for skill acquisition.

---

## 2. Core Functional Requirements

### FR-1: Account Security & OTP Flow
* Users must verify registrations using a 6-digit one-time passcode (OTP) delivered to their email inbox.
* OTP values must expire after 10 minutes.

### FR-2: Localized Career Suggestions & roadmaps
* Input: Education (Class 10 to Masters), skills, location, career goals.
* Output: Structured career recommendations (salary range, job availability) and a horizontal timeline visualization.

### FR-3: ATS Resume Builder & OCR Scanner
* Input: Plaintext experience details, target company/role.
* Output: Structured, ATS-friendly plaintext resume download + ReportLab generated PDF file.
* Scanner input: PDF/Image upload. Output: ATS Match Rating (1-100) and feedback suggestions.

### FR-4: Conversational AI Mentor & Voice Synth
* Users can query an AI counselor about career plans.
* The system must translate queries/replies and synthesize answers into spoken voice using browser voice players.
