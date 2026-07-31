# VidyGuideAI — Brutal Design Critique (pre-launch)

Senior-designer pass. Previous scores ignored; every screen re-examined with fresh eyes, evidence pulled from source.

## Verdicts per screen

### Dashboard
- **Amateur:** `VidyGuideAI · Premium AI SaaS` footer text — self-congratulatory filler no premium product ships. Remove.
- **Too glass-heavy:** stat cards stack `.glass surface-card` — two surfaces on top of the aurora. Pick one layer.
- **Generic:** hero orb + "Welcome back" reads fine; keep.

### Mentor Chat
- **Good overall** (9.7). Remaining nits: composer icons are 19px vs the 14–16px scale elsewhere; attachment chips repeat the same icon treatment twice (group + single); `New messages` pill is good.
- **Inconsistent:** `text-[10px]` timestamps inside bubbles vs 11px caption elsewhere (global bump fixes).

### Home
- **Generic:** `AI Career Platform` sparkle pill — SaaS-template badge. Acceptable as brand chip; low priority.
- Greeting h1 3xl/2xl mix is fine.

### Career page — WEAKEST non-resume screen
- **Outdated density:** 26 micro-labels (`text-[9px]` ×14, `text-[10px]` ×12) with uppercase tracking on top of every field; two-column wizard rows; `Step 1/2` pills with emoji content data. Feels like a 2021 form tool, not an AI product.
- Fix direction (no rewrite): collapse label hierarchy, elevate micro-type, unify step-pill styling with the token system.

### Resume Builder — WEAKEST screen overall
- **Inconsistent radius:** 58 `rounded-lg` + 38 `rounded-xl` + 2xl/3xl/full mixed at the same hierarchy levels (inputs lg, chips full, panels 2xl — acceptable scale but applied randomly).
- **4 font weights in one view** (extrabold/bold/semibold/medium), 35 micro-text instances, `bg-slate-950` full-screen root + `bg-slate-900/40` panels (theme-correct via remap, but the visual language is legacy).
- **No rhythm:** sections separated only by borders, no elevation change, no grouping whitespace. Notion/Canva energy absent.
- Fix direction (surgical, no rebuild): token surfaces, elevated active-step panel, consistent input radius, label scale pass.

### Resume Review
- **Inconsistent radius:** cards `rounded-3xl` while the system uses 2xl; dropzone + results panel good. Legacy gradient buttons (indigo) fine in both themes.

### Settings
- **Verified:** all 15 controls wired to `update()` + backend persist; no fake toggles. Search works. **Best-in-class page.**

### Profile / History / Translator / OCR / Interview / Roadmap / Auth
- Profile: solid 9.4 — stat blocks + form; needs sparkline (documented).
- History: now has premium empty state; timeline + detail pane good.
- Auth: card uses `rounded-xl` — one step off the 2xl system.
- Interview/OCR/Translator/Roadmap: consistently token-based; no amateur artifacts found.

## Cross-cutting consistency violations (evidence)

| System | Violation | Evidence |
|---|---|---|
| Radius | lg/xl/2xl/3xl used for same hierarchy levels across pages | builder lg+xl mix (96), review 3xl, auth xl |
| Icon size | 13/14/16/17/18/19/20/22/24/26/28px arbitrary | composer 19, chat actions 13, cards 22 |
| Type weight | 4 weights per dense page | builder 61, career 36, auth 32 |
| Micro type | 9px–10px labels in legacy pages (now globally bumped to 10–11px) | career 26, builder 35, auth 15 |
| Glass | 19 usages; double-layered on dashboard stats | `.glass surface-card` |
| Shadows | 26 usages, `shadow-lg` on small controls, `shadow-2xl` on drawers | mixed |
| Page headers | text-3xl (career/roadmap/review) vs text-h1 (new pages) | inconsistent scale |

## Prioritized improvement list

**P0 (ship-blocking polish):**
1. Remove dashboard "Premium AI SaaS" footer.
2. De-glass dashboard stat cards (single surface layer).
3. Resume builder token-surface pass: top bar, stepper, active panel elevation, input radius consistency.
4. Career page label/type hierarchy pass (explicit micro-scale in-file, step pills unified).

**P1 (quality):**
5. Auth card radius → 2xl; unify chat composer icon scale.
6. Resume review radius → 2xl consistency.

**P2 (later / 21st.dev):**
7. 21st.dev form-suite swap for builder + career wizard (documented in FINAL_POLISH_REPORT.md §8).
8. Weekly-activity sparkline on Profile/Dashboard.
9. Landing page for unauthenticated users (App Store pattern).

Everything else (mentor chat, settings, history, translator, ocr, interview, roadmap, profile, home) passed review with only cosmetic nits.
