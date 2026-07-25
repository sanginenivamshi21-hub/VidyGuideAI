import os
import streamlit as st
import requests
import json
import time

from auth import (
    init_db, register_user, login_user, get_user_by_email,
    verify_registration_otp, resend_registration_otp,
    request_password_reset_otp, verify_reset_otp_and_change,
    get_user_history, save_history, delete_history_item, clear_all_history,
    get_dashboard_stats, update_profile, otp_remaining, EMAIL_ENABLED
)
from validators import (
    validate_username, validate_email, validate_password, validate_password_match,
    validate_skills, validate_interests, validate_name, validate_phone,
    validate_resume_text, validate_question, validate_free_text, sanitize
)
from resume_pdf     import generate_resume_pdf, REPORTLAB_OK
from resume_scanner import scan_resume_file
from roadmap_viz    import parse_roadmap_from_guidance, render_roadmap_html, render_roadmap
from voice_mentor   import render_voice_widget
from translator     import translate_chunks, get_lang_code, SUPPORTED_LANGUAGES
from robot_face     import render_robot

init_db()
API = "http://127.0.0.1:8000"

# ─────────────────────────────────────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="VidyGuide AI",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ─────────────────────────────────────────────────────────────────────────────
#  CSS
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

/* ═══ TOKENS ════════════════════════════════════════════════════════════════ */
:root {
  --bg:       #0D1117;
  --surface:  #161B27;
  --card:     #1C2333;
  --card2:    #202840;
  --border:   #2A3550;
  --green:    #3DDC84;
  --gdim:     #1E6B42;
  --glow:     rgba(61,220,132,.15);
  --gold:     #F0A500;
  --text:     #E2E8F0;
  --muted:    #7A8BA0;
  --danger:   #FF6B6B;
  --info:     #5B9BD5;
  --radius:   14px;
  --radius-sm:10px;
}

/* ═══ BASE ═══════════════════════════════════════════════════════════════════ */
html, body, [class*="css"] {
  font-family: 'DM Sans', -apple-system, sans-serif;
  background: var(--bg) !important;
  color: var(--text);
}
#MainMenu, footer, header { visibility: hidden; }

/* TRUE full-width — no centred content-box */
.block-container {
  padding: 0.8rem 1.6rem 3rem !important;
  max-width: 100% !important;
  width: 100% !important;
}
section[data-testid="stMain"] > div { padding-top: 0 !important; }
[data-testid="stAppViewContainer"] { background: var(--bg) !important; }

/* ═══ SCROLLBAR ══════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { width:5px; height:5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius:3px; }

/* ═══ AUTH COLUMN CARDS ══════════════════════════════════════════════════════ */
/* Style the right auth column as a card — works because it's the 2nd column */
div[data-testid="stHorizontalBlock"] > div[data-testid="stVerticalBlockBorderWrapper"]:nth-child(2) > div > div {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 20px !important;
  padding: 36px 40px !important;
  min-height: 560px !important;
}

/* ═══ ANIMATIONS ═════════════════════════════════════════════════════════════ */
@keyframes fadeSlideUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
@keyframes fadeIn        { from { opacity:0; } to { opacity:1; } }
@keyframes shimmer       { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes pulseGreen    { 0%,100%{box-shadow:0 0 0 0 rgba(61,220,132,0)} 50%{box-shadow:0 0 0 7px rgba(61,220,132,.12)} }
@keyframes slideInRight  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
@keyframes countUp       { from{transform:scale(.8);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes borderPulse   { 0%,100%{border-color:var(--border)} 50%{border-color:rgba(61,220,132,.5)} }

.anim-fadeup   { animation: fadeSlideUp  .4s ease both; }
.anim-fadein   { animation: fadeIn       .35s ease both; }
.anim-slide    { animation: slideInRight .4s ease both; }

/* ═══ HERO ═══════════════════════════════════════════════════════════════════ */
.hero {
  background: linear-gradient(125deg, #091A10 0%, #0D1117 55%, #120D00 100%);
  border: 1px solid var(--border);
  border-left: 4px solid var(--green);
  border-radius: 18px;
  padding: 28px 36px;
  margin-bottom: 14px;
  position: relative; overflow: hidden;
  animation: fadeSlideUp .5s ease both;
}
.hero::before {
  content:""; position:absolute; top:-70px; right:-50px;
  width:300px; height:300px;
  background: radial-gradient(circle, rgba(61,220,132,.07) 0%, transparent 68%);
  border-radius:50%; pointer-events:none;
}
.hero-row { display:flex; justify-content:space-between; align-items:center; gap:20px; }
.hero-badge {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(61,220,132,.1); color:var(--green);
  border:1px solid rgba(61,220,132,.25); border-radius:20px;
  padding:4px 14px; font-size:.71rem; font-weight:700;
  letter-spacing:.08em; text-transform:uppercase; margin-bottom:12px;
}
.hero-title {
  font-family:'Playfair Display',serif;
  font-size:2.5rem; font-weight:800; color:var(--green);
  margin:0 0 6px; line-height:1.05; letter-spacing:-.01em;
}
.hero-sub  { color:var(--muted); font-size:.98rem; font-weight:300; margin:0; }
.user-pill {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(61,220,132,.08); border:1px solid rgba(61,220,132,.22);
  border-radius:24px; padding:9px 20px;
  font-size:.88rem; color:var(--green); font-weight:600;
}
.guest-pill {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(240,165,0,.07); border:1px solid rgba(240,165,0,.22);
  border-radius:24px; padding:9px 20px;
  font-size:.88rem; color:var(--gold); font-weight:600;
}

/* ═══ STATS ROW ══════════════════════════════════════════════════════════════ */
.stats-row {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:10px; margin-bottom:14px;
}
.stat-card {
  background:var(--card); border:1px solid var(--border);
  border-radius:var(--radius); padding:18px 14px; text-align:center;
  transition:border-color .2s, transform .22s, box-shadow .22s;
  cursor:default;
  animation: fadeSlideUp .5s ease both;
}
.stat-card:nth-child(1){animation-delay:.05s}
.stat-card:nth-child(2){animation-delay:.1s}
.stat-card:nth-child(3){animation-delay:.15s}
.stat-card:nth-child(4){animation-delay:.2s}
.stat-card:hover {
  border-color:var(--green); transform:translateY(-4px);
  box-shadow:0 10px 28px rgba(61,220,132,.12);
}
.stat-num {
  font-family:'Playfair Display',serif;
  font-size:2rem; color:var(--green); line-height:1;
  margin-bottom:5px; font-weight:700;
  animation: countUp .6s ease both;
}
.stat-label { font-size:.7rem; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; font-weight:600; }

/* ═══ AUTH — FULL SPLIT SCREEN ═══════════════════════════════════════════════ */
/* Left branded panel */
.auth-left {
  background: linear-gradient(145deg, #091A10 0%, #0D1117 65%);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 52px 44px;
  min-height: 600px;
  display: flex; flex-direction: column; justify-content: center;
  position: relative; overflow: hidden;
  animation: fadeSlideUp .45s ease both;
}
.auth-left::before {
  content:""; position:absolute; bottom:-80px; right:-60px;
  width:340px; height:340px;
  background:radial-gradient(circle,rgba(61,220,132,.05) 0%,transparent 65%);
  border-radius:50%; pointer-events:none;
}
.auth-left-logo {
  font-family:'Playfair Display',serif;
  font-size:2.8rem; font-weight:800; color:var(--green);
  margin-bottom:8px; line-height:1;
}
.auth-left-tagline {
  font-size:1rem; color:var(--muted); font-weight:300;
  margin-bottom:38px; line-height:1.55;
}
.auth-feature {
  display:flex; align-items:flex-start; gap:14px; margin-bottom:20px;
  animation: slideInRight .4s ease both;
}
.auth-feature:nth-child(3){animation-delay:.05s}
.auth-feature:nth-child(4){animation-delay:.1s}
.auth-feature:nth-child(5){animation-delay:.15s}
.auth-feature:nth-child(6){animation-delay:.2s}
.auth-feature:nth-child(7){animation-delay:.25s}
.auth-feature-icon {
  width:44px; height:44px; border-radius:11px;
  background:rgba(61,220,132,.1); border:1px solid rgba(61,220,132,.2);
  display:flex; align-items:center; justify-content:center;
  font-size:1.15rem; flex-shrink:0;
  transition:background .25s, transform .25s;
}
.auth-feature:hover .auth-feature-icon {
  background:rgba(61,220,132,.22); transform:scale(1.08);
}
.auth-feature-text strong {
  display:block; font-size:.93rem; color:var(--text); font-weight:600; margin-bottom:1px;
}
.auth-feature-text span { font-size:.78rem; color:var(--muted); }

/* Right form panel */
.auth-right {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 52px 44px;
  min-height: 600px;
  display: flex; flex-direction: column; justify-content: center;
  animation: fadeSlideUp .45s .08s ease both;
}
.auth-title {
  font-family:'Playfair Display',serif;
  font-size:1.85rem; font-weight:700; color:var(--text);
  margin:0 0 7px;
}
.auth-sub { color:var(--muted); font-size:.88rem; margin-bottom:28px; line-height:1.55; }
.auth-divider {
  display:flex; align-items:center; gap:12px; margin:22px 0;
}
.auth-divider hr {
  flex:1; border:none; border-top:1px solid var(--border) !important; margin:0 !important;
}
.auth-divider span { font-size:.76rem; color:var(--muted); white-space:nowrap; }
.guest-link {
  text-align:center; margin-top:14px;
  font-size:.81rem; color:var(--muted); line-height:1.6;
}

/* ═══ OTP CARD ═══════════════════════════════════════════════════════════════ */
.otp-card {
  background:var(--surface); border:2px dashed rgba(61,220,132,.3);
  border-radius:18px; padding:30px 26px; text-align:center; margin-bottom:20px;
  animation: fadeSlideUp .35s ease both;
  animation: borderPulse 2.5s ease-in-out infinite;
}
.otp-title { font-family:'Playfair Display',serif; font-size:1.25rem; color:var(--green); margin-bottom:8px; }
.otp-sub   { color:var(--muted); font-size:.85rem; line-height:1.6; margin-bottom:14px; }
.otp-digits {
  font-family:'Courier New',monospace;
  font-size:3rem; font-weight:700; letter-spacing:.35em; color:var(--green);
  margin:14px 0; text-shadow:0 0 24px rgba(61,220,132,.35);
  animation: shimmer 2s ease-in-out infinite;
}
.otp-timer {
  display:inline-block;
  background:rgba(240,165,0,.1); border:1px solid rgba(240,165,0,.28);
  border-radius:20px; padding:3px 14px; font-size:.78rem; color:var(--gold);
}

/* ═══ TABS ════════════════════════════════════════════════════════════════════ */
.stTabs [data-baseweb="tab-list"] {
  background:var(--surface); border-radius:12px;
  padding:4px; gap:3px; border:1px solid var(--border);
}
.stTabs [data-baseweb="tab"] {
  background:transparent; color:var(--muted);
  border-radius:9px; font-weight:500; font-size:.88rem;
  padding:9px 18px; border:none;
  transition:color .18s, background .18s;
  white-space:nowrap;
}
.stTabs [data-baseweb="tab"]:hover:not([aria-selected="true"]) {
  color:var(--text); background:rgba(255,255,255,.04);
}
.stTabs [aria-selected="true"] {
  background:linear-gradient(135deg,var(--green),var(--gdim)) !important;
  color:#fff !important;
  box-shadow:0 2px 14px rgba(61,220,132,.3);
}
.stTabs [data-baseweb="tab-panel"] {
  background:var(--card); border-radius:0 14px 14px 14px;
  padding:28px 32px; border:1px solid var(--border); border-top:none;
  animation: fadeIn .3s ease both;
}

/* ═══ INPUTS ═════════════════════════════════════════════════════════════════ */
.stTextInput > div > input,
.stTextArea  > div > textarea {
  background:var(--bg) !important; border:1.5px solid var(--border) !important;
  border-radius:10px !important; color:var(--text) !important;
  font-family:'DM Sans',sans-serif !important; font-size:.93rem !important;
  transition:border-color .2s, box-shadow .2s;
}
.stTextInput > div > input:hover,
.stTextArea  > div > textarea:hover { border-color:#3A4A6A !important; }
.stTextInput > div > input:focus,
.stTextArea  > div > textarea:focus {
  border-color:var(--green) !important;
  box-shadow:0 0 0 3px rgba(61,220,132,.12) !important;
}
.stSelectbox > div > div {
  background:var(--bg) !important; border:1.5px solid var(--border) !important;
  border-radius:10px !important; color:var(--text) !important;
  transition:border-color .2s;
}
.stSelectbox > div > div:hover { border-color:#3A4A6A !important; }
label { color:var(--muted) !important; font-size:.84rem !important; font-weight:500 !important; }

/* ═══ VALIDATION HINTS ═══════════════════════════════════════════════════════ */
.v-ok  { color:#3DDC84; font-size:.76rem; margin-top:-4px; margin-bottom:8px; }
.v-err { color:#FF6B6B; font-size:.76rem; margin-top:-4px; margin-bottom:8px; }

/* ═══ BUTTONS ════════════════════════════════════════════════════════════════ */
.stButton > button {
  background:linear-gradient(135deg,var(--green),var(--gdim));
  color:#fff; border:none; border-radius:10px;
  padding:.65em 1.4em;
  font-family:'DM Sans',sans-serif; font-weight:600; font-size:.92rem;
  box-shadow:0 4px 14px rgba(61,220,132,.2);
  transition:transform .18s, box-shadow .18s, filter .18s;
  width:100%; letter-spacing:.01em;
}
.stButton > button:hover {
  transform:translateY(-2px);
  box-shadow:0 8px 22px rgba(61,220,132,.35);
  filter:brightness(1.06);
}
.stButton > button:active { transform:translateY(0); filter:brightness(.94); }
.stButton > button:focus  { animation: pulseGreen 1.5s ease-in-out; }

/* Secondary buttons (non-active tab toggles) */
.stButton > button[kind="secondary"] {
  background:var(--surface) !important; color:var(--muted) !important;
  border:1.5px solid var(--border) !important; box-shadow:none !important;
}
.stButton > button[kind="secondary"]:hover {
  border-color:var(--green) !important; color:var(--text) !important;
  transform:translateY(-1px) !important;
}

/* ═══ RESULT BOX ═════════════════════════════════════════════════════════════ */
.result-box {
  background:linear-gradient(135deg,#0A1E0F,#0D1117);
  border:1px solid rgba(61,220,132,.22); border-radius:14px;
  padding:24px 26px; margin-top:18px;
  white-space:pre-wrap; font-size:.91rem; line-height:1.82; color:var(--text);
  position:relative; overflow:hidden;
  animation: fadeSlideUp .4s ease both;
}
.result-box::before {
  content:""; position:absolute; top:0; left:0;
  width:3px; height:100%;
  background:linear-gradient(to bottom,var(--green),transparent);
  border-radius:3px 0 0 3px;
}
.result-header {
  display:flex; align-items:center; gap:8px; margin-bottom:14px;
  font-size:.72rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.1em; color:var(--green);
}

/* ═══ DASHBOARD ══════════════════════════════════════════════════════════════ */
.dash-grid {
  display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px;
}
.dash-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:20px 16px; text-align:center;
  transition:border-color .2s, transform .22s, box-shadow .22s; cursor:default;
  animation: fadeSlideUp .4s ease both;
}
.dash-card:hover {
  border-color:var(--green); transform:translateY(-4px);
  box-shadow:0 8px 24px rgba(61,220,132,.1);
}
.dash-icon { font-size:1.4rem; margin-bottom:7px; }
.dash-num  { font-family:'Playfair Display',serif; font-size:2rem; color:var(--green); line-height:1; }
.dash-lbl  { font-size:.71rem; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin-top:5px; }

.profile-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:16px; padding:26px 30px; margin-bottom:20px;
}
.profile-row { display:flex; align-items:flex-start; gap:20px; }
.avatar {
  width:64px; height:64px; border-radius:50%;
  background:linear-gradient(135deg,var(--green),var(--gdim));
  display:flex; align-items:center; justify-content:center;
  font-size:1.6rem; flex-shrink:0;
  box-shadow:0 4px 18px rgba(61,220,132,.25);
}
.profile-info { flex:1; min-width:0; }
.profile-name  { font-size:1.25rem; font-weight:700; color:var(--text); margin-bottom:3px; }
.profile-email { color:var(--muted); font-size:.86rem; margin-bottom:8px; overflow:hidden; text-overflow:ellipsis; }
.badge-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
.badge-green {
  display:inline-flex; align-items:center; gap:4px;
  background:rgba(61,220,132,.08); border:1px solid rgba(61,220,132,.2);
  border-radius:20px; padding:2px 12px; font-size:.72rem; color:var(--green); font-weight:600;
}
.badge-red {
  display:inline-flex; align-items:center; gap:4px;
  background:rgba(255,107,107,.08); border:1px solid rgba(255,107,107,.2);
  border-radius:20px; padding:2px 12px; font-size:.72rem; color:var(--danger);
}
.meta-row { display:flex; gap:20px; flex-wrap:wrap; font-size:.78rem; color:var(--muted); }
.meta-row strong { color:var(--text); }
.recent-item {
  display:flex; align-items:center; gap:12px;
  padding:11px 0; border-bottom:1px solid var(--border);
}
.recent-icon  { font-size:1.1rem; width:28px; text-align:center; flex-shrink:0; }
.recent-title { font-size:.87rem; color:var(--text); flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.recent-time  { font-size:.74rem; color:var(--muted); white-space:nowrap; }

/* ═══ SECTION LABELS & MISC ══════════════════════════════════════════════════ */
.section-lbl {
  font-size:.71rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.12em; color:var(--green); margin-bottom:12px;
}
.completeness {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(91,155,213,.07); border:1px solid rgba(91,155,213,.16);
  border-radius:20px; padding:4px 14px; font-size:.76rem; color:var(--info); margin-bottom:10px;
}
.tip-box {
  background:rgba(240,165,0,.05); border:1px solid rgba(240,165,0,.18);
  border-radius:10px; padding:12px 16px; font-size:.83rem; color:#C8A060; line-height:1.6;
}
.info-box {
  background:rgba(91,155,213,.06); border:1px solid rgba(91,155,213,.16);
  border-radius:10px; padding:12px 16px; font-size:.83rem; color:#8BB8E8; line-height:1.6;
}
.warn-box {
  background:rgba(240,165,0,.06); border:1px solid rgba(240,165,0,.18);
  border-radius:10px; padding:12px 16px; font-size:.83rem; color:#C8A060; line-height:1.6;
}
.tag {
  display:inline-flex; align-items:center; gap:5px;
  background:rgba(61,220,132,.08); border:1px solid rgba(61,220,132,.2);
  border-radius:20px; padding:3px 12px; font-size:.76rem; color:var(--green);
}

/* ═══ CARDS / INTERACTIVE ELEMENTS ══════════════════════════════════════════ */
.trend-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius-sm); padding:12px 15px; margin-bottom:8px;
  transition:border-color .2s, transform .2s, box-shadow .2s; cursor:default;
}
.trend-card:hover {
  border-color:var(--green); transform:translateX(5px);
  box-shadow:0 4px 16px rgba(61,220,132,.08);
}
.feature-item {
  display:flex; align-items:center; gap:8px; font-size:.82rem;
  color:var(--text); background:var(--surface);
  border:1px solid var(--border); border-radius:10px; padding:9px 14px;
  transition:border-color .2s, transform .2s;
}
.feature-item:hover { border-color:var(--green); transform:translateY(-2px); }

/* ═══ GUEST BANNER ═══════════════════════════════════════════════════════════ */
.guest-banner {
  background:linear-gradient(135deg,rgba(240,165,0,.06),rgba(61,220,132,.05));
  border:1px solid rgba(240,165,0,.22); border-radius:16px;
  padding:30px 36px; text-align:center; margin-bottom:8px;
}
.guest-banner-icon   { font-size:2.6rem; margin-bottom:12px; }
.guest-banner-title  { font-family:'Playfair Display',serif; font-size:1.4rem; color:var(--text); margin-bottom:8px; }
.guest-banner-sub    { color:var(--muted); font-size:.88rem; line-height:1.6; margin-bottom:20px; }
.feature-list        { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:16px 0 20px; text-align:left; }

/* ═══ UPLOAD / SCAN ══════════════════════════════════════════════════════════ */
.upload-zone {
  border:2px dashed var(--border); border-radius:14px;
  padding:30px 20px; text-align:center; background:var(--surface);
  transition:border-color .2s, background .2s; margin-bottom:14px;
}
.upload-zone:hover { border-color:var(--green); background:rgba(61,220,132,.03); }
.upload-icon  { font-size:2.2rem; margin-bottom:8px; }
.upload-title { font-size:.92rem; font-weight:600; color:var(--text); margin-bottom:4px; }
.upload-sub   { font-size:.78rem; color:var(--muted); }
.upload-types { display:inline-flex; gap:6px; margin-top:10px; flex-wrap:wrap; justify-content:center; }
.file-chip {
  background:rgba(61,220,132,.08); border:1px solid rgba(61,220,132,.18);
  color:var(--green); border-radius:20px; padding:2px 10px; font-size:.7rem; font-weight:700;
}
.scan-box {
  background:var(--surface); border:2px dashed var(--border);
  border-radius:12px; padding:20px; text-align:center; margin-bottom:12px;
  transition:border-color .2s;
}
.scan-box:hover { border-color:var(--green); }

/* ═══ CHECK ITEMS ════════════════════════════════════════════════════════════ */
.check-item {
  display:flex; align-items:flex-start; gap:12px;
  padding:10px 0; border-bottom:1px solid var(--border);
}
.check-item:last-child { border-bottom:none; }
.check-icon  { font-size:1.1rem; flex-shrink:0; margin-top:1px; }
.check-title { font-size:.86rem; font-weight:600; color:var(--text); }
.check-desc  { font-size:.74rem; color:var(--muted); line-height:1.4; margin-top:1px; }

/* ═══ TYPOGRAPHY ═════════════════════════════════════════════════════════════ */
h1,h2,h3 { font-family:'Playfair Display',serif; color:var(--text) !important; }
h4,h5     { color:var(--muted) !important; font-weight:500 !important; }
hr        { border-color:var(--border) !important; margin:18px 0 !important; }

/* ═══ FILE UPLOADER ══════════════════════════════════════════════════════════ */
[data-testid="stFileUploader"] {
  background:var(--surface) !important;
  border:2px dashed var(--border) !important;
  border-radius:12px !important;
}
[data-testid="stFileUploader"]:hover { border-color:var(--green) !important; }
[data-testid="stFileUploaderDropzone"] { background:transparent !important; }

/* ═══ EXPANDER ═══════════════════════════════════════════════════════════════ */
.streamlit-expanderHeader {
  background:var(--surface) !important; border:1px solid var(--border) !important;
  border-radius:10px !important; color:var(--text) !important;
  transition: background .2s;
}
.streamlit-expanderHeader:hover { background:var(--card2) !important; }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────────────────────────────────────
_SS = {
    "user": None,
    "auth_mode": "login",          # login|register|forgot|otp_reg|otp_reset
    "pending_uid": None,
    "pending_email": "",
    "reset_uid": None,
    "screen_otp": "",
    "email_fail_reason": "",
    "career_result": None,
    "resume_result": None,
    "feedback_result": None,
    "mentor_result": None,
    "resume_meta": {},
    "prefill_q": "",
    "guest_tab": "login",          # login|register — for guest inline auth
    "show_roadmap": False,         # toggle roadmap after career result
    "voice_answer": "",            # latest voice mentor answer
    "ui_language": "English",      # selected UI / output language
}
for k, v in _SS.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─────────────────────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────────────────────
def call_api(endpoint, payload):
    try:
        r = requests.post(f"{API}{endpoint}", json=payload, timeout=30)
        r.raise_for_status()
        return r.json(), None
    except requests.exceptions.ConnectionError:
        return None, "⚠️ Cannot reach backend. Is `uvicorn backend.main:app --reload` running?"
    except requests.exceptions.Timeout:
        return None, "⚠️ Request timed out. Try again."
    except Exception as e:
        return None, f"⚠️ {e}"

def show_result(content, icon="✦"):
    st.markdown(f"""<div class="result-box">
        <div class="result-header">{icon} Result</div>{content}</div>""",
        unsafe_allow_html=True)

def vh(valid, msg):
    if msg:
        cls = "v-ok" if valid else "v-err"
        st.markdown(f"<div class='{cls}'>{msg}</div>", unsafe_allow_html=True)

def fmt_ts(ts):
    if not ts: return "—"
    import datetime
    return datetime.datetime.fromtimestamp(float(ts)).strftime("%d %b %Y, %H:%M")

def is_guest():
    return st.session_state.user and st.session_state.user.get("id") is None

def uid():
    u = st.session_state.user
    return u["id"] if (u and u.get("id") is not None) else None

def uname():
    u = st.session_state.user or {}
    return u.get("full_name") or u.get("username") or "Guest"

def _save(atype, title, payload="", result=""):
    save_history(uid(), atype, title,
                 json.dumps(payload) if isinstance(payload, dict) else str(payload),
                 str(result)[:4000])

def _parse_otp_msg(msg):
    """Parse OTP_SENT:email or OTP_SCREEN:otp:reason → (sent_ok, otp, reason)"""
    if msg.startswith("OTP_SENT:"):
        return True, "", ""
    if msg.startswith("OTP_SCREEN:"):
        parts = msg.split(":", 2)
        return False, parts[1] if len(parts) > 1 else "", parts[2] if len(parts) > 2 else ""
    return False, "", msg

def _clear_otp_state():
    st.session_state.screen_otp        = ""
    st.session_state.email_fail_reason = ""
    st.session_state.pending_uid       = None
    st.session_state.pending_email     = ""
    st.session_state.reset_uid         = None

TICONS = {"career":"🌱","resume":"📝","analysis":"📄","mentor":"🤖"}

# ─────────────────────────────────────────────────────────────────────────────
#  SHARED DATA
# ─────────────────────────────────────────────────────────────────────────────
EDU_LEVELS = {
    "🏫 Class 10 (SSC/CBSE/ICSE)": "10th",
    "📘 Class 12 / Intermediate":   "12th",
    "🎓 Diploma (Polytechnic)":     "diploma",
    "🎓 Bachelor's Degree (B.Tech / B.Sc / BA / B.Com)": "bachelors",
    "📚 Master's Degree (M.Tech / MBA / MCA / M.Sc)":    "masters",
    "🛠 ITI / Vocational Course":   "iti",
    "📜 Other / Self-taught / Bootcamp": "other",
}
CAREER_DOMAINS = {
    "💻 Software / IT":          ["Software Engineer","Web Developer","Mobile App Dev","QA Engineer","DevOps Engineer"],
    "📊 Data & Analytics":       ["Data Analyst","Data Scientist","Business Analyst","ML Engineer"],
    "🎨 Design & Creative":      ["UI/UX Designer","Graphic Designer","Video Editor","Content Creator"],
    "📣 Marketing & Sales":      ["Digital Marketer","SEO Specialist","Sales Executive","Social Media Manager"],
    "🏦 Finance & Banking":      ["Accountant","Finance Analyst","Bank PO","Tax Consultant"],
    "🏥 Healthcare":             ["Lab Technician","Nursing Assistant","Healthcare Admin","Pharmacist"],
    "🏭 Manufacturing / Trades": ["CNC Operator","Electrician","Fitter","Welder","Mechanic"],
    "🎓 Education":              ["Teacher","Tutor","EdTech Instructor","Academic Counselor"],
    "🛒 Retail & Operations":    ["Store Manager","Logistics Executive","Customer Support","Warehouse Supervisor"],
    "🏛 Government / Civil":     ["SSC CGL","Railway Jobs","State PSC","Clerk / Peon Posts"],
}
TARGET_COMPANIES = {
    "💻 Software / IT":          ["TCS","Infosys","Wipro","HCL","Accenture","Cognizant","Google","Microsoft","Amazon","Startup"],
    "📊 Data & Analytics":       ["Mu Sigma","Fractal Analytics","Latent View","IBM","Deloitte","Other"],
    "🎨 Design & Creative":      ["Designit","Publicis Sapient","Zomato","Swiggy","Agency/Freelance"],
    "📣 Marketing & Sales":      ["Byju's","Unacademy","PhonePe","Paytm","OYO","Any MNC","Startup"],
    "🏦 Finance & Banking":      ["SBI","HDFC Bank","ICICI Bank","Axis Bank","KPMG","EY","PwC"],
    "🏥 Healthcare":             ["Apollo Hospitals","Fortis","Max Healthcare","Govt Hospital"],
    "🏭 Manufacturing / Trades": ["BHEL","NTPC","L&T","Bosch","Maruti Suzuki","TATA Motors"],
    "🎓 Education":              ["BYJU'S","Vedantu","Govt School","Private School","University"],
    "🛒 Retail & Operations":    ["Amazon","Flipkart","DMart","Reliance Retail","BigBasket"],
    "🏛 Government / Civil":     ["SSC","UPSC","State PSC","Railways","Bank Exams","Defence"],
}
TRENDING = {
    "10th":["💼 ITI Trades","🛒 Retail / Sales","🎨 Graphic Design","📞 BPO / Support"],
    "12th":["💻 Web Dev","📊 Data Entry","📣 Digital Marketing","🏦 Banking Clerk/PO"],
    "diploma":["⚙️ Junior Engineer","🏭 Production/Quality","🔧 Field Service Eng","💻 Web/App Dev"],
    "iti":["⚡ Electrician","🔩 CNC Operator","🚗 Auto Technician","🏭 NAPS Apprenticeship"],
    "bachelors":["💻 Software Eng","📊 Data Analyst","☁️ Cloud/DevOps","🎯 Product Manager"],
    "masters":["🤖 ML/AI Engineer","📈 Mgmt Consultant","🔬 Research Scientist","🏦 Investment Banking"],
    "iti_diploma_other":["🛠 Skilled Trades","📱 Mobile Repair","🍳 Food & Hospitality","🚛 Logistics"],
}
TRENDING_DESC = {
    "💼 ITI Trades":"Electrician, Fitter, COPA — high demand",
    "🛒 Retail / Sales":"Entry-level jobs available now",
    "🎨 Graphic Design":"Freelance after short course",
    "📞 BPO / Support":"Good salary, no degree needed",
    "💻 Web Dev":"Bootcamp → ₹2–4 LPA",
    "📊 Data Entry":"Govt & private hiring",
    "📣 Digital Marketing":"Short course + internship",
    "🏦 Banking Clerk/PO":"IBPS/SSC — massive hiring",
    "⚙️ Junior Engineer":"GATE, PSUs, Govt JE posts",
    "🏭 Production/Quality":"₹2–5 LPA",
    "🔧 Field Service Eng":"MNCs like Bosch, Siemens",
    "💻 Web/App Dev":"IT jobs accessible with skills",
    "⚡ Electrician":"CPWD, PWD — always in demand",
    "🔩 CNC Operator":"₹2–4 LPA auto industry",
    "🚗 Auto Technician":"Maruti, Hyundai hire ITI",
    "🏭 NAPS Apprenticeship":"Govt-sponsored + stipend",
    "💻 Software Eng":"TCS, Infosys, startups",
    "📊 Data Analyst":"SQL+Python → ₹4–10 LPA",
    "☁️ Cloud/DevOps":"AWS cert → ₹8–20 LPA",
    "🎯 Product Manager":"₹15–40 LPA after 2–3 yr",
    "🤖 ML/AI Engineer":"₹12–30 LPA top tech firms",
    "📈 Mgmt Consultant":"Big4 / McKinsey",
    "🔬 Research Scientist":"DRDO, ISRO, IITs",
    "🏦 Investment Banking":"₹15–50 LPA",
    "🛠 Skilled Trades":"Plumbing, electrical, welding",
    "📱 Mobile Repair":"Self-employment opportunity",
    "🍳 Food & Hospitality":"Hotel management roles",
    "🚛 Logistics":"Transport sector jobs",
}
CTX = {
    "10th": {"hint":"You don't have a stream yet — we'll suggest what to pick!",
             "extra":"📋 Subjects you liked","ph":"e.g. Maths, Science, Drawing",
             "goal":"🎯 What do you want?",
             "goals":["Get a job quickly","Study further (11th/12th)","Learn a trade / ITI","Start something of my own","Not sure yet"],
             "loc":True},
    "12th": {"hint":"","extra":"📚 Your 12th Stream & Marks","ph":"e.g. MPC — Maths 92, Physics 85",
             "goal":"🎯 What's your next step?",
             "goals":["Get a job now","Pursue a degree","Competitive exams (JEE/NEET)","Short course + job","Not sure yet"],
             "loc":True},
    "diploma":{"hint":"","extra":"🔧 Your Diploma Branch","ph":"e.g. Mechanical — CNC, AutoCAD",
               "goal":"🎯 Aiming for?",
               "goals":["Govt job (JE/PSU)","Private sector","B.Tech Lateral entry","Own business","Not sure"],
               "loc":False},
    "iti":{"hint":"","extra":"🔩 Your ITI Trade","ph":"e.g. Electrician, Fitter, COPA",
           "goal":"🎯 What next?",
           "goals":["Apprenticeship (NAPS/NATS)","Govt job (Railways/CPWD)","Private industry","Own workshop","Upgrade skills"],
           "loc":False},
    "bachelors":{"hint":"","extra":"🎓 Degree, Branch & College","ph":"e.g. B.Tech CSE — JNTU 2024, 7.8 CGPA",
                 "goal":"🎯 Your goal?",
                 "goals":["Placement / Job","Masters/MBA","Startup","Govt/PSU","Switch domain"],
                 "loc":False},
    "masters":{"hint":"","extra":"📚 Masters Degree & Specialisation","ph":"e.g. MBA Marketing — IIM Lucknow 2024",
               "goal":"🎯 Career focus?",
               "goals":["Senior corporate role","Research/Academia","Consulting","Entrepreneurship","International career"],
               "loc":False},
    "other":{"hint":"","extra":"📜 Course / Certification","ph":"e.g. Full Stack Dev — Udemy, 6 months",
             "goal":"🎯 Target?",
             "goals":["Freelance","Entry-level job","Build a startup","Upgrade to degree","Not sure"],
             "loc":True},
}

# ─────────────────────────────────────────────────────────────────────────────
#  REUSABLE: INLINE AUTH (used inside guest tabs)
# ─────────────────────────────────────────────────────────────────────────────
def render_inline_auth(ctx_key: str = "guest"):
    """Full auth flow rendered inside History/Dashboard tabs for guests."""
    tab_key = f"guest_tab_{ctx_key}"
    if tab_key not in st.session_state:
        st.session_state[tab_key] = "login"

    mode = st.session_state[tab_key]
    # OTP screens override
    if st.session_state.auth_mode == "otp_reg":
        _render_otp_screen("register", ctx_key)
        return
    if st.session_state.auth_mode == "otp_reset":
        _render_otp_screen("reset", ctx_key)
        return

    # Tab switcher
    c1, c2 = st.columns(2, gap="small")
    with c1:
        if st.button("🔑 Log In",   key=f"sw_li_{ctx_key}", use_container_width=True,
                     type="primary" if mode=="login" else "secondary"):
            st.session_state[tab_key] = "login"; st.rerun()
    with c2:
        if st.button("✨ Register", key=f"sw_rg_{ctx_key}", use_container_width=True,
                     type="primary" if mode=="register" else "secondary"):
            st.session_state[tab_key] = "register"; st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    if mode == "login":
        _render_login_form(ctx_key)
    elif mode == "forgot":
        _render_forgot_form(ctx_key)
    else:
        _render_register_form(ctx_key)


def _render_login_form(ctx_key):
    # Robot state: determine from current field values in session state
    _un_key = f"li_un_{ctx_key}"
    _pw_key = f"li_pw_{ctx_key}"
    _un_val = st.session_state.get(_un_key, "")
    _pw_val = st.session_state.get(_pw_key, "")

    # Determine robot state
    if _pw_val:
        _robot_state = "password"
    elif _un_val and len(_un_val) >= 3:
        _robot_state = "happy"
    elif _un_val and len(_un_val) > 0:
        _robot_state = "error"
    else:
        _robot_state = "idle"

    # Robot + form in 2-column layout for gate context only
    if ctx_key == "gate":
        _rob_col, _form_col = st.columns([1, 2], gap="medium")
        with _rob_col:
            render_robot(_robot_state, height=170)
        with _form_col:
            un = st.text_input("👤 Username or Email", key=_un_key,
                               placeholder="yourname or you@email.com")
            pw = st.text_input("🔒 Password", type="password", key=_pw_key,
                               placeholder="Your password")
            if st.button("Log In →", key=f"btn_li_{ctx_key}", use_container_width=True):
                if not un.strip() or not pw.strip():
                    st.error("Please fill in both fields.")
                else:
                    user, status = login_user(un, pw)
                    if status == "ok":
                        st.session_state.user = user
                        st.session_state.auth_mode = "login"
                        st.rerun()
                    elif status == "verify_needed":
                        db_user = get_user_by_email(un.strip().lower())
                        if not db_user:
                            from auth import _conn as _ac
                            db = _ac(); row = db.execute(
                                "SELECT id,email FROM users WHERE username=?",
                                (un.strip().lower(),)
                            ).fetchone(); db.close()
                            db_user = dict(row) if row else None
                        if db_user:
                            st.session_state.pending_uid   = db_user["id"]
                            st.session_state.pending_email = db_user["email"]
                            st.session_state.auth_mode     = "otp_reg"
                            st.warning("⚠️ Email not verified. Enter the OTP to continue.")
                            st.rerun()
                        else:
                            st.error("Account not found.")
                    else:
                        st.error(status)
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("Forgot password?", key=f"fp_{ctx_key}"):
                st.session_state[f"guest_tab_{ctx_key}"] = "forgot"; st.rerun()
    else:
        un = st.text_input("👤 Username or Email", key=_un_key,
                           placeholder="yourname or you@anyprovider.com")
        pw = st.text_input("🔒 Password", type="password", key=_pw_key)
        if st.button("Log In →", key=f"btn_li_{ctx_key}", use_container_width=True):
            if not un.strip() or not pw.strip():
                st.error("Please fill in both fields.")
            else:
                user, status = login_user(un, pw)
                if status == "ok":
                    st.session_state.user = user
                    st.session_state.auth_mode = "login"
                    st.rerun()
                elif status == "verify_needed":
                    db_user = get_user_by_email(un.strip().lower())
                    if not db_user:
                        from auth import _conn as _ac
                        db = _ac(); row = db.execute(
                            "SELECT id,email FROM users WHERE username=?",
                            (un.strip().lower(),)
                        ).fetchone(); db.close()
                        db_user = dict(row) if row else None
                    if db_user:
                        st.session_state.pending_uid   = db_user["id"]
                        st.session_state.pending_email = db_user["email"]
                        st.session_state.auth_mode     = "otp_reg"
                        st.warning("⚠️ Email not verified. Enter the OTP to continue.")
                        st.rerun()
                    else:
                        st.error("Account not found.")
                else:
                    st.error(status)
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("Forgot password?", key=f"fp_{ctx_key}"):
            st.session_state[f"guest_tab_{ctx_key}"] = "forgot"; st.rerun()


def _render_forgot_form(ctx_key):
    st.markdown("**🔑 Reset your password**")
    st.markdown("<div class='info-box'>Enter your email — we'll send a 6-digit OTP.</div>",
                unsafe_allow_html=True)
    fp_em = st.text_input("📧 Your email", key=f"fp_em_{ctx_key}", placeholder="you@gmail.com")
    ve, me = validate_email(fp_em); vh(ve, me)

    if st.button("Send Reset OTP →", key=f"fp_send_{ctx_key}", use_container_width=True):
        if not ve:
            st.error("Enter a valid email.")
        else:
            ok, msg, uid_r = request_password_reset_otp(fp_em)
            if ok:
                sent_ok, sotp, sreason = _parse_otp_msg(msg)
                st.session_state.reset_uid         = uid_r
                st.session_state.pending_email     = fp_em.strip().lower()
                st.session_state.screen_otp        = sotp
                st.session_state.email_fail_reason = sreason
                st.session_state.auth_mode         = "otp_reset"
                st.rerun()
            else:
                st.error(msg)

    if st.button("← Back", key=f"fp_back_{ctx_key}"):
        st.session_state[f"guest_tab_{ctx_key}"] = "login"; st.rerun()


def _render_register_form(ctx_key):
    # Read current field values for robot state
    _un_val  = st.session_state.get(f"rg_un_{ctx_key}", "")
    _pw_val  = st.session_state.get(f"rg_pw_{ctx_key}", "")
    _fn_val  = st.session_state.get(f"rg_fn_{ctx_key}", "")
    _vun_ok, _ = validate_username(_un_val)
    _vpw_ok, _ = validate_password(_pw_val)

    if _pw_val:
        _robot_state = "password"
    elif _un_val and _vun_ok:
        _robot_state = "happy"
    elif _un_val and len(_un_val) > 0:
        _robot_state = "error"
    else:
        _robot_state = "idle"

    if not EMAIL_ENABLED:
        st.markdown("<div class='info-box'>⚙️ <strong>Dev mode</strong> — OTP will appear on screen.</div>",
                    unsafe_allow_html=True)
    else:
        st.markdown("<div class='info-box'>📧 OTP will be sent to your email after clicking Register.</div>",
                    unsafe_allow_html=True)

    if ctx_key == "gate":
        # Robot floats above the form
        _rc, _rf = st.columns([1, 2], gap="medium")
        with _rc:
            render_robot(_robot_state, height=170)
        with _rf:
            fn  = st.text_input("👤 Full Name",  key=f"rg_fn_{ctx_key}", placeholder="e.g. Ravi Kumar")
            vfn, mfn = validate_name(fn); vh(vfn, mfn)
            un  = st.text_input("🆔 Username",   key=f"rg_un_{ctx_key}", placeholder="letters, numbers, _")
            vun, mun = validate_username(un); vh(vun, mun)
            em  = st.text_input("📧 Email",      key=f"rg_em_{ctx_key}", placeholder="you@gmail.com or any email")
            vem, mem = validate_email(em); vh(vem, mem)
            pw  = st.text_input("🔒 Password",  type="password", key=f"rg_pw_{ctx_key}", placeholder="Min. 6 chars")
            vpw, mpw = validate_password(pw); vh(vpw, mpw)
            pw2 = st.text_input("🔒 Confirm",   type="password", key=f"rg_pw2_{ctx_key}")
            vpm, mpm = validate_password_match(pw, pw2); vh(vpm, mpm)
            if st.button("Register & Get OTP →", key=f"btn_rg_{ctx_key}", use_container_width=True):
                if all([vfn, vun, vem, vpw, vpm]):
                    ok, msg, new_uid = register_user(un, em, pw, fn)
                    if ok:
                        sent_ok, sotp, sreason = _parse_otp_msg(msg)
                        st.session_state.pending_uid       = new_uid
                        st.session_state.pending_email     = em.strip().lower()
                        st.session_state.screen_otp        = sotp
                        st.session_state.email_fail_reason = sreason
                        st.session_state.auth_mode         = "otp_reg"
                        st.rerun()
                    else:
                        st.error(msg)
                else:
                    st.error("Please fix the errors above.")
    else:
        fn  = st.text_input("👤 Full Name",  key=f"rg_fn_{ctx_key}", placeholder="e.g. Ravi Kumar")
        vfn, mfn = validate_name(fn); vh(vfn, mfn)
        un  = st.text_input("🆔 Username",   key=f"rg_un_{ctx_key}", placeholder="letters, numbers, _")
        vun, mun = validate_username(un); vh(vun, mun)
        em  = st.text_input("📧 Email",      key=f"rg_em_{ctx_key}", placeholder="you@gmail.com or any email")
        vem, mem = validate_email(em); vh(vem, mem)
        pw  = st.text_input("🔒 Password",  type="password", key=f"rg_pw_{ctx_key}", placeholder="Min. 6 characters")
        vpw, mpw = validate_password(pw); vh(vpw, mpw)
        pw2 = st.text_input("🔒 Confirm",   type="password", key=f"rg_pw2_{ctx_key}")
        vpm, mpm = validate_password_match(pw, pw2); vh(vpm, mpm)
        if st.button("Register & Get OTP →", key=f"btn_rg_{ctx_key}", use_container_width=True):
            if all([vfn, vun, vem, vpw, vpm]):
                ok, msg, new_uid = register_user(un, em, pw, fn)
                if ok:
                    sent_ok, sotp, sreason = _parse_otp_msg(msg)
                    st.session_state.pending_uid       = new_uid
                    st.session_state.pending_email     = em.strip().lower()
                    st.session_state.screen_otp        = sotp
                    st.session_state.email_fail_reason = sreason
                    st.session_state.auth_mode         = "otp_reg"
                    st.rerun()
                else:
                    st.error(msg)
            else:
                st.error("Please fix the errors above.")


def _render_otp_screen(purpose: str, ctx_key: str):
    uid_val    = st.session_state.pending_uid if purpose == "register" else st.session_state.reset_uid
    email_hint = st.session_state.pending_email
    sotp       = st.session_state.screen_otp
    sreason    = st.session_state.email_fail_reason
    remaining  = otp_remaining(uid_val) if uid_val else 0
    mins, secs = divmod(remaining, 60)

    # Which box to show
    if sotp:
        # Email failed — show OTP on screen
        if "NETWORK_ERROR" in sreason:
            why = "📡 Network blocked — OTP shown here instead"
        elif "AUTH_ERROR" in sreason:
            why = "🔑 SMTP credentials wrong — OTP shown here"
        elif "not configured" in sreason.lower():
            why = "⚙️ Dev mode — SMTP not set up"
        else:
            why = "📧 Email delivery failed"

        st.markdown(f"""
        <div class='otp-card'>
            <div class='otp-title'>🔢 Your OTP is below</div>
            <div class='otp-sub'>
                <span style='color:#FF6B6B;font-size:.8rem'>{why}</span><br>
                Copy this code and paste it in the box below:
            </div>
            <div class='otp-digits'>{sotp}</div>
            <div class='otp-timer'>⏱ Expires in {mins}m {secs:02d}s</div>
        </div>""", unsafe_allow_html=True)
    else:
        # Email sent successfully
        st.markdown(f"""
        <div class='otp-card'>
            <div class='otp-title'>📧 Check your inbox</div>
            <div class='otp-sub'>
                A 6-digit OTP was sent to<br>
                <strong style='color:#3DDC84'>{email_hint}</strong><br>
                <span style='font-size:.78rem;color:#7A8BA0'>Check spam/junk if not in inbox</span>
            </div>
            <div class='otp-timer'>⏱ Expires in {mins}m {secs:02d}s</div>
        </div>""", unsafe_allow_html=True)

    otp_in = st.text_input("🔢 Enter 6-digit OTP", max_chars=6,
                           placeholder="e.g. 482931", key=f"otp_in_{purpose}_{ctx_key}")

    if purpose == "reset":
        np1 = st.text_input("🔒 New Password", type="password", key=f"np1_{ctx_key}")
        np2 = st.text_input("🔒 Confirm",      type="password", key=f"np2_{ctx_key}")
        vpw, mpw = validate_password(np1); vh(vpw, mpw)
        vpm, mpm = validate_password_match(np1, np2); vh(vpm, mpm)

    col_v, col_r = st.columns([3, 2], gap="small")
    with col_v:
        if st.button("✅ Verify OTP", key=f"do_verify_{purpose}_{ctx_key}", use_container_width=True):
            if not otp_in.strip():
                st.error("Enter the OTP.")
            elif purpose == "register":
                ok, msg = verify_registration_otp(uid_val, otp_in)
                if ok:
                    from auth import _conn as _ac
                    db = _ac()
                    row = dict(db.execute("SELECT * FROM users WHERE id=?", (uid_val,)).fetchone() or {})
                    db.close()
                    if row:
                        st.session_state.user = row
                        st.session_state.auth_mode = "login"
                        _clear_otp_state()
                        st.rerun()
                else:
                    st.error(msg)
            else:
                if not vpw or not vpm:
                    st.error("Fix password errors first.")
                else:
                    ok, msg = verify_reset_otp_and_change(uid_val, otp_in, np1)
                    if ok:
                        st.success("✅ Password updated! You can now log in.")
                        st.session_state.auth_mode = "login"
                        _clear_otp_state()
                        st.rerun()
                    else:
                        st.error(msg)
    with col_r:
        if st.button("🔄 Resend", key=f"resend_{purpose}_{ctx_key}", use_container_width=True):
            if purpose == "register":
                ok, msg = resend_registration_otp(uid_val)
            else:
                ok, msg, _ = request_password_reset_otp(email_hint)
            if ok:
                sent_ok, new_otp, new_reason = _parse_otp_msg(msg)
                st.session_state.screen_otp        = new_otp
                st.session_state.email_fail_reason = new_reason
                st.rerun()
            else:
                st.error(msg)

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("← Back", key=f"otp_back_{purpose}_{ctx_key}"):
        st.session_state.auth_mode = "login"
        _clear_otp_state()
        st.rerun()


# ─────────────────────────────────────────────────────────────────────────────
#  GUEST UPGRADE BANNER
# ─────────────────────────────────────────────────────────────────────────────
def render_guest_upgrade(ctx_key: str, title: str, subtitle: str):
    """Full-width guest upgrade prompt with feature list + inline auth."""
    st.markdown(f"""
    <div class='guest-banner'>
        <div class='guest-banner-icon'>🔐</div>
        <div class='guest-banner-title'>{title}</div>
        <div class='guest-banner-sub'>{subtitle}</div>
        <div class='feature-list'>
            <div class='feature-item'>🌱 Save career guidance</div>
            <div class='feature-item'>📝 Revisit your resumes</div>
            <div class='feature-item'>🤖 Mentor conversation log</div>
            <div class='feature-item'>📊 Personal dashboard</div>
            <div class='feature-item'>🔐 Secure & private</div>
            <div class='feature-item'>🆓 Always free</div>
        </div>
    </div>""", unsafe_allow_html=True)

    with st.expander("🔑 Log In or Create Account", expanded=True):
        render_inline_auth(ctx_key)


# ─────────────────────────────────────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────────────────────────────────────
if st.session_state.user:
    if is_guest():
        pill = "<span class='guest-pill'>👤 Browsing as Guest</span>"
    else:
        pill = f"<span class='user-pill'>👤 {uname()}</span>"
else:
    pill = ""

st.markdown(f"""
<div class="hero" style="animation:fadeSlideUp .45s ease both;">
  <div class="hero-row">
    <div>
      <div class="hero-badge">🌿 AI-Powered Career Platform</div>
      <div class="hero-title">VidyGuide</div>
      <p class="hero-sub">Your intelligent companion for career discovery, resume crafting & mentorship.</p>
    </div>
    <div>{pill}</div>
  </div>
</div>""", unsafe_allow_html=True)

st.markdown("""
<div class="stats-row">
  <div class="stat-card" onmouseover="this.style.borderColor='#3DDC84';this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(61,220,132,.12)'" onmouseout="this.style.borderColor='#2A3550';this.style.transform='none';this.style.boxShadow='none'">
    <div class="stat-num">10+</div><div class="stat-label">Career Paths</div></div>
  <div class="stat-card" onmouseover="this.style.borderColor='#3DDC84';this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(61,220,132,.12)'" onmouseout="this.style.borderColor='#2A3550';this.style.transform='none';this.style.boxShadow='none'">
    <div class="stat-num">12</div><div class="stat-label">Languages</div></div>
  <div class="stat-card" onmouseover="this.style.borderColor='#3DDC84';this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(61,220,132,.12)'" onmouseout="this.style.borderColor='#2A3550';this.style.transform='none';this.style.boxShadow='none'">
    <div class="stat-num">24/7</div><div class="stat-label">AI Mentor</div></div>
  <div class="stat-card" onmouseover="this.style.borderColor='#3DDC84';this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(61,220,132,.12)'" onmouseout="this.style.borderColor='#2A3550';this.style.transform='none';this.style.boxShadow='none'">
    <div class="stat-num">Free</div><div class="stat-label">Always</div></div>
</div>""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
#  AUTH GATE  (first visit — not logged in at all)
# ─────────────────────────────────────────────────────────────────────────────
if st.session_state.user is None:

    # OTP screens — centered card
    if st.session_state.auth_mode in ('otp_reg', 'otp_reset'):
        _oa, _ob, _oc = st.columns([1, 2, 1])
        with _ob:
            st.markdown(
                "<div style='background:var(--card);border:1px solid var(--border);"
                "border-radius:20px;padding:40px 44px;'>",
                unsafe_allow_html=True)
            purpose = 'register' if st.session_state.auth_mode == 'otp_reg' else 'reset'
            _render_otp_screen(purpose, 'gate')
            st.markdown('</div>', unsafe_allow_html=True)
        st.stop()

    # ── Full 50/50 split-screen layout ────────────────────────────────────
    _al, _ar = st.columns([1, 1], gap='large')

    with _al:
        st.markdown("""
<div class='auth-left'>
  <div class='auth-left-logo'>🌿 VidyGuide</div>
  <div class='auth-left-tagline'>Your AI-powered career companion —<br>free for every Indian student.</div>
  <div class='auth-feature'>
    <div class='auth-feature-icon'>🌱</div>
    <div class='auth-feature-text'>
      <strong>Personalised Career Guidance</strong>
      <span>AI suggestions from Class 10 to Postgraduate</span>
    </div>
  </div>
  <div class='auth-feature'>
    <div class='auth-feature-icon'>📄</div>
    <div class='auth-feature-text'>
      <strong>AI Resume Builder + PDF Export</strong>
      <span>Targeted resumes with OCR scanner support</span>
    </div>
  </div>
  <div class='auth-feature'>
    <div class='auth-feature-icon'>🗣️</div>
    <div class='auth-feature-text'>
      <strong>Voice Mentor in 12 Languages</strong>
      <span>Telugu, Hindi, Tamil and 9 more</span>
    </div>
  </div>
  <div class='auth-feature'>
    <div class='auth-feature-icon'>🗺️</div>
    <div class='auth-feature-text'>
      <strong>Career Roadmap Visualiser</strong>
      <span>Month-by-month milestone timeline</span>
    </div>
  </div>
  <div class='auth-feature'>
    <div class='auth-feature-icon'>📊</div>
    <div class='auth-feature-text'>
      <strong>Personal Dashboard + History</strong>
      <span>All your guidance saved and accessible</span>
    </div>
  </div>
</div>""", unsafe_allow_html=True)

    with _ar:
        _mode = st.session_state.auth_mode

        if _mode == 'forgot':
            st.markdown(
                "<div style='font-family:Playfair Display,serif;font-size:1.8rem;"
                "font-weight:700;color:var(--text);margin-bottom:6px;'>🔑 Reset Password</div>"
                "<div style='color:var(--muted);font-size:.88rem;margin-bottom:22px;'"
                ">Enter your registered email — we will send a 6-digit OTP.</div>",
                unsafe_allow_html=True)
            _render_forgot_form('gate')
        else:
            _tc1, _tc2 = st.columns(2, gap='small')
            with _tc1:
                if st.button('🔑  Log In', key='gate_sw_li',
                             type='primary' if _mode == 'login' else 'secondary',
                             use_container_width=True):
                    st.session_state.auth_mode = 'login'; st.rerun()
            with _tc2:
                if st.button('✨  Register', key='gate_sw_rg',
                             type='primary' if _mode == 'register' else 'secondary',
                             use_container_width=True):
                    st.session_state.auth_mode = 'register'; st.rerun()

            st.markdown('<br>', unsafe_allow_html=True)

            if _mode == 'login':
                st.markdown(
                    "<div style='font-family:Playfair Display,serif;font-size:1.85rem;"
                    "font-weight:700;color:var(--text);margin-bottom:4px;'>👋 Welcome back</div>"
                    "<div style='color:var(--muted);font-size:.88rem;margin-bottom:22px;"
                    "line-height:1.55;'>Log in to access your history, dashboard and all features.</div>",
                    unsafe_allow_html=True)
                _render_login_form('gate')
            else:
                st.markdown(
                    "<div style='font-family:Playfair Display,serif;font-size:1.85rem;"
                    "font-weight:700;color:var(--text);margin-bottom:4px;'>🌱 Create account</div>"
                    "<div style='color:var(--muted);font-size:.88rem;margin-bottom:22px;"
                    "line-height:1.55;'>Free forever. Any email works — Gmail, Yahoo, college, etc.</div>",
                    unsafe_allow_html=True)
                _render_register_form('gate')

        st.markdown(
            "<div style='display:flex;align-items:center;gap:12px;margin:24px 0;'>"
            "<div style='flex:1;border-top:1px solid var(--border);'></div>"
            "<span style='font-size:.76rem;color:var(--muted);white-space:nowrap;padding:0 6px;'>or</span>"
            "<div style='flex:1;border-top:1px solid var(--border);'></div>"
            "</div>",
            unsafe_allow_html=True)
        if st.button('👤  Continue as Guest', key='btn_guest', use_container_width=True):
            st.session_state.user = {
                'id': None, 'username': 'Guest',
                'full_name': 'Guest', 'email': '', 'is_verified': 0
            }
            st.rerun()
        st.markdown(
            "<div style='text-align:center;margin-top:12px;font-size:.8rem;color:var(--muted);'>"
            "History and dashboard not saved in guest mode.</div>",
            unsafe_allow_html=True)

    st.stop()

# ─────────────────────────────────────────────────────────────────────────────
#  MAIN TABS  (Dashboard hidden for guests)
# ─────────────────────────────────────────────────────────────────────────────
# Tabs: Career | Resume | AI Mentor | Voice Mentor | History | Dashboard(auth only)
_tab_labels = ["🌱 Career", "📝 Resume", "📄 Analyzer", "🤖 Mentor", "🗣 Voice", "🕘 History"]
if not is_guest():
    _tab_labels.append("📊 Dashboard")

_tabs      = st.tabs(_tab_labels)
tab1       = _tabs[0]   # Career Guidance
tab2       = _tabs[1]   # Resume Builder
tab3       = _tabs[2]   # Resume Analyzer
tab4       = _tabs[3]   # AI Mentor
tab_voice  = _tabs[4]   # Voice Mentor
tab5       = _tabs[5]   # History
tab6       = _tabs[6] if len(_tabs) > 6 else None  # Dashboard

# ═══════════════════════════════════════════════════════════════════
#  TAB 1 — CAREER GUIDANCE
# ═══════════════════════════════════════════════════════════════════
with tab1:
    st.markdown(
        "<div style='display:flex;align-items:center;gap:12px;margin-bottom:16px;'>"
        "<div style='font-size:1.6rem;'>🌱</div>"
        "<div><div style='font-family:Playfair Display,serif;font-size:1.5rem;font-weight:700;color:var(--text);'>Career Guidance</div>"
        "<div style='font-size:.86rem;color:var(--muted);'>From Class 10 to Masters — personalised AI roadmaps for every level.</div></div>"
        "</div>", unsafe_allow_html=True)

    st.markdown("<div class='section-lbl'>Step 1 — Your Academic Level</div>", unsafe_allow_html=True)
    edu_lbl = st.selectbox("Qualification", list(EDU_LEVELS.keys()), key="cg_edu",
                           label_visibility="collapsed")
    edu_lvl = EDU_LEVELS[edu_lbl]
    ctx     = CTX.get(edu_lvl, CTX["other"])
    tr_key  = edu_lvl if edu_lvl in TRENDING else "iti_diploma_other"
    if ctx["hint"]: st.info(ctx["hint"])
    st.divider()

    st.markdown("<div class='section-lbl'>Step 2 — Your Profile</div>", unsafe_allow_html=True)
    cl, cr = st.columns([3, 2], gap="large")

    with cl:
        extra = st.text_input(ctx["extra"], placeholder=ctx["ph"], key="cg_extra")
        ve, me = validate_free_text(extra); vh(ve, me)

        skills = st.text_input("🛠 Your Skills (comma-separated)",
                               placeholder="e.g. Python, Excel, Teamwork", key="cg_skills")
        vs, ms = validate_skills(skills); vh(vs, ms)

        interests = st.text_input("💡 Interests / Passions",
                                  placeholder="e.g. Computers, Design, Nature", key="cg_int")
        vi, mi = validate_interests(interests); vh(vi, mi)

        goal = st.selectbox(ctx["goal"], ctx["goals"], key="cg_goal")
        loc  = st.text_input("📍 City / State", placeholder="e.g. Guntur, AP",
                             key="cg_loc") if ctx["loc"] else ""
        note = st.text_area("💬 Anything else? (optional)",
                            placeholder="e.g. Need quick income, can't afford 4-yr degree…",
                            height=70, key="cg_note")
        filled = sum([bool(extra.strip()), vs, vi, bool(note.strip())])
        st.markdown(f"<div class='completeness'>📊 Profile completeness: {int(filled/4*100)}%</div>",
                    unsafe_allow_html=True)

    with cr:
        st.markdown("##### 🔥 Top Careers for Your Level")
        for _ti, t in enumerate(TRENDING[tr_key]):
            desc = TRENDING_DESC.get(t, "")
            delay = _ti * 0.06
            st.markdown(f"""
            <div class='trend-card' style='animation:fadeSlideUp .4s {delay:.2f}s ease both;'
                 onmouseover="this.style.borderColor='#3DDC84';this.style.transform='translateX(6px)';this.style.boxShadow='0 4px 16px rgba(61,220,132,.12)'"
                 onmouseout="this.style.borderColor='#2A3550';this.style.transform='none';this.style.boxShadow='none'">
              <div style='font-weight:700;color:var(--green);font-size:.87rem;margin-bottom:3px'>{t}</div>
              <div style='color:var(--muted);font-size:.78rem'>{desc}</div>
            </div>""", unsafe_allow_html=True)

    st.divider()
    cb, ch = st.columns([2, 3], gap="large")
    with cb:
        cg_go = st.button("✦ Get My Career Suggestions", key="btn_career", use_container_width=True)
    with ch:
        st.markdown("<div class='tip-box'>💡 The more you share, the more personalised your roadmap will be.</div>",
                    unsafe_allow_html=True)

    if cg_go:
        if not vs and not vi:
            st.warning("Enter at least your skills or interests to continue.")
        else:
            _reply_lang = get_lang_code(st.session_state.get("ui_language","English"))
            payload = {
                "skills": sanitize(skills), "interests": sanitize(interests),
                "education": edu_lbl, "education_level": edu_lvl,
                "education_detail": sanitize(extra), "goal": goal,
                "location": sanitize(loc), "extra_context": sanitize(note),
                "reply_language": _reply_lang,
            }
            with st.spinner("Building your personalised career roadmap…"):
                data, err = call_api("/career", payload)
            if err:
                st.error(err)
            else:
                res = data.get("career_suggestions", "No suggestions returned.")
                st.session_state.career_result = res
                # Always store the raw result for roadmap parsing
                # (roadmap regex only works on English text patterns)
                st.session_state.career_result_raw = res
                _save("career", f"Career — {edu_lbl.split(' ',1)[-1][:50]}", payload, res)
                st.success("✅ Your career guidance is ready!")

    if st.session_state.career_result:
        st.divider()
        _cr1, _cr2, _cr3 = st.columns([2, 2, 1], gap="small")
        with _cr1:
            _lang = st.selectbox("🌐 Reply language:",
                list(SUPPORTED_LANGUAGES.keys()),
                index=list(SUPPORTED_LANGUAGES.keys()).index(
                    st.session_state.get("ui_language","English")),
                key="career_lang_result")
            if _lang != st.session_state.get("ui_language","English"):
                st.session_state.ui_language = _lang
                # Don't clear result — keep it visible so roadmap still renders.
                # Just mark that a regeneration is needed for the new language.
                st.session_state["career_lang_pending"] = _lang
        with _cr2:
            _rm_lbl = "🗺️ Hide Roadmap" if st.session_state.get("show_roadmap") else "🗺️ View Roadmap"
            if st.button(_rm_lbl, key="btn_roadmap", use_container_width=True):
                st.session_state.show_roadmap = not st.session_state.get("show_roadmap", False)
                st.rerun()
        with _cr3:
            if st.button("🗑", key="btn_career_clear", use_container_width=True, help="Clear results"):
                st.session_state.career_result = None
                st.session_state.show_roadmap  = False
                st.rerun()
        # Show lang-change nudge if user changed language but hasn't regenerated
        if st.session_state.get("career_lang_pending") and            st.session_state.get("career_lang_pending") != "English":
            _pending = st.session_state["career_lang_pending"]
            st.info(f"🌐 Language set to **{_pending}**. Click **✦ Get My Career Suggestions** above to regenerate in {_pending}. The current result is shown below.")

        if st.session_state.get("show_roadmap"):
            # Use raw (English) result for roadmap parsing — regex won't work on translated text
            _roadmap_src = st.session_state.get("career_result_raw") or st.session_state.career_result
            render_roadmap(_roadmap_src)
            st.divider()
        # Show current result (Groq replied in the language at time of generation)
        show_result(st.session_state.career_result, "🌱")


# ═══════════════════════════════════════════════════════════════════
#  TAB 2 — RESUME BUILDER
# ═══════════════════════════════════════════════════════════════════
def _edu_fields(level):
    f = {}
    if level == "10th":
        a, b = st.columns(2, gap="medium")
        with a: f["board"]  = st.text_input("📋 Board", placeholder="CBSE / AP State Board")
        with b: f["school"] = st.text_input("🏫 School", placeholder="ZP High School, Guntur")
        c, d = st.columns(2, gap="medium")
        with c: f["year"] = st.text_input("📅 Year", placeholder="2022")
        with d: f["pct"]  = st.text_input("📊 Percentage", placeholder="82%")
        f["activities"] = st.text_area("🌟 Extracurriculars", placeholder="Sports, NCC, cultural…", height=65)
    elif level == "12th":
        a, b = st.columns(2, gap="medium")
        with a: f["board"]   = st.text_input("📋 Board", placeholder="CBSE / Telangana Inter")
        with b: f["college"] = st.text_input("🏫 College", placeholder="Narayana Junior College")
        c, d, e = st.columns(3, gap="medium")
        with c: f["stream"] = st.selectbox("📚 Stream", ["MPC","BiPC","MEC","HEC","CEC","Other"])
        with d: f["year"]   = st.text_input("📅 Year", placeholder="2024")
        with e: f["pct"]    = st.text_input("📊 %", placeholder="78%")
        f["activities"] = st.text_area("🌟 Achievements", placeholder="Rank, sports, cultural…", height=65)
    elif level == "diploma":
        a, b = st.columns(2, gap="medium")
        with a: f["branch"]  = st.text_input("🔧 Branch", placeholder="Civil / Mechanical / ECE")
        with b: f["college"] = st.text_input("🏫 Polytechnic", placeholder="Govt Polytechnic, Vijayawada")
        c, d = st.columns(2, gap="medium")
        with c: f["year"] = st.text_input("📅 Year", placeholder="2023")
        with d: f["pct"]  = st.text_input("📊 %", placeholder="74%")
        f["projects"] = st.text_area("💼 Projects", placeholder="Title — what you built…", height=75)
    elif level == "iti":
        a, b = st.columns(2, gap="medium")
        with a: f["trade"]     = st.text_input("🔧 Trade", placeholder="Electrician / Fitter / COPA")
        with b: f["institute"] = st.text_input("🏫 Institute", placeholder="Govt ITI, Guntur")
        c, d = st.columns(2, gap="medium")
        with c: f["year"]  = st.text_input("📅 Year", placeholder="2023")
        with d: f["grade"] = st.text_input("📊 Grade", placeholder="A / 75%")
        f["apprenticeship"] = st.text_input("🏭 Apprenticeship", placeholder="Company + duration")
    elif level in ["bachelors", "masters"]:
        a, b = st.columns(2, gap="medium")
        with a: f["degree"]  = st.text_input("🎓 Degree & Branch", placeholder="B.Tech CSE / MBA Marketing")
        with b: f["college"] = st.text_input("🏫 College", placeholder="JNTU Hyderabad")
        c, d = st.columns(2, gap="medium")
        with c: f["year"] = st.text_input("📅 Year", placeholder="2024")
        with d: f["cgpa"] = st.text_input("📊 CGPA/%", placeholder="8.2 / 75%")
        f["projects"]      = st.text_area("💼 Projects", placeholder="Title — Stack — Outcome (one per line)", height=80)
        f["internships"]   = st.text_area("🏢 Internships", placeholder="Company — Role — Duration", height=65)
        f["certs"]         = st.text_input("📜 Certifications", placeholder="AWS, Google Analytics, NPTEL")
    else:
        a, b = st.columns(2, gap="medium")
        with a: f["course"]   = st.text_input("📜 Course", placeholder="Full Stack Dev — Udemy 2023")
        with b: f["duration"] = st.text_input("⏱ Duration", placeholder="6 months")
        f["projects"] = st.text_area("💼 Projects Built", placeholder="What you made…", height=75)
    return f

with tab2:
    st.markdown("### 🎯 Smart Resume Builder")
    st.markdown("<p style='color:var(--muted);font-size:.88rem;margin-bottom:16px'>Targeted resumes for every education level and company.</p>",
                unsafe_allow_html=True)

    # Step 1
    st.markdown("<div class='section-lbl'>Step 1 — Education Level</div>", unsafe_allow_html=True)
    rb_edu_lbl = st.selectbox("Qualification", list(EDU_LEVELS.keys()), key="rb_edu",
                              label_visibility="collapsed")
    rb_edu_lvl = EDU_LEVELS[rb_edu_lbl]
    st.divider()

    # Step 2
    st.markdown("<div class='section-lbl'>Step 2 — Target Job & Company</div>", unsafe_allow_html=True)
    dc, rc, cc = st.columns(3, gap="medium")
    with dc: domain = st.selectbox("🏢 Domain", list(CAREER_DOMAINS.keys()))
    with rc: role   = st.selectbox("💼 Role",   CAREER_DOMAINS[domain])
    with cc:
        company = st.selectbox("🎯 Company", TARGET_COMPANIES.get(domain, ["Any"]))
        custom  = st.text_input("Or type company name", placeholder="Leave blank to use above")
        final_co = custom.strip() or company
    st.divider()

    # Step 3
    st.markdown("<div class='section-lbl'>Step 3 — Personal Details</div>", unsafe_allow_html=True)
    p1, p2 = st.columns(2, gap="large")
    with p1:
        rb_name = st.text_input("👤 Full Name",  placeholder="Ravi Kumar")
        vn, mn = validate_name(rb_name); vh(vn, mn)
        rb_ph   = st.text_input("📱 Phone",      placeholder="+91 98765 43210")
        vph,mph = validate_phone(rb_ph); vh(vph, mph)
    with p2:
        rb_em   = st.text_input("📧 Email",      placeholder="ravi@gmail.com")
        vem,mem = validate_email(rb_em); vh(vem, mem)
        rb_loc  = st.text_input("📍 City",       placeholder="Guntur, AP")
    rb_li = st.text_input("🔗 LinkedIn / GitHub (optional)", placeholder="linkedin.com/in/yourname")
    st.divider()

    # Step 4
    st.markdown("<div class='section-lbl'>Step 4 — Education Details</div>", unsafe_allow_html=True)
    edu_f = _edu_fields(rb_edu_lvl)
    st.divider()

    # Step 5
    st.markdown("<div class='section-lbl'>Step 5 — Skills & Additional Info</div>", unsafe_allow_html=True)
    s1, s2 = st.columns(2, gap="large")
    with s1:
        rb_sk  = st.text_area("🛠 Skills", placeholder="Python, Excel, Communication…", height=85)
        vsk,msk = validate_skills(rb_sk); vh(vsk, msk)
        rb_lg  = st.text_input("🗣 Languages", placeholder="Telugu, English, Hindi")
    with s2:
        rb_ac  = st.text_area("🏆 Achievements", placeholder="Topper, hackathon, NSS…", height=85)
        rb_hb  = st.text_input("🎯 Hobbies (optional)", placeholder="Cricket, Photography")
    st.divider()

    rb_pct = int(sum([vn, vph, vem, vsk, bool(rb_loc.strip())]) / 5 * 100)
    st.markdown(f"<div class='completeness'>📊 Resume completeness: {rb_pct}%"
                f"{'  ✅ Ready to generate!' if rb_pct >= 80 else ''}</div>",
                unsafe_allow_html=True)

    gb, gi = st.columns([2, 3], gap="large")
    with gb:
        gen_go = st.button("✦ Generate Targeted Resume", key="btn_resume", use_container_width=True)
    with gi:
        st.markdown(f"<div class='tip-box' style='margin-top:0'>🎯 Generating for <strong>{role}</strong>"
                    f" at <strong style='color:var(--gold)'>{final_co}</strong></div>",
                    unsafe_allow_html=True)

    if gen_go:
        if not vn:
            st.warning("Please enter your full name.")
        elif not vsk:
            st.warning("Please enter at least one skill.")
        else:
            payload = {
                "name": sanitize(rb_name), "phone": rb_ph, "email": rb_em,
                "location": sanitize(rb_loc), "linkedin": rb_li,
                "education_level": rb_edu_lbl, "target_role": role,
                "target_company": final_co, "domain": domain,
                "skills": sanitize(rb_sk), "languages": rb_lg,
                "achievements": sanitize(rb_ac), "hobbies": rb_hb,
                "education": str(edu_f), "projects": edu_f.get("projects", ""),
                **{f"edu_{k}": v for k, v in edu_f.items()},
            }
            with st.spinner(f"Crafting your resume for {role} at {final_co}…"):
                data, err = call_api("/resume", payload)
            if err:
                st.error(err)
            else:
                res = data.get("resume", "No resume generated.")
                st.session_state.resume_result = res
                st.session_state.resume_meta   = {"role": role, "company": final_co}
                _save("resume", f"Resume — {role} @ {final_co}", payload, res)
                st.success(f"✅ Resume ready for **{role}** at **{final_co}**!")

    if st.session_state.resume_result:
        st.divider()
        meta = st.session_state.resume_meta
        st.markdown(f"<div class='result-header'>📄 {meta.get('role','')} @ {meta.get('company','')}</div>",
                    unsafe_allow_html=True)
        rc1, rc2 = st.columns([4, 1], gap="medium")
        with rc1:
            edited = st.text_area("", st.session_state.resume_result,
                                  height=420, label_visibility="collapsed")
        with rc2:
            st.markdown("<br>", unsafe_allow_html=True)
            # TXT download
            fname_txt = f"resume_{meta.get('role','').replace(' ','_')}.txt"
            st.download_button("⬇ Download .txt", edited, file_name=fname_txt,
                               mime="text/plain", use_container_width=True)
            st.markdown("<br>", unsafe_allow_html=True)
            # PDF download
            if REPORTLAB_OK:
                try:
                    _pdf_bytes = generate_resume_pdf(
                        edited,
                        name=rb_name if 'rb_name' in dir() else "",
                        phone=rb_ph  if 'rb_ph'  in dir() else "",
                        email=rb_em  if 'rb_em'  in dir() else "",
                        location=rb_loc if 'rb_loc' in dir() else "",
                    )
                    fname_pdf = f"resume_{meta.get('role','').replace(' ','_')}.pdf"
                    st.download_button("📄 Download PDF", _pdf_bytes, file_name=fname_pdf,
                                       mime="application/pdf", use_container_width=True)
                except Exception as _pdf_err:
                    st.caption(f"PDF error: {_pdf_err}")
            else:
                st.markdown("<div class='tip-box' style='font-size:.74rem'>Install reportlab for PDF export.</div>",
                            unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🔄 New Resume", key="btn_rr", use_container_width=True):
                st.session_state.resume_result = None
                st.rerun()
            st.markdown("<div class='tip-box' style='font-size:.76rem;margin-top:10px'>✏️ Edit above before downloading.</div>",
                        unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════
#  TAB 3 — RESUME ANALYZER
# ═══════════════════════════════════════════════════════════════════
with tab3:
    st.markdown('### 📄 Resume Analyzer')
    st.markdown(
        "<p style='color:var(--muted);font-size:.88rem;margin-bottom:18px'>"
        'Upload or paste your resume — get detailed AI feedback and actionable improvements.</p>',
        unsafe_allow_html=True)

    _a_left, _a_right = st.columns([3, 2], gap='large')

    with _a_left:
        _inp_tab1, _inp_tab2 = st.tabs(['📁 Upload File', '📋 Paste Text'])

        with _inp_tab1:
            st.markdown(
                "<div class='upload-zone'>"
                "<div class='upload-icon'>📁</div>"
                "<div class='upload-title'>Drop your resume here</div>"
                "<div class='upload-sub'>Supports PDF, JPG, PNG, TXT</div>"
                "<div class='upload-types'>"
                "<span class='file-chip'>PDF</span> "
                "<span class='file-chip'>JPG/PNG</span> "
                "<span class='file-chip'>TXT</span>"
                "</div></div>",
                unsafe_allow_html=True)
            _uf = st.file_uploader(
                'Choose file',
                type=['pdf','jpg','jpeg','png','bmp','webp','txt'],
                label_visibility='collapsed',
                key='analyzer_upload')
            if _uf:
                with st.spinner(f'Reading {_uf.name}…'):
                    _sok, _stxt = scan_resume_file(_uf)
                if _sok:
                    st.markdown(
                        f"<div class='tag'>✅ {len(_stxt.split())} words extracted</div>",
                        unsafe_allow_html=True)
                    if st.button('✦ Analyze This Resume', key='btn_scan_analyze',
                                 use_container_width=True):
                        _an_lang = get_lang_code(st.session_state.get('ui_language','English'))
                        with st.spinner('Analyzing…'):
                            _d, _e = call_api('/resume-feedback',
                                              {'resume': sanitize(_stxt, 4000),
                                               'reply_language': _an_lang})
                        if _e: st.error(_e)
                        else:
                            _res = _d.get('feedback','No feedback.')
                            st.session_state.feedback_result = _res
                            _save('analysis', f'Scan: {_uf.name}', {}, _res)
                            st.success('✅ Analysis complete!')
                else:
                    st.error(f'❌ {_stxt}')

        with _inp_tab2:
            _rt = st.text_area(
                'Paste resume text',
                height=250,
                placeholder='Paste the full text of your resume here…',
                label_visibility='collapsed',
                key='analyzer_paste')
            _vrt, _mrt = validate_resume_text(_rt)
            if _mrt:
                st.markdown(
                    f"<div class='{'v-ok' if _vrt else 'v-err'}'>{_mrt}</div>",
                    unsafe_allow_html=True)
            _al2c, _an2c = st.columns([2, 3], gap='small')
            with _al2c:
                _anlang = st.selectbox('🌐 Reply in:',
                    list(SUPPORTED_LANGUAGES.keys()),
                    index=list(SUPPORTED_LANGUAGES.keys()).index(
                        st.session_state.get('ui_language','English')),
                    key='analyzer_lang')
                if _anlang != st.session_state.get('ui_language','English'):
                    st.session_state.ui_language = _anlang
            with _an2c:
                st.markdown('<br>', unsafe_allow_html=True)
                if st.button('✦ Analyze Resume', key='btn_paste_analyze',
                             use_container_width=True):
                    if not _vrt:
                        st.warning('Paste more content for a meaningful analysis.')
                    else:
                        with st.spinner('Analyzing your resume…'):
                            _d, _e = call_api('/resume-feedback',
                                              {'resume': sanitize(_rt, 4000),
                                               'reply_language': get_lang_code(_anlang)})
                        if _e: st.error(_e)
                        else:
                            _res = _d.get('feedback','No feedback.')
                            st.session_state.feedback_result = _res
                            _save('analysis','Resume Analysis',{'chars':len(_rt)},_res)
                            st.success('✅ Analysis complete!')

    with _a_right:
        st.markdown('##### 🔍 What We Check')
        for _ico, _cht, _chd in [
            ('🎯','Impact & Action Verbs','Strong, results-driven verbs?'),
            ('📐','Structure & Formatting','Clear sections, consistent layout?'),
            ('🔍','ATS Keyword Density','Will it pass automated screening?'),
            ('✍️','Clarity & Conciseness','Every word earning its place?'),
            ('📊','Quantified Achievements','Numbers, %, impact metrics?'),
            ('⚡','Skills Relevance','Right skills for your target role?'),
            ('🌐','Online Presence','LinkedIn, GitHub, portfolio links?'),
        ]:
            st.markdown(
                f"<div class='check-item'>"
                f"<div class='check-icon'>{_ico}</div>"
                f"<div class='check-text'>"
                f"<div class='check-title'>{_cht}</div>"
                f"<div class='check-desc'>{_chd}</div>"
                f"</div></div>",
                unsafe_allow_html=True)
        st.markdown(
            "<div class='info-box' style='margin-top:16px;font-size:.8rem'>"
            '💡 After feedback, use the <strong>Resume Builder</strong> '
            'tab to create an improved version targeting a specific role.'
            '</div>', unsafe_allow_html=True)

    if st.session_state.feedback_result:
        st.divider()
        _fc1, _fc2 = st.columns([5, 1], gap='small')
        with _fc2:
            if st.button('🗑 Clear', key='btn_clear_feedback',
                         use_container_width=True):
                st.session_state.feedback_result = None
                st.rerun()
        show_result(st.session_state.feedback_result, '📄')


# ═══════════════════════════════════════════════════════════════════
#  TAB 4 — AI MENTOR
# ═══════════════════════════════════════════════════════════════════
with tab4:
    st.markdown("### 🤖 AI Career Mentor")
    st.markdown("<p style='color:var(--muted);font-size:.88rem;margin-bottom:16px'>Ask anything about careers, interviews, skills, or life decisions.</p>",
                unsafe_allow_html=True)

    # Language selector — changes language for the NEXT reply
    _mhl1, _mhl2 = st.columns([3, 4], gap="small")
    with _mhl1:
        _mentor_lang_sel = st.selectbox(
            "🌐 Reply language:",
            list(SUPPORTED_LANGUAGES.keys()),
            index=list(SUPPORTED_LANGUAGES.keys()).index(
                st.session_state.get("ui_language","English")),
            key="mentor_lang_sel",
            help="Mentor will reply in this language")
        if _mentor_lang_sel != st.session_state.get("ui_language","English"):
            st.session_state.ui_language = _mentor_lang_sel
    with _mhl2:
        if st.session_state.get("ui_language","English") != "English":
            st.markdown(
                f"<div style='padding-top:6px;font-size:.8rem;color:var(--green)'>"
                f"✅ Mentor will reply in "
                f"<strong>{st.session_state.get('ui_language','English')}</strong></div>",
                unsafe_allow_html=True)
    st.divider()

    st.markdown("<div class='section-lbl'>Quick Questions — click to fill</div>",
                unsafe_allow_html=True)
    chips = [
        ("💻", "Software Interview", "How do I prepare for a software interview?"),
        ("🎓", "MBA or MS?",         "MBA or MS after B.Tech?"),
        ("📊", "Switch to Data",     "How to switch to Data Science with no experience?"),
        ("☁️", "Cloud Certs",        "Best cloud certifications for freshers?"),
    ]
    chip_cols = st.columns(4, gap="small")
    for i, (icon, short, full_q) in enumerate(chips):
        with chip_cols[i]:
            btn_clicked = st.button(
                f"{icon}  {short}",
                key=f"chip_{i}",
                use_container_width=True,
                help=full_q
            )
            if btn_clicked:
                st.session_state.prefill_q = full_q
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    q = st.text_input("💬 Your Question",
                      value=st.session_state.prefill_q,
                      placeholder="e.g. How do I become a product manager with no experience?")
    vq, mq = validate_question(q)
    vh(vq, mq)

    ac, clc = st.columns([3, 1], gap="small")
    with ac:
        if st.button("✦ Ask Mentor", key="btn_mentor", use_container_width=True):
            if not vq:
                st.warning("Ask a complete question (at least 10 characters).")
            else:
                _mlang = get_lang_code(st.session_state.get("ui_language","English"))
                with st.spinner("Your mentor is thinking…"):
                    data, err = call_api("/mentor", {
                        "question": sanitize(q),
                        "reply_language": _mlang,
                    })
                if err:
                    st.error(err)
                else:
                    res = data.get("response", "No response.")
                    st.session_state.mentor_result = res
                    st.session_state.prefill_q     = ""
                    _save("mentor", f"Q: {q[:60]}", {"question": q}, res)
                    st.success("✅ Your mentor replied!")
    with clc:
        if st.button("🗑 Clear", key="btn_clr_mentor", use_container_width=True):
            st.session_state.mentor_result = None
            st.session_state.prefill_q     = ""

    if st.session_state.mentor_result:
        _mrc1, _mrc2 = st.columns([5, 1], gap="small")
        with _mrc2:
            if st.button("🗑 Clear", key="btn_mentor_clear2", use_container_width=True):
                st.session_state.mentor_result = None
                st.rerun()
        # Groq already replied in the selected language
        show_result(st.session_state.mentor_result, "🤖")


# ═══════════════════════════════════════════════════════════════════
#  TAB VOICE — VOICE MENTOR
# ═══════════════════════════════════════════════════════════════════
with tab_voice:
    st.markdown("### 🗣 Voice Mentor")
    st.markdown(
        "<p style='color:var(--muted);font-size:.88rem;margin-bottom:14px'>"
        "Speak your question — your mentor replies in voice. "
        "Language controls are <strong style='color:var(--green)'>inside the widget</strong> "
        "— change anytime without losing your conversation.</p>",
        unsafe_allow_html=True)

    # Usage tips row
    _vc_tips = [
        ("🎙️", "Click mic to speak", "Chrome/Edge required"),
        ("🌐", "Change language inside", "9 Indian languages"),
        ("⏹", "Stop Speaking button", "Interrupt anytime"),
        ("💬", "Or type your question", "Works in all browsers"),
    ]
    _vt_cols = st.columns(4, gap="small")
    for _col, (_ico, _tip_t, _tip_s) in zip(_vt_cols, _vc_tips):
        with _col:
            st.markdown(f"""
            <div style='background:var(--surface);border:1px solid var(--border);
                        border-radius:12px;padding:14px 12px;text-align:center;
                        transition:border-color .2s,transform .2s;cursor:default;'
                 onmouseover="this.style.borderColor='#3DDC84';this.style.transform='translateY(-3px)'"
                 onmouseout="this.style.borderColor='#2A3550';this.style.transform='none'">
              <div style='font-size:1.4rem;margin-bottom:6px'>{_ico}</div>
              <div style='font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px'>{_tip_t}</div>
              <div style='font-size:.72rem;color:var(--muted)'>{_tip_s}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # The widget is fully self-contained — all language controls inside JS
    _groq_key = os.getenv("GROQ_API_KEY", "")
    render_voice_widget(groq_api_key=_groq_key, height=700)

# ═══════════════════════════════════════════════════════════════════
#  TAB 5 — HISTORY
# ═══════════════════════════════════════════════════════════════════
with tab5:
    st.markdown("### 🕘 Activity History")

    if is_guest():
        render_guest_upgrade(
            "hist",
            "Save Your Activity History",
            "Create a free account to save all your career guidance, resumes, and mentor conversations — and revisit them anytime."
        )
        st.stop()

    user_id = uid()
    fmap = {"All": None, "🌱 Career": "career", "📝 Resume": "resume",
            "📄 Analyzer": "analysis", "🤖 Mentor": "mentor"}

    _hrow1, _hrow2 = st.columns([3, 1], gap="medium")
    with _hrow1:
        flt = st.selectbox("Filter", list(fmap.keys()),
                           label_visibility="collapsed", key="hist_filter")
    with _hrow2:
        if st.button("🗑 Clear All", key="btn_clr_all", use_container_width=True):
            clear_all_history(user_id)
            st.rerun()

    history = get_user_history(user_id, action_type=fmap[flt], limit=50)

    # Stats pills
    _type_colors = {"career":"#3DDC84","resume":"#5B9BD5","analysis":"#F0A500","mentor":"#C07FF0"}
    _type_counts = {}
    for _h in history:
        _type_counts[_h["action_type"]] = _type_counts.get(_h["action_type"], 0) + 1
    _pills_html = "".join([
        f"<span style='background:rgba(61,220,132,.08);border:1px solid rgba(61,220,132,.2);"
        f"border-radius:20px;padding:3px 12px;font-size:.74rem;color:var(--green);"
        f"margin-right:6px;'>📋 {len(history)} total</span>"
    ] + [
        f"<span style='background:rgba(0,0,0,.2);border:1px solid {_type_colors.get(k,'#2A3550')};"
        f"border-radius:20px;padding:3px 12px;font-size:.74rem;color:{_type_colors.get(k,'#7A8BA0')};"
        f"margin-right:6px;'>{TICONS.get(k,'✦')} {v} {k}</span>"
        for k, v in _type_counts.items()
    ])
    st.markdown(f"<div style='margin-bottom:16px;'>{_pills_html}</div>", unsafe_allow_html=True)

    if not history:
        st.markdown("""
        <div style='text-align:center;padding:56px 0;'>
          <div style='font-size:3rem;margin-bottom:14px;opacity:.4'>📭</div>
          <div style='font-size:1.1rem;color:var(--text);font-weight:600;margin-bottom:6px;'>No history yet</div>
          <div style='color:var(--muted);font-size:.88rem;'>Use Career Guidance, Resume Builder, or AI Mentor to get started.</div>
        </div>""", unsafe_allow_html=True)
    else:
        _type_colors_h = {"career":"#3DDC84","resume":"#5B9BD5","analysis":"#F0A500","mentor":"#C07FF0"}
        for item in history:
            icon  = TICONS.get(item["action_type"], "✦")
            _col  = _type_colors_h.get(item["action_type"], "#2A3550")
            c1, c2 = st.columns([11, 1], gap="small")
            with c1:
                with st.expander(f"{icon}  {item['title']}  ·  {fmt_ts(item['created_at'])}"):
                    if item.get("result"):
                        st.markdown(
                            f"<div class='result-box' style='margin-top:0;font-size:.83rem;"
                            f"max-height:280px;overflow-y:auto;border-left:3px solid {_col};'>"
                            f"{item['result'][:2500]}"
                            f"{'…' if len(item.get('result',''))>2500 else ''}</div>",
                            unsafe_allow_html=True)
                    else:
                        st.caption("No result stored for this entry.")
            with c2:
                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("🗑", key=f"del_{item['id']}", help="Delete this entry"):
                    delete_history_item(item["id"], user_id)
                    st.rerun()


# ═══════════════════════════════════════════════════════════════════
#  TAB 6 — DASHBOARD  (only rendered for logged-in non-guest users)
# ═══════════════════════════════════════════════════════════════════
if tab6 is not None:
    with tab6:
        st.markdown("### 📊 My Dashboard")
        user_id = uid()
        stats   = get_dashboard_stats(user_id)
        u       = st.session_state.user or {}
        verified = u.get("is_verified", 0)

        # ── Profile card ─────────────────────────────────────────────
        badge = ("<span class='badge-green'>✅ Email Verified</span>" if verified
                 else "<span class='badge-red'>⚠️ Email Unverified</span>")
        st.markdown(f"""
        <div class='profile-card'>
          <div class='profile-row'>
            <div class='avatar'>👤</div>
            <div class='profile-info'>
              <div class='profile-name'>{stats.get('display_name','—')}</div>
              <div class='profile-email'>📧 {stats.get('email','—')}</div>
              <div class='badge-row'>{badge}</div>
              <div class='meta-row'>
                <span>🗓 Joined: <strong>{fmt_ts(stats.get('member_since'))}</strong></span>
                <span>🔑 Last login: <strong>{fmt_ts(stats.get('last_login'))}</strong></span>
              </div>
            </div>
          </div>
        </div>""", unsafe_allow_html=True)

        # ── Activity stats ────────────────────────────────────────────
        st.markdown("#### 📈 Activity Overview")
        st.markdown(f"""
        <div class='dash-grid'>
          <div class='dash-card'><div class='dash-icon'>📋</div>
            <div class='dash-num'>{stats.get('total',0)}</div><div class='dash-lbl'>Total Actions</div></div>
          <div class='dash-card'><div class='dash-icon'>🌱</div>
            <div class='dash-num'>{stats.get('career',0)}</div><div class='dash-lbl'>Career Searches</div></div>
          <div class='dash-card'><div class='dash-icon'>📝</div>
            <div class='dash-num'>{stats.get('resume',0)}</div><div class='dash-lbl'>Resumes Built</div></div>
          <div class='dash-card'><div class='dash-icon'>🤖</div>
            <div class='dash-num'>{stats.get('mentor',0)}</div><div class='dash-lbl'>Mentor Q&As</div></div>
        </div>""", unsafe_allow_html=True)

        # ── Recent activity ───────────────────────────────────────────
        recent = stats.get("recent", [])
        if recent:
            st.markdown("#### 🕘 Recent Activity")
            for item in recent:
                icon = TICONS.get(item["action_type"], "✦")
                st.markdown(f"""
                <div class='recent-item'>
                  <div class='recent-icon'>{icon}</div>
                  <div class='recent-title'>{item['title']}</div>
                  <div class='recent-time'>{fmt_ts(item['created_at'])}</div>
                </div>""", unsafe_allow_html=True)

        st.divider()

        # ── Edit profile ──────────────────────────────────────────────
        st.markdown("#### ✏️ Edit Profile")
        ep1, ep2 = st.columns(2, gap="large")
        with ep1:
            st.markdown("<div class='section-lbl'>Display Name</div>", unsafe_allow_html=True)
            new_name = st.text_input("", value=u.get("full_name",""),
                                     key="ep_name", label_visibility="collapsed",
                                     placeholder="Your display name")
            if st.button("💾 Save Name", key="btn_sn", use_container_width=True):
                ok, res = update_profile(user_id, full_name=new_name)
                if ok and isinstance(res, dict):
                    st.session_state.user.update(res)
                    st.success("✅ Name updated!")
                else:
                    st.error(str(res))

        with ep2:
            st.markdown("<div class='section-lbl'>Change Password</div>", unsafe_allow_html=True)
            np1 = st.text_input("New Password", type="password", key="ep_pw",
                                placeholder="Leave blank to keep current")
            np2 = st.text_input("Confirm",      type="password", key="ep_pw2")
            if np1:
                vpw, mpw = validate_password(np1); vh(vpw, mpw)
                vpm, mpm = validate_password_match(np1, np2); vh(vpm, mpm)
            if st.button("💾 Update Password", key="btn_sp", use_container_width=True):
                if np1:
                    ok, res = update_profile(user_id, new_password=np1)
                    if ok: st.success("✅ Password updated!")
                    else:  st.error(str(res))

        st.divider()

        # ── Logout ────────────────────────────────────────────────────
        _dzone, _dspace = st.columns([1, 2], gap="large")
        with _dzone:
            st.markdown(
                "<div style='background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.18);"
                "border-radius:12px;padding:14px 16px;margin-bottom:12px;'>"
                "<div style='font-size:.82rem;font-weight:600;color:#FF6B6B;margin-bottom:4px;'>⚠ Danger Zone</div>"
                "<div style='font-size:.76rem;color:var(--muted);'>Logging out clears your current session.</div>"
                "</div>", unsafe_allow_html=True)
            if st.button("🚪 Log Out", key="btn_logout", use_container_width=True):
                for k in list(st.session_state.keys()):
                    del st.session_state[k]
                st.rerun()


# ─────────────────────────────────────────────────────────────────────────────
#  FOOTER
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<div style='margin-top:32px;padding:20px 0 8px;
            border-top:1px solid #1C2333;
            display:flex;justify-content:space-between;align-items:center;
            flex-wrap:wrap;gap:10px;'>
  <div style='color:#2A3550;font-size:.78rem;'>
    Built with ❤️ for Indian students &nbsp;·&nbsp;
    <span style='color:var(--green);font-weight:600;'>Always free</span>
  </div>
  <div style='display:flex;gap:16px;'>
    <span style='color:#2A3550;font-size:.76rem;'>🌿 VidyGuide AI</span>
    <span style='color:#2A3550;font-size:.76rem;'>🤖 Groq LLaMA 3</span>
    <span style='color:#2A3550;font-size:.76rem;'>🐍 Python + FastAPI</span>
    <span style='color:#2A3550;font-size:.76rem;'>🎤 Web Speech API</span>
  </div>
</div>""", unsafe_allow_html=True)