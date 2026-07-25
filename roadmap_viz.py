"""
roadmap_viz.py — VidyGuide Career Roadmap Visualizer
Fixes: nav buttons always visible, bright milestone text, larger cards,
       correct iframe height so nothing is clipped.
"""

import re
import html as _he


def _classify(text):
    t = text.lower()
    if any(w in t for w in ["learn","study","course","cert","skill","class","train"]): return "learn"
    if any(w in t for w in ["apply","job","interview","hire","placement","work","career"]): return "job"
    if any(w in t for w in ["build","project","portfolio","create","develop","make"]): return "build"
    if any(w in t for w in ["salary","₹","lpa","income","earn","pay","money"]): return "money"
    if any(w in t for w in ["exam","test","gate","upsc","ssc","neet","jee","ibps"]): return "exam"
    if any(w in t for w in ["intern","apprentice","trainee","experience"]): return "intern"
    return "milestone"

ICONS   = {"learn":"📚","job":"💼","build":"🔨","money":"💰","exam":"📝","intern":"🏢","milestone":"🎯"}
COLORS  = {"learn":"#5B9BD5","job":"#3DDC84","build":"#F0A500","money":"#2ECC71",
           "exam":"#E74C3C","intern":"#C07FF0","milestone":"#3DDC84"}


def parse_roadmap_from_guidance(text: str) -> list:
    milestones = []
    seen       = set()

    # Primary patterns — English temporal markers
    patterns = [
        (re.compile(r"month\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})", re.I),  "Month", 1.0),
        (re.compile(r"week\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})",  re.I),  "Week",  0.25),
        (re.compile(r"day\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})",   re.I),  "Day",   0.03),
        (re.compile(r"(?:step|phase|stage)\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})", re.I), "Step", 2.0),
        (re.compile(r"(?:first|next)\s+(\d+)\s+months?\s*[:\-–]+\s*([^\n]{5,100})", re.I), "Month", 1.0),
        # Bold markdown headers: **Step 1: title** or **1. Title**
        (re.compile(r"\*{1,2}(?:step|phase|stage|month)?\s*(\d+)[.:\-–*]+\s*([^*\n]{5,100})", re.I), "Step", 2.0),
    ]

    for pat, unit, mul in patterns:
        for m in pat.finditer(text):
            num   = int(m.group(1))
            title = re.sub(r"^[-•*→▸]+\s*", "", m.group(2).strip()).rstrip("*").strip()[:80]
            key   = title[:25].lower()
            if key in seen: continue
            seen.add(key)
            t = _classify(title)
            milestones.append({
                "label": f"{unit} {num}", "sort_key": num * mul,
                "title": title, "type": t,
                "icon": ICONS[t], "color": COLORS[t],
            })

    # Fallback 1: numbered list items  1. / 1) / **1.**
    if not milestones:
        items = re.findall(
            r"(?:^|\n)\s*(?:\*{0,2}\d+[.)\-–]\*{0,2}\s*)(.{10,120})", text)
        for i, item in enumerate(items[:8], 1):
            item = re.sub(r"[*_]", "", item).strip()
            if len(item) < 8:
                continue
            t = _classify(item)
            milestones.append({
                "label": f"Step {i}", "sort_key": float(i),
                "title": item[:80], "type": t,
                "icon": ICONS[t], "color": COLORS[t],
            })

    # Fallback 2: bullet items
    if not milestones:
        items = re.findall(r"(?:^|\n)\s*[-•*▸→]\s+(.{10,100})", text)
        for i, item in enumerate(items[:8], 1):
            item = re.sub(r"[*_]", "", item).strip()
            t = _classify(item)
            milestones.append({
                "label": f"Step {i}", "sort_key": float(i),
                "title": item[:80], "type": t,
                "icon": ICONS[t], "color": COLORS[t],
            })

    milestones.sort(key=lambda x: x["sort_key"])
    return milestones[:10]


def render_roadmap_html(milestones: list, career_title: str = "") -> str:
    if not milestones:
        return ""

    n          = len(milestones)
    cards_html = ""

    for i, m in enumerate(milestones):
        color = m.get("color", "#3DDC84")
        icon  = m.get("icon",  "🎯")
        label = _he.escape(str(m.get("label", f"Step {i+1}")))
        title = _he.escape(str(m.get("title", "")))
        delay = i * 0.08

        # Connector line between cards (not on last)
        conn  = "" if i == n - 1 else (
            f'<div class="conn" '
            f'style="background:linear-gradient(to right,{color},{color}40)"></div>'
        )

        cards_html += f"""
<div class="ms-card" style="animation-delay:{delay:.2f}s" tabindex="0">
  {conn}
  <div class="badge" style="background:{color}22;border:1.5px solid {color};color:{color}">{label}</div>
  <div class="dot"   style="background:{color};box-shadow:0 0 14px {color}60">{icon}</div>
  <div class="card-body">
    <div class="card-title">{title}</div>
  </div>
</div>"""

    subtitle = _he.escape(f"Path: {career_title}" if career_title else "Your step-by-step action plan")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{
  background:#0D1117;
  font-family:-apple-system,'Segoe UI',Arial,sans-serif;
  color:#E2E8F0;height:100%;overflow:hidden;
}}
.root{{display:flex;flex-direction:column;height:100vh;padding:14px 0 10px;}}

/* Header */
.hdr{{display:flex;align-items:center;gap:12px;padding:0 20px 12px;flex-shrink:0;}}
.hdr-ico{{font-size:1.5rem;}}
.hdr-title{{font-size:1rem;font-weight:700;color:#3DDC84;}}
.hdr-sub{{font-size:.72rem;color:#7A8BA0;margin-top:2px;}}
.count-pill{{
  display:inline-flex;align-items:center;gap:5px;margin-top:4px;
  background:rgba(61,220,132,.1);border:1px solid rgba(61,220,132,.2);
  border-radius:20px;padding:2px 10px;font-size:.68rem;color:#3DDC84;
}}

/* Scroll track */
.track-wrap{{flex:1;padding:0 16px;overflow:hidden;min-height:0;}}
.track{{
  display:flex;align-items:flex-start;gap:0;
  height:100%;width:100%;
  overflow-x:auto;overflow-y:visible;
  scroll-behavior:smooth;
  -webkit-overflow-scrolling:touch;
  scrollbar-width:thin;scrollbar-color:#2A3550 #0D1117;
  padding-bottom:6px;
}}
.track::-webkit-scrollbar{{height:4px;}}
.track::-webkit-scrollbar-track{{background:#0D1117;}}
.track::-webkit-scrollbar-thumb{{background:#3A4A6A;border-radius:2px;}}

/* Milestone card */
.ms-card{{
  flex-shrink:0;
  width:180px;
  min-height:170px;
  display:flex;flex-direction:column;align-items:center;
  position:relative;
  opacity:0;transform:translateY(14px);
  animation:fadeUp .4s ease forwards;
  padding-bottom:8px;
  cursor:default;
}}
@keyframes fadeUp{{to{{opacity:1;transform:translateY(0);}}}}
.ms-card:focus{{outline:none;}}
.ms-card:hover .dot{{transform:scale(1.12);}}

/* Connector */
.conn{{
  position:absolute;top:62px;left:50%;
  width:100%;height:2px;z-index:0;
}}

/* Badge */
.badge{{
  font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:3px 10px;border-radius:20px;margin-bottom:10px;
  white-space:nowrap;z-index:1;
}}

/* Dot icon */
.dot{{
  width:48px;height:48px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:1.2rem;border:3px solid #0D1117;
  z-index:1;transition:transform .2s;flex-shrink:0;
}}

/* Card body — BRIGHT TEXT */
.card-body{{margin-top:10px;padding:0 8px;text-align:center;width:100%;}}
.card-title{{
  font-size:.82rem;
  color:#F0F4FF;
  font-weight:600;
  line-height:1.45;
  display:-webkit-box;
  -webkit-line-clamp:4;
  -webkit-box-orient:vertical;
  overflow:hidden;
  word-break:break-word;
}}

/* Navigation */
.nav{{
  display:flex;justify-content:space-between;align-items:center;
  padding:8px 20px 0;flex-shrink:0;
  min-height:44px;
}}
.nav-hint{{font-size:.7rem;color:#3A4A5E;}}
.nav-btns{{display:flex;gap:8px;}}
.nav-btn{{
  background:#1A2340;
  border:1.5px solid #3A4A6A;
  color:#C0D0F0;
  border-radius:8px;
  padding:7px 18px;
  font-size:.8rem;
  font-weight:600;
  cursor:pointer;
  transition:all .15s;
  font-family:inherit;
  user-select:none;
  -webkit-tap-highlight-color:transparent;
}}
.nav-btn:hover{{background:#243060;color:#3DDC84;border-color:#3DDC84;}}
.nav-btn:active{{transform:scale(.95);}}

/* Legend */
.legend{{
  display:flex;flex-wrap:wrap;gap:8px;
  padding:8px 20px 0;flex-shrink:0;
}}
.leg{{display:flex;align-items:center;gap:5px;font-size:.68rem;color:#8090A8;}}
.leg-dot{{width:7px;height:7px;border-radius:50%;flex-shrink:0;}}
</style>
</head>
<body>
<div class="root">

  <div class="hdr">
    <div class="hdr-ico">🗺️</div>
    <div>
      <div class="hdr-title">Career Roadmap</div>
      <div class="hdr-sub">{subtitle}</div>
      <div class="count-pill">📍 {n} milestones</div>
    </div>
  </div>

  <div class="track-wrap">
    <div class="track" id="rmTrack">
      {cards_html}
    </div>
  </div>

  <div class="nav">
    <div class="nav-hint">← swipe or use buttons →</div>
    <div class="nav-btns">
      <button class="nav-btn" id="btnBack" type="button">← Back</button>
      <button class="nav-btn" id="btnFwd"  type="button">Forward →</button>
    </div>
  </div>

  <div class="legend">
    <div class="leg"><div class="leg-dot" style="background:#5B9BD5"></div>Learn</div>
    <div class="leg"><div class="leg-dot" style="background:#3DDC84"></div>Job</div>
    <div class="leg"><div class="leg-dot" style="background:#F0A500"></div>Build</div>
    <div class="leg"><div class="leg-dot" style="background:#2ECC71"></div>Salary</div>
    <div class="leg"><div class="leg-dot" style="background:#E74C3C"></div>Exam</div>
    <div class="leg"><div class="leg-dot" style="background:#C07FF0"></div>Intern</div>
  </div>

</div>

<script>
// Use IDs not inline onclick — more reliable inside iframes
(function() {{
  var track = document.getElementById('rmTrack');
  var btnB  = document.getElementById('btnBack');
  var btnF  = document.getElementById('btnFwd');
  var STEP  = 200;

  if (!track) return;

  btnB.addEventListener('click', function(e) {{
    e.preventDefault();
    track.scrollBy({{ left: -STEP, behavior: 'smooth' }});
  }});
  btnF.addEventListener('click', function(e) {{
    e.preventDefault();
    track.scrollBy({{ left: STEP, behavior: 'smooth' }});
  }});

  // Keyboard support (only when iframe is focused)
  document.addEventListener('keydown', function(e) {{
    if (e.key === 'ArrowRight') track.scrollBy({{ left: STEP,  behavior: 'smooth' }});
    if (e.key === 'ArrowLeft')  track.scrollBy({{ left: -STEP, behavior: 'smooth' }});
  }});
}})();
</script>
</body>
</html>"""


def render_roadmap(guidance_text: str, career_title: str = ""):
    """Parse and render the roadmap in Streamlit."""
    import streamlit as st
    import streamlit.components.v1 as components

    milestones = parse_roadmap_from_guidance(guidance_text)
    if not milestones:
        st.info("🗺️ No timeline found. Ask for a 'month-by-month plan' to see a roadmap.")
        return

    html   = render_roadmap_html(milestones, career_title)
    # Height: header(~100) + track(~200) + nav(~50) + legend(~40) + padding
    height = 420
    components.html(html, height=height, scrolling=False)

    with st.expander(f"📋 All {len(milestones)} milestones as text"):
        for m in milestones:
            st.markdown(f"**{m['icon']} {m['label']}** — {m['title']}")