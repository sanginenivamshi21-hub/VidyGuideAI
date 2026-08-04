# VidyGuideAI — Product Vision

## Mission

Expand what students and early-career professionals can achieve by making career preparation radically more accessible: personalized guidance, ATS-grade resumes, and interview readiness — free, in the languages they think in.

## Problem

Job preparation is fragmented and expensive. Students juggle generic resume templates, paid review services, scattered interview question banks, and advice that doesn't know their background. Non-English speakers get a second-class experience. VidyGuideAI addresses this with one platform that adapts to each user's background and speaks their language.

## Who it serves

Students and early-career professionals in India and beyond — with a first-class experience for non-English speakers (10+ Indian languages).

## Current state (honest)

An **actively developed MVP**, live at [vidyguide.is-a.dev](https://vidyguide.is-a.dev):

- AI Mentor with streaming responses (Groq LLaMA 3, with Gemini/OpenRouter fallback)
- ATS-optimized resume builder (5 templates) + resume review with OCR parsing
- Career roadmaps and mock interviews
- Real users and a public roadmap; maintained with CI, Docker, and full documentation

## Long-term vision

Grow from a career companion into a **career operating system**: skill-gap analysis, company-specific preparation, community templates, and offline-first usage. Success is measured by users who get interviews they couldn't have gotten otherwise — not by feature count.

## Guardrails

- Every claim about users and metrics stays verifiable — no invented numbers
- The platform remains free for students
- AI quality gates: provider fallback, honest error messages, no silent failures
- Engineering debt (e.g., test coverage, lint hygiene) is tracked publicly, not hidden

## What we will not do

- No paid tiers before core value is proven free
- No data monetization
- No abandoning the MVP before the next cohort of users can onboard