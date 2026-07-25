"""
robot_face.py — Animated SVG robot face for the auth form.
States: idle | happy (valid username) | error (invalid) | password (eyes closed)
"""


def robot_html(state: str = "idle") -> str:
    accent = {"idle":"#3DDC84","happy":"#3DDC84","error":"#FF6B6B","password":"#9B8FFF"}[state]
    bg     = {"idle":"#1C2333","happy":"#0D2818","error":"#2A1010","password":"#16122A"}[state]
    anim   = {"idle":"float 3s ease-in-out infinite","happy":"nod 0.6s ease both",
               "error":"shake 0.5s ease both","password":"float 3s ease-in-out infinite"}[state]
    mouth  = {"idle":"M 44 72 Q 56 82 68 72","happy":"M 40 70 Q 56 88 72 70",
               "error":"M 42 78 Q 56 66 70 78","password":"M 46 73 Q 56 73 66 73"}[state]
    status = {"idle":"Ready to help!","happy":"Looking good \u2713",
               "error":"Try a longer name\u2026","password":"Secret safe \U0001f512"}[state]

    if state == "password":
        eyes = (
            f'<line x1="36" y1="54" x2="50" y2="54" stroke="{accent}" stroke-width="3" stroke-linecap="round"/>'
            f'<line x1="62" y1="54" x2="76" y2="54" stroke="{accent}" stroke-width="3" stroke-linecap="round"/>'
            f'<path d="M28 48 Q43 36 50 50" stroke="{accent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
            f'<path d="M84 48 Q69 36 62 50" stroke="{accent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
        )
    else:
        r = "3.5" if state == "happy" else "3"
        eyes = (
            f'<circle cx="43" cy="54" r="7" fill="{accent}" opacity=".95"/>'
            f'<circle cx="43" cy="54" r="{r}" fill="#080E18"/>'
            f'<circle cx="45" cy="52" r="1.5" fill="white" opacity=".9"/>'
            f'<circle cx="69" cy="54" r="7" fill="{accent}" opacity=".95"/>'
            f'<circle cx="69" cy="54" r="{r}" fill="#080E18"/>'
            f'<circle cx="71" cy="52" r="1.5" fill="white" opacity=".9"/>'
        )

    cheeks = (
        f'<ellipse cx="30" cy="68" rx="6" ry="3.5" fill="#FF6B8A" opacity=".35"/>'
        f'<ellipse cx="82" cy="68" rx="6" ry="3.5" fill="#FF6B8A" opacity=".35"/>'
    ) if state == "happy" else ""

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  html,body{{background:transparent;display:flex;flex-direction:column;
    align-items:center;justify-content:center;height:100%;overflow:hidden;
    font-family:'DM Sans',-apple-system,sans-serif;}}
  .wrap{{display:flex;flex-direction:column;align-items:center;gap:6px;}}
  .robot{{animation:{anim};filter:drop-shadow(0 6px 18px {accent}50);}}
  .status{{font-size:.76rem;font-weight:600;color:{accent};text-align:center;
    letter-spacing:.03em;min-height:16px;animation:fadeIn .35s ease both;}}
  @keyframes float{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(-6px)}}}}
  @keyframes nod{{
    0%{{transform:translateY(0) rotate(0)}}
    20%{{transform:translateY(-10px) rotate(-10deg)}}
    40%{{transform:translateY(-5px) rotate(8deg)}}
    60%{{transform:translateY(-8px) rotate(-5deg)}}
    80%{{transform:translateY(-2px) rotate(3deg)}}
    100%{{transform:translateY(0) rotate(0)}}
  }}
  @keyframes shake{{
    0%,100%{{transform:translateX(0)}}
    15%{{transform:translateX(-9px)}}30%{{transform:translateX(9px)}}
    45%{{transform:translateX(-7px)}}60%{{transform:translateX(7px)}}
    75%{{transform:translateX(-4px)}}90%{{transform:translateX(4px)}}
  }}
  @keyframes blink{{0%,80%,100%{{opacity:1}}40%{{opacity:.2}}}}
  @keyframes fadeIn{{from{{opacity:0;transform:translateY(4px)}}to{{opacity:1;transform:none}}}}
</style>
</head><body>
<div class="wrap">
  <svg class="robot" width="112" height="130" viewBox="0 0 112 130"
       xmlns="http://www.w3.org/2000/svg">
    <line x1="56" y1="11" x2="56" y2="24" stroke="{accent}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="56" cy="8" r="4.5" fill="{accent}" style="animation:blink 2s ease-in-out infinite"/>
    <rect x="20" y="24" width="72" height="60" rx="16" fill="{bg}" stroke="{accent}" stroke-width="2"/>
    <rect x="24" y="28" width="64" height="52" rx="12" fill="none" stroke="{accent}" stroke-width=".6" opacity=".2"/>
    {eyes}
    <circle cx="56" cy="64" r="2" fill="{accent}" opacity=".45"/>
    <path d="{mouth}" stroke="{accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
    {cheeks}
    <rect x="48" y="84" width="16" height="10" rx="4" fill="{bg}" stroke="{accent}" stroke-width="1.5"/>
    <rect x="22" y="94" width="68" height="32" rx="10" fill="{bg}" stroke="{accent}" stroke-width="2"/>
    <rect x="36" y="101" width="40" height="18" rx="6" fill="#0D1117" stroke="{accent}" stroke-width="1" opacity=".85"/>
    <circle cx="46" cy="110" r="3.5" fill="{accent}" style="animation:blink 1.8s ease-in-out infinite"/>
    <circle cx="56" cy="110" r="3.5" fill="{accent}" opacity=".7" style="animation:blink 2.3s .3s ease-in-out infinite"/>
    <circle cx="66" cy="110" r="3.5" fill="{accent}" opacity=".45" style="animation:blink 1.6s .6s ease-in-out infinite"/>
    <rect x="2"  y="97" width="20" height="9" rx="4.5" fill="{bg}" stroke="{accent}" stroke-width="1.5"/>
    <rect x="90" y="97" width="20" height="9" rx="4.5" fill="{bg}" stroke="{accent}" stroke-width="1.5"/>
  </svg>
  <div class="status">{status}</div>
</div>
</body></html>"""


def render_robot(state: str = "idle", height: int = 160):
    import streamlit.components.v1 as components
    components.html(robot_html(state), height=height, scrolling=False)