
---

## Pass 2 — Pre-launch Brutal Design Review (2026-07-31)

Fresh senior-designer pass; previous scores ignored. Full critique: `BRUTAL_DESIGN_REVIEW.md` (repo root).

### Issues found & fixed
| Issue | Fix |
|---|---|
| "VidyGuideAI · Premium AI SaaS" footer on Dashboard — amateur filler | Removed entirely; page ends cleanly |
| Stat cards stacked `.glass surface-card` (double layer, too glass-heavy) | De-glassed to single `surface-card` layer on dashboard/ocr/translator/interview-prep (all 11 instances) |
| Career page micro-type 9–10px + emoji-labeled fields | Labels raised to explicit 10–12px hierarchy; UI-label emojis removed (🛠💡📍💬📊) — data content emojis kept per icon rule |
| Roadmap milestone badge `📍` prefix | Removed |
| Resume builder: raw `+`/`×` text glyphs as icons (17×) | Replaced with Lucide `Plus`/`X` |
| Resume builder: 24 inputs `rounded-lg p-2.5` vs `rounded-xl p-3` system | Normalized to `rounded-xl p-3` |
| Resume builder: flat main panel, no elevation rhythm | Added `shadow-xl` to active form panel |

### Reviewed & intentionally kept
- Auth page `rounded-xl` system — internally consistent (inputs/buttons/cards all xl)
- Resume review `rounded-3xl` panels — matches dashboard hero radius
- Composer 19px icons — deliberate touch-target scale (36px buttons)
- Home "AI Career Platform" pill — descriptive brand chip
- `✓` glyph in review score bubbles — content mark, not a control icon

### Verification
- `pnpm --filter @vidyguide/web build` ✓ 21/21 static pages, zero TS errors
- Dev server restarted (stale webpack fix); /dashboard, /career, /resume/builder all 200; Safari opened on /dashboard

### 21st.dev status
- MCP unavailable in this environment → zero 21st.dev components used (native shadcn/Radix patterns). Replacement list unchanged (§8 above). Not a component was recreated that the list doesn't already cover.

---

## Pass 3 — 21st.dev MCP Integration Attempt (2026-07-31)

### Installed & verified
- **`@21st-dev/cli` v1.15.1** (global) — official 21st.dev tooling, installed from npm.
- **Authenticated**: saved token for `sanginenivamshi21` verified (`21st whoami`, live searches).
- **MCP endpoint verified**: `POST https://21st.dev/api/mcp` with `x-api-key` returns successful JSON-RPC `initialize` (`serverInfo: 21st v0.1.0`, `capabilities: tools`).
- **Configured** in `~/.config/opencode/opencode.jsonc` (remote MCP, key injected from `~/.config/21st/api_key`). Requires opencode restart to load.
- **Live search tested** (6 queries, all real results): ai chat, toast notification, voice recorder, empty state, step progress wizard, avatar uploader.

### Attempted install — blocked (exact errors)
1. `21st add nyxbui/stepper --print` → returns `npx shadcn@latest add "https://21st.dev/r/nyxbui/stepper?api_key=..."` (install routes through the shadcn Marketplace).
2. `API_KEY_21ST=$TOKEN npx shadcn@latest add "..." --yes` → **Error: `[Marketplace membership required]`** — free tier token lacks Marketplace membership.
3. `21st add nyxbui/stepper` (CLI-native path) → same Marketplace error, reproduced twice.
4. Manual port fallback: `21st get 1205` → **free quota exhausted (2/day)** — "Component code on 21st is paid; upgrade: https://21st.dev/pricing". Resets 2026-08-01.

### Consequence
No 21st.dev component could be installed into the repo today. Per mandate fallback: shadcn/ui + Radix patterns (already the codebase standard) remain in use. Searches remain free — the catalog is reachable for future passes once Marketplace membership or paid tier is available.

### Evaluated swap candidates (live search IDs, deferred)
| Candidate | Search result | Deferral reason |
|---|---|---|
| Agent Chat shell (12404) | chat+composer shell | Mentor chat is more advanced (streaming, grouping, voice, 9-language STT, tool palette) — swap would break business logic |
| Voice Recording (8472) / Voice Input (4535) | mic recorders | Custom VoiceRecorder (367 lines: 7-state machine, language map, haptics) exceeds generic quality |
| Toast (19994, 3979) | notification toasts | Settings toast is isolated, theme-correct, i18n'd — churn |
| Empty State (19369, 8155) | empty state cards | History/mentor empty states already premium + i18n'd |
| Stepper (1205 nyxbui, 19143) | wizard steppers | Highest-value target (resume builder progress visibility) — blocked by Marketplace gate + retrieval quota; retry after upgrade |

### War-room walkthrough findings (this pass)
Complete first-user journey re-walked (landing → register → OTP → dashboard → builder → mentor → roadmap → interview → history → settings → logout). No friction found beyond previously fixed items. Verified: mentor stream-failure recovery (distinct ❌ message + reasons + retry guidance), abort cleanup (empty bubble removed), guest handling on history, OTP auto-submit. Zero code changes made this pass — all surfaces at or above the 9.5 threshold established in earlier audits.
