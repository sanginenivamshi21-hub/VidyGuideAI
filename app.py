import streamlit as st
import requests
import time

API = "http://127.0.0.1:8000"

# ─────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="VidyGuide AI",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ─────────────────────────────────────────────
#  GLOBAL STYLES
# ─────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Base ── */
:root {
    --bg:        #0D1117;
    --surface:   #161B27;
    --card:      #1C2333;
    --border:    #2A3550;
    --green:     #3DDC84;
    --green-dim: #1E6B42;
    --gold:      #F0A500;
    --text:      #E2E8F0;
    --muted:     #7A8BA0;
    --danger:    #FF6B6B;
}

html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
    background-color: var(--bg);
    color: var(--text);
}

/* hide default streamlit chrome */
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 2rem 3rem 4rem; max-width: 1100px; }

/* ── Hero Banner ── */
.hero {
    background: linear-gradient(135deg, #0D2818 0%, #0D1117 60%, #1A1200 100%);
    border: 1px solid var(--border);
    border-left: 4px solid var(--green);
    border-radius: 16px;
    padding: 36px 40px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
}
.hero::before {
    content: "";
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(61,220,132,0.08) 0%, transparent 70%);
    border-radius: 50%;
}
.hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem;
    color: var(--green);
    margin: 0 0 6px;
    line-height: 1.2;
}
.hero-sub {
    color: var(--muted);
    font-size: 1.05rem;
    font-weight: 300;
    margin: 0;
}
.hero-badge {
    display: inline-block;
    background: rgba(61,220,132,0.12);
    color: var(--green);
    border: 1px solid rgba(61,220,132,0.3);
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-bottom: 14px;
    text-transform: uppercase;
}

/* ── Stat Cards ── */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
}
.stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 18px;
    text-align: center;
    transition: border-color 0.2s;
}
.stat-card:hover { border-color: var(--green); }
.stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    color: var(--green);
    line-height: 1;
    margin-bottom: 4px;
}
.stat-label {
    font-size: 0.78rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
}

/* ── Tabs ── */
.stTabs [data-baseweb="tab-list"] {
    background: var(--surface);
    border-radius: 12px;
    padding: 5px;
    gap: 4px;
    border: 1px solid var(--border);
}
.stTabs [data-baseweb="tab"] {
    background: transparent;
    color: var(--muted);
    border-radius: 9px;
    font-weight: 500;
    font-size: 0.92rem;
    padding: 10px 22px;
    border: none;
    transition: all 0.2s;
}
.stTabs [aria-selected="true"] {
    background: linear-gradient(135deg, var(--green), var(--green-dim)) !important;
    color: #fff !important;
    box-shadow: 0 2px 12px rgba(61,220,132,0.25);
}
.stTabs [data-baseweb="tab-panel"] {
    background: var(--card);
    border-radius: 0 12px 12px 12px;
    padding: 32px;
    border: 1px solid var(--border);
    border-top: none;
}

/* ── Form card ── */
.form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
}
.section-label {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--green);
    margin-bottom: 16px;
}

/* ── Inputs ── */
.stTextInput > div > input,
.stTextArea > div > textarea {
    background: var(--bg) !important;
    border: 1.5px solid var(--border) !important;
    border-radius: 9px !important;
    color: var(--text) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.95rem !important;
    transition: border-color 0.2s;
}
.stTextInput > div > input:focus,
.stTextArea > div > textarea:focus {
    border-color: var(--green) !important;
    box-shadow: 0 0 0 3px rgba(61,220,132,0.1) !important;
}
label { color: var(--muted) !important; font-size: 0.88rem !important; font-weight: 500 !important; }

/* ── Buttons ── */
.stButton > button {
    background: linear-gradient(135deg, var(--green), var(--green-dim));
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 0.65em 1.6em;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 15px rgba(61,220,132,0.2);
    transition: all 0.2s;
    width: 100%;
}
.stButton > button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(61,220,132,0.35);
}
.stButton > button:active { transform: translateY(0); }

/* ── Result boxes ── */
.result-box {
    background: linear-gradient(135deg, #0D2818, #0D1A12);
    border: 1px solid rgba(61,220,132,0.3);
    border-radius: 12px;
    padding: 24px;
    margin-top: 20px;
    white-space: pre-wrap;
    font-size: 0.93rem;
    line-height: 1.75;
    color: var(--text);
}
.result-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--green);
}

/* ── Tips box ── */
.tip-box {
    background: rgba(240,165,0,0.06);
    border: 1px solid rgba(240,165,0,0.25);
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 0.85rem;
    color: #C8A060;
    margin-top: 14px;
    line-height: 1.6;
}

/* ── Headings inside tabs ── */
h1, h2, h3 { font-family: 'Playfair Display', serif; color: var(--text) !important; }
h4, h5 { color: var(--muted) !important; font-weight: 500 !important; }

/* ── Alerts ── */
.stSuccess { border-radius: 10px !important; }
.stError   { border-radius: 10px !important; }

/* ── Divider ── */
hr { border-color: var(--border) !important; margin: 24px 0 !important; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
#  SESSION STATE
# ─────────────────────────────────────────────
for key in ["career_result", "resume_result", "feedback_result", "mentor_result"]:
    if key not in st.session_state:
        st.session_state[key] = None
if "resume_meta" not in st.session_state:
    st.session_state["resume_meta"] = {}

# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def call_api(endpoint: str, payload: dict):
    try:
        r = requests.post(f"{API}{endpoint}", json=payload, timeout=30)
        r.raise_for_status()
        return r.json(), None
    except requests.exceptions.ConnectionError:
        return None, "⚠️ Cannot reach backend. Is `uvicorn backend.main:app --reload` running?"
    except requests.exceptions.Timeout:
        return None, "⚠️ Request timed out. The AI is taking too long — try again."
    except Exception as e:
        return None, f"⚠️ Unexpected error: {str(e)}"

def show_result(content: str, icon: str = "✦"):
    st.markdown(f"""
    <div class="result-box">
        <div class="result-header">{icon} Result</div>
        {content}
    </div>
    """, unsafe_allow_html=True)

# ─────────────────────────────────────────────
#  HERO
# ─────────────────────────────────────────────
st.markdown("""
<div class="hero">
    <div class="hero-badge">🌿 AI-Powered Career Platform</div>
    <div class="hero-title">VidyGuide</div>
    <p class="hero-sub">Your intelligent companion for career discovery, resume crafting, and mentorship.</p>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
#  STATS ROW
# ─────────────────────────────────────────────
st.markdown("""
<div class="stats-row">
    <div class="stat-card">
        <div class="stat-num">10+</div>
        <div class="stat-label">Career Paths</div>
    </div>
    <div class="stat-card">
        <div class="stat-num">AI</div>
        <div class="stat-label">Resume Builder</div>
    </div>
    <div class="stat-card">
        <div class="stat-num">24/7</div>
        <div class="stat-label">AI Mentor</div>
    </div>
    <div class="stat-card">
        <div class="stat-num">Free</div>
        <div class="stat-label">Always</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
#  SHARED DATA MAPS (used by Tab 1 & Tab 2)
# ─────────────────────────────────────────────
EDUCATION_LEVELS = {
    "🏫 Class 10 (SSC/CBSE/ICSE)": "10th",
    "📘 Class 12 / Intermediate (11th–12th)": "12th",
    "🎓 Diploma (Polytechnic)": "diploma",
    "🎓 Bachelor's Degree (B.Tech / B.Sc / BA / B.Com / BCA)": "bachelors",
    "📚 Master's Degree (M.Tech / MBA / MCA / M.Sc)": "masters",
    "🛠 ITI / Vocational Course": "iti",
    "📜 Other / Self-taught / Bootcamp": "other",
}

CAREER_DOMAINS = {
    "💻 Software / IT": ["Software Engineer", "Web Developer", "Mobile App Developer", "QA Engineer", "DevOps Engineer"],
    "📊 Data & Analytics": ["Data Analyst", "Data Scientist", "Business Analyst", "ML Engineer"],
    "🎨 Design & Creative": ["UI/UX Designer", "Graphic Designer", "Video Editor", "Content Creator"],
    "📣 Marketing & Sales": ["Digital Marketer", "SEO Specialist", "Sales Executive", "Social Media Manager"],
    "🏦 Finance & Banking": ["Accountant", "Finance Analyst", "Bank PO", "Tax Consultant"],
    "🏥 Healthcare": ["Lab Technician", "Nursing Assistant", "Healthcare Admin", "Pharmacist"],
    "🏭 Manufacturing / ITI Trades": ["CNC Operator", "Electrician", "Fitter", "Welder", "Mechanic"],
    "🎓 Education": ["Teacher", "Tutor", "EdTech Instructor", "Academic Counselor"],
    "🛒 Retail & Operations": ["Store Manager", "Logistics Executive", "Customer Support", "Warehouse Supervisor"],
    "🏛 Government / Civil Services": ["SSC CGL", "Railway Jobs", "State PSC", "Clerk / Peon Posts"],
}

TARGET_COMPANIES = {
    "💻 Software / IT": ["TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra", "Accenture", "Cognizant", "Google", "Microsoft", "Amazon", "Startup / Own Choice"],
    "📊 Data & Analytics": ["Mu Sigma", "Fractal Analytics", "Latent View", "ThoughtWorks", "IBM", "Deloitte", "Other"],
    "🎨 Design & Creative": ["Designit", "Razorfish", "Publicis Sapient", "Zomato", "Swiggy", "Agency / Freelance"],
    "📣 Marketing & Sales": ["Byju's", "Unacademy", "PhonePe", "Paytm", "OYO", "Any MNC", "Startup"],
    "🏦 Finance & Banking": ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Deloitte", "KPMG", "EY", "PwC"],
    "🏥 Healthcare": ["Apollo Hospitals", "Fortis", "Manipal", "Max Healthcare", "Govt Hospital", "Clinic"],
    "🏭 Manufacturing / ITI Trades": ["BHEL", "NTPC", "L&T", "Bosch", "Maruti Suzuki", "TATA Motors", "Local Industry"],
    "🎓 Education": ["BYJU'S", "Vedantu", "WhiteHat Jr", "Govt School", "Private School", "College / University"],
    "🛒 Retail & Operations": ["Amazon", "Flipkart", "DMart", "Reliance Retail", "BigBasket", "Zepto", "Any Company"],
    "🏛 Government / Civil Services": ["SSC", "UPSC", "State PSC", "Railways", "Bank Exams", "Defence"],
}

# ─────────────────────────────────────────────
#  TABS
# ─────────────────────────────────────────────
tab1, tab2, tab3, tab4 = st.tabs([
    "🌱  Career Guidance",
    "📝  Resume Builder",
    "📄  Resume Analyzer",
    "🤖  AI Mentor",
])

# ══════════════════════════════════════════════
#  TAB 1 — CAREER GUIDANCE (ALL ACADEMIC LEVELS)
# ══════════════════════════════════════════════

# Trending careers per education level
TRENDING_BY_LEVEL = {
    "10th": [
        ("💼", "ITI Trades", "Electrician, Fitter, COPA — high demand govt & private jobs"),
        ("🛒", "Retail / Sales", "Store assistant, cashier, delivery — entry-level jobs available now"),
        ("🎨", "Graphic Design", "Learn Canva/Photoshop — freelance from home after a short course"),
        ("📞", "BPO / Customer Support", "No degree needed, good salary, communication skills required"),
        ("🏗", "Construction / Civil Helper", "Practical trade with apprenticeship opportunities"),
    ],
    "12th": [
        ("💻", "Web Development", "3–6 month bootcamp → entry-level job at ₹2–4 LPA"),
        ("📊", "Data Entry / Back Office", "Govt and private both hire fresh 12th pass candidates"),
        ("🎓", "Teaching (Primary)", "D.El.Ed after 12th → govt school teacher"),
        ("📣", "Digital Marketing", "Short course + internship → agency or startup career"),
        ("🏦", "Banking (Clerk/PO)", "SSC / IBPS exams — massive hiring every year"),
        ("🏥", "Nursing / Paramedical", "GNM, ANM, DMLT after 12th — healthcare is booming"),
    ],
    "diploma": [
        ("⚙️", "Junior Engineer", "Diploma holders eligible for GATE, PSUs, Govt JE posts"),
        ("🏭", "Production / Quality", "Manufacturing firms hire diploma holders at ₹2–5 LPA"),
        ("🔧", "Field Service Engineer", "Maintenance and service roles at MNCs like Bosch, Siemens"),
        ("💻", "Web / App Dev", "Add coding skills to your diploma — IT jobs accessible"),
        ("🏗", "Site Supervisor", "Construction and infra sector — direct site work"),
    ],
    "iti": [
        ("⚡", "Electrician / Wireman", "CPWD, PWD, private contractors — always in demand"),
        ("🔩", "CNC / VMC Operator", "₹2–4 LPA, auto industry and precision manufacturing"),
        ("🚗", "Automobile Technician", "Maruti, Hyundai, Hero service centres hire ITI"),
        ("🏭", "Apprenticeship (NAPS)", "Govt-sponsored apprenticeship with stipend + certificate"),
        ("🔧", "Self-employed / Workshop", "Start your own repair/fabrication workshop"),
    ],
    "bachelors": [
        ("💻", "Software Engineer", "TCS, Infosys, startups — highest volume hiring"),
        ("📊", "Data Analyst", "SQL + Excel + Python → ₹4–10 LPA entry level"),
        ("🎯", "Product Manager", "After 2–3 years experience — high growth, ₹15–40 LPA"),
        ("☁️", "Cloud / DevOps", "AWS/Azure certifications → ₹8–20 LPA"),
        ("📣", "Digital Marketing", "MBA optional — skills + portfolio matter more"),
        ("🏦", "Finance / Banking", "CA, CFA, BFSI sector — strong long-term growth"),
    ],
    "masters": [
        ("🤖", "ML / AI Engineer", "Masters in CS/Stats → ₹12–30 LPA in top tech firms"),
        ("📈", "Management Consultant", "MBA → Big4, McKinsey, BCG — high prestige"),
        ("🔬", "Research Scientist", "PhD pathway or R&D roles in DRDO, ISRO, IITs"),
        ("🏦", "Investment Banking", "MBA Finance → ₹15–50 LPA in top banks"),
        ("🎓", "Professor / Lecturer", "NET/SET after Masters → college/university teaching"),
    ],
    "iti_diploma_other": [
        ("🛠", "Skilled Trade Jobs", "Plumbing, electrical, welding — always in demand"),
        ("📱", "Mobile Repair", "Short course → self-employment or franchise"),
        ("🍳", "Food & Hospitality", "Hotel Management course → chef, manager roles"),
        ("🚛", "Logistics / Driving", "LMV/HMV licence → transport and delivery sector"),
        ("🌾", "Agriculture / Agri-tech", "Govt schemes, agri startups hiring rural talent"),
    ],
}

# Context-specific questions per education level
CONTEXT_QUESTIONS = {
    "10th": {
        "stream_hint": "You don't have a stream yet — that's okay! We'll suggest what stream to pick too.",
        "extra_label": "📋 Subjects you liked in school",
        "extra_placeholder": "e.g. Maths, Science, Drawing, Hindi",
        "goal_label": "🎯 What do you want after studies?",
        "goal_options": ["Get a job quickly", "Study further (11th/12th)", "Learn a trade / ITI", "Start something of my own", "Not sure yet"],
        "location_hint": True,
    },
    "12th": {
        "stream_hint": "",
        "extra_label": "📚 Your 12th Stream & Subjects",
        "extra_placeholder": "e.g. MPC — Maths 92, Physics 85, Chemistry 78",
        "goal_label": "🎯 What's your next step?",
        "goal_options": ["Get a job now", "Pursue degree (B.Tech/B.Sc/BA)", "Competitive exams (JEE/NEET/CLAT)", "Short-term course + job", "Not sure yet"],
        "location_hint": True,
    },
    "diploma": {
        "stream_hint": "",
        "extra_label": "🔧 Your Diploma Branch & Specialisation",
        "extra_placeholder": "e.g. Mechanical Engineering — CNC, AutoCAD",
        "goal_label": "🎯 What are you aiming for?",
        "goal_options": ["Government job (JE/PSU)", "Private sector job", "Higher studies (B.Tech Lateral)", "Start own business", "Not sure yet"],
        "location_hint": False,
    },
    "iti": {
        "stream_hint": "",
        "extra_label": "🔩 Your ITI Trade",
        "extra_placeholder": "e.g. Electrician, Fitter, COPA, Welder, Mechanic",
        "goal_label": "🎯 What do you want next?",
        "goal_options": ["Apprenticeship (NAPS/NATS)", "Govt job (Railways/CPWD)", "Private industry job", "Start own workshop", "Upgrade skills further"],
        "location_hint": False,
    },
    "bachelors": {
        "stream_hint": "",
        "extra_label": "🎓 Your Degree, Branch & College",
        "extra_placeholder": "e.g. B.Tech CSE — JNTU Hyderabad, 2024, CGPA 7.8",
        "goal_label": "🎯 What's your goal?",
        "goal_options": ["Placement / Job", "Higher studies (Masters/MBA)", "Startup / Entrepreneurship", "Govt / PSU job", "Switch domain entirely"],
        "location_hint": False,
    },
    "masters": {
        "stream_hint": "",
        "extra_label": "📚 Your Masters Degree & Specialisation",
        "extra_placeholder": "e.g. MBA Marketing — IIM Lucknow, 2024",
        "goal_label": "🎯 Career focus?",
        "goal_options": ["Senior corporate role", "Research / Academia", "Consulting / Strategy", "Entrepreneurship", "International career"],
        "location_hint": False,
    },
    "other": {
        "stream_hint": "",
        "extra_label": "📜 Your Course / Certification",
        "extra_placeholder": "e.g. Full Stack Web Dev — Udemy, 6 months, 2024",
        "goal_label": "🎯 What are you targeting?",
        "goal_options": ["Freelance work", "Entry-level job", "Build a product/startup", "Upgrade to degree", "Not sure yet"],
        "location_hint": True,
    },
}

with tab1:
    st.markdown("### 🌱 Career Guidance — For Every Academic Level")
    st.markdown("<p style='color:#7A8BA0;font-size:0.9rem;margin-bottom:20px'>Whether you passed Class 10 or a Masters degree — we'll guide you to the right career path.</p>", unsafe_allow_html=True)

    # ── STEP 1: Education Level ──
    st.markdown("<div class='section-label'>Step 1 — Your Current Academic Level</div>", unsafe_allow_html=True)

    cg_edu_label = st.selectbox(
        "What is your highest qualification?",
        list(EDUCATION_LEVELS.keys()),
        key="cg_edu_select",
        label_visibility="collapsed"
    )
    cg_edu_level = EDUCATION_LEVELS[cg_edu_label]

    # Map to context key
    ctx_key = cg_edu_level if cg_edu_level in CONTEXT_QUESTIONS else "other"
    ctx = CONTEXT_QUESTIONS[ctx_key]
    trending_key = cg_edu_level if cg_edu_level in TRENDING_BY_LEVEL else "iti_diploma_other"

    if ctx["stream_hint"]:
        st.info(ctx["stream_hint"])

    st.divider()

    # ── STEP 2: Profile Details ──
    st.markdown("<div class='section-label'>Step 2 — Your Profile</div>", unsafe_allow_html=True)

    col_left, col_right = st.columns([3, 2], gap="large")

    with col_left:
        cg_extra = st.text_input(ctx["extra_label"], placeholder=ctx["extra_placeholder"], key="cg_extra")
        cg_skills = st.text_input("🛠 Skills you have (or are learning)", placeholder="e.g. Drawing, Excel, Coding, Cooking, Talking to people…", key="cg_skills")
        cg_interests = st.text_input("💡 What topics / activities excite you?", placeholder="e.g. Computers, Nature, Sports, Music, Numbers, Helping others…", key="cg_interests")
        cg_goal = st.selectbox(ctx["goal_label"], ctx["goal_options"], key="cg_goal")

        if ctx["location_hint"]:
            cg_location = st.text_input("📍 Your City / State", placeholder="e.g. Guntur, Andhra Pradesh", key="cg_location")
        else:
            cg_location = ""

        cg_extra_context = st.text_area(
            "💬 Anything else? (optional)",
            placeholder="e.g. I want to earn quickly, my family can't afford 4-year degree, I'm good at fixing things…",
            height=80, key="cg_context"
        )

    with col_right:
        st.markdown("### 🔥 Top Careers for Your Level")
        for icon, title, desc in TRENDING_BY_LEVEL[trending_key]:
            st.markdown(f"""
            <div style='background:#1C2333;border:1px solid #2A3550;border-radius:10px;
                        padding:12px 14px;margin-bottom:10px;transition:border-color 0.2s'>
                <div style='display:flex;align-items:center;gap:8px;margin-bottom:4px'>
                    <span style='font-size:1.1rem'>{icon}</span>
                    <strong style='color:#3DDC84;font-size:0.9rem'>{title}</strong>
                </div>
                <div style='color:#7A8BA0;font-size:0.8rem;line-height:1.5'>{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    st.divider()

    # ── GENERATE ──
    col_btn, col_hint = st.columns([2, 3], gap="large")
    with col_btn:
        cg_clicked = st.button("✦ Get My Career Suggestions", key="btn_career", use_container_width=True)
    with col_hint:
        st.markdown(f"""
        <div class='tip-box' style='margin-top:0'>
        💡 <strong>Tip:</strong> The more you share about your interests and situation,
        the more <strong style='color:#3DDC84'>personalised</strong> and useful your suggestions will be.<br>
        We consider your <strong>academic level, goals, skills, and location</strong> together.
        </div>
        """, unsafe_allow_html=True)

    if cg_clicked:
        if not cg_skills.strip() and not cg_interests.strip():
            st.warning("Please enter at least your skills or interests so we can guide you better.")
        else:
            payload = {
                "skills": cg_skills,
                "interests": cg_interests,
                "education": cg_edu_label,
                "education_level": cg_edu_level,
                "education_detail": cg_extra,
                "goal": cg_goal,
                "location": cg_location,
                "extra_context": cg_extra_context,
            }
            with st.spinner("Analysing your profile and building your career roadmap…"):
                data, err = call_api("/career", payload)
            if err:
                st.error(err)
            else:
                st.session_state.career_result = data.get("career_suggestions", "No suggestions returned.")
                st.success("✅ Your personalised career guidance is ready!")

    if st.session_state.career_result:
        st.divider()
        show_result(st.session_state.career_result, "🌱")

# ══════════════════════════════════════════════
#  TAB 2 — RESUME BUILDER (SMART CATEGORIZED)
# ══════════════════════════════════════════════

# ── Extra fields per education level ──
def render_education_fields(level: str):
    fields = {}
    if level == "10th":
        fields["board"] = st.text_input("📋 Board", placeholder="e.g. CBSE / AP State Board")
        fields["school"] = st.text_input("🏫 School Name", placeholder="e.g. ZP High School, Guntur")
        fields["year"] = st.text_input("📅 Year of Passing", placeholder="e.g. 2022")
        fields["percentage"] = st.text_input("📊 Percentage / GPA", placeholder="e.g. 82%")
        fields["activities"] = st.text_area("🌟 Extracurriculars / Achievements", placeholder="Sports, NCC, cultural events…", height=80)
    elif level == "12th":
        fields["board"] = st.text_input("📋 Board", placeholder="e.g. CBSE / Telangana Intermediate")
        fields["college"] = st.text_input("🏫 Junior College / School", placeholder="e.g. Narayana Junior College")
        fields["stream"] = st.selectbox("📚 Stream", ["MPC (Maths, Physics, Chemistry)", "BiPC (Biology)", "MEC (Commerce)", "HEC (Humanities)", "CEC", "Other"])
        fields["year"] = st.text_input("📅 Year of Passing", placeholder="e.g. 2024")
        fields["percentage"] = st.text_input("📊 Percentage", placeholder="e.g. 78%")
        fields["activities"] = st.text_area("🌟 Achievements / Extracurriculars", placeholder="Rank in exams, cultural, sports…", height=80)
    elif level == "diploma":
        fields["branch"] = st.text_input("🔧 Diploma Branch", placeholder="e.g. Civil, Mechanical, ECE, CSE")
        fields["college"] = st.text_input("🏫 Polytechnic College", placeholder="e.g. Govt Polytechnic, Vijayawada")
        fields["year"] = st.text_input("📅 Year of Passing", placeholder="e.g. 2023")
        fields["percentage"] = st.text_input("📊 Percentage / CGPA", placeholder="e.g. 74%")
        fields["projects"] = st.text_area("💼 Projects / Internships", placeholder="Mini project title, what you built…", height=90)
    elif level == "iti":
        fields["trade"] = st.text_input("🔧 ITI Trade", placeholder="e.g. Electrician, Fitter, COPA, Welder")
        fields["institute"] = st.text_input("🏫 Institute Name", placeholder="e.g. Govt ITI, Guntur")
        fields["year"] = st.text_input("📅 Year of Passing", placeholder="e.g. 2023")
        fields["grade"] = st.text_input("📊 Grade / Marks", placeholder="e.g. A Grade / 75%")
        fields["apprenticeship"] = st.text_input("🏭 Apprenticeship / Work Experience", placeholder="Company name and duration if any")
    elif level in ["bachelors", "masters"]:
        fields["degree"] = st.text_input("🎓 Degree & Branch", placeholder="e.g. B.Tech CSE / MBA Marketing / B.Sc Physics")
        fields["college"] = st.text_input("🏫 College / University", placeholder="e.g. JNTU Hyderabad / Osmania University")
        fields["year"] = st.text_input("📅 Year of Passing", placeholder="e.g. 2024")
        fields["cgpa"] = st.text_input("📊 CGPA / Percentage", placeholder="e.g. 8.2 / 75%")
        fields["projects"] = st.text_area("💼 Projects", placeholder="Project title — tech stack — outcome\nOne per line", height=100)
        fields["internships"] = st.text_area("🏢 Internships", placeholder="Company — Role — Duration\ne.g. TCS — Web Dev Intern — 2 months", height=80)
        fields["certifications"] = st.text_input("📜 Certifications", placeholder="e.g. AWS Cloud, Google Analytics, NPTEL")
    elif level == "other":
        fields["course"] = st.text_input("📜 Course / Bootcamp Name", placeholder="e.g. Full Stack Web Dev — Udemy, 2023")
        fields["duration"] = st.text_input("⏱ Duration", placeholder="e.g. 6 months")
        fields["projects"] = st.text_area("💼 Projects Built", placeholder="What you made during the course…", height=90)
    return fields

with tab2:
    st.markdown("### 🎯 Smart Resume Builder")
    st.markdown("<p style='color:#7A8BA0;font-size:0.9rem;margin-bottom:20px'>Tailored resumes for <strong style='color:#3DDC84'>every education level</strong> — from Class 10 to Masters — targeted to a specific company & role.</p>", unsafe_allow_html=True)

    # ── STEP 1: Education Level ──
    st.markdown("<div class='section-label'>Step 1 — Your Education Level</div>", unsafe_allow_html=True)
    edu_label = st.selectbox("Select your highest qualification", list(EDUCATION_LEVELS.keys()), label_visibility="collapsed")
    edu_level = EDUCATION_LEVELS[edu_label]

    st.divider()

    # ── STEP 2: Target Domain & Company ──
    st.markdown("<div class='section-label'>Step 2 — Target Job & Company</div>", unsafe_allow_html=True)
    col_domain, col_role, col_company = st.columns(3, gap="medium")

    with col_domain:
        domain = st.selectbox("🏢 Job Domain", list(CAREER_DOMAINS.keys()))
    with col_role:
        role = st.selectbox("💼 Target Role", CAREER_DOMAINS[domain])
    with col_company:
        company_list = TARGET_COMPANIES.get(domain, ["Any Company"])
        company = st.selectbox("🎯 Target Company", company_list)
        custom_company = st.text_input("Or type company name", placeholder="Leave blank to use above")
        final_company = custom_company.strip() if custom_company.strip() else company

    st.divider()

    # ── STEP 3: Personal Info ──
    st.markdown("<div class='section-label'>Step 3 — Personal Details</div>", unsafe_allow_html=True)
    col_p1, col_p2 = st.columns(2, gap="large")
    with col_p1:
        name = st.text_input("👤 Full Name", placeholder="e.g. Ravi Kumar")
        phone = st.text_input("📱 Phone Number", placeholder="e.g. +91 98765 43210")
    with col_p2:
        email = st.text_input("📧 Email", placeholder="e.g. ravi@gmail.com")
        location = st.text_input("📍 City / Location", placeholder="e.g. Guntur, Andhra Pradesh")

    linkedin = st.text_input("🔗 LinkedIn / GitHub (optional)", placeholder="linkedin.com/in/yourname")

    st.divider()

    # ── STEP 4: Education-Specific Fields ──
    st.markdown("<div class='section-label'>Step 4 — Education Details</div>", unsafe_allow_html=True)
    edu_fields = render_education_fields(edu_level)

    st.divider()

    # ── STEP 5: Skills & Extra ──
    st.markdown("<div class='section-label'>Step 5 — Skills & Additional Info</div>", unsafe_allow_html=True)
    col_s1, col_s2 = st.columns(2, gap="large")
    with col_s1:
        skills_rb = st.text_area("🛠 Skills", placeholder="List your skills separated by commas\ne.g. Python, Excel, Communication, Teamwork", height=100)
        languages = st.text_input("🗣 Languages Known", placeholder="e.g. Telugu, English, Hindi")
    with col_s2:
        achievements = st.text_area("🏆 Achievements / Awards", placeholder="e.g. School topper, Won hackathon, NSS volunteer…", height=100)
        hobbies = st.text_input("🎯 Hobbies / Interests (optional)", placeholder="e.g. Cricket, Photography, Coding")

    st.divider()

    # ── GENERATE ──
    col_gen, col_info = st.columns([2, 3], gap="large")
    with col_gen:
        generate_clicked = st.button("✦ Generate Targeted Resume", key="btn_resume", use_container_width=True)
    with col_info:
        st.markdown(f"""
        <div class='tip-box' style='margin-top:0'>
        🎯 Generating resume for: <strong style='color:#3DDC84'>{role}</strong> at <strong style='color:#F0A500'>{final_company}</strong><br>
        📚 Education level: <strong>{edu_label.split(' ', 1)[1]}</strong>
        </div>
        """, unsafe_allow_html=True)

    if generate_clicked:
        if not name.strip():
            st.warning("Please enter your full name.")
        elif not skills_rb.strip():
            st.warning("Please enter at least one skill.")
        else:
            # Build a comprehensive payload
            payload = {
                "name": name,
                "phone": phone,
                "email": email,
                "location": location,
                "linkedin": linkedin,
                "education_level": edu_label,
                "target_role": role,
                "target_company": final_company,
                "domain": domain,
                "skills": skills_rb,
                "languages": languages,
                "achievements": achievements,
                "hobbies": hobbies,
                **{f"edu_{k}": v for k, v in edu_fields.items()},
                # legacy keys for backend compatibility
                "education": str(edu_fields),
                "projects": edu_fields.get("projects", ""),
            }
            with st.spinner(f"Crafting your resume for {role} at {final_company}…"):
                data, err = call_api("/resume", payload)
            if err:
                st.error(err)
            else:
                st.session_state.resume_result = data.get("resume", "No resume generated.")
                st.session_state.resume_meta = {"role": role, "company": final_company}
                st.success(f"✅ Resume generated for **{role}** at **{final_company}**!")

    if st.session_state.resume_result:
        st.divider()
        meta = st.session_state.get("resume_meta", {})
        st.markdown(f"<div class='result-header'>📄 Your Resume — {meta.get('role','')} @ {meta.get('company','')}</div>", unsafe_allow_html=True)
        col_res, col_dl = st.columns([4, 1])
        with col_res:
            edited = st.text_area("Edit before downloading:", st.session_state.resume_result, height=450, label_visibility="collapsed")
        with col_dl:
            st.markdown("<br>", unsafe_allow_html=True)
            fname = f"resume_{meta.get('role','').replace(' ','_')}_{meta.get('company','').replace(' ','_')}.txt"
            st.download_button("⬇ Download .txt", edited, file_name=fname, mime="text/plain", use_container_width=True)
            if st.button("🔄 Build Another", key="btn_reset_resume", use_container_width=True):
                st.session_state.resume_result = None
                st.session_state.resume_meta = {}
                st.rerun()
            st.markdown("<div class='tip-box' style='margin-top:12px;font-size:0.8rem'>✏️ You can edit the resume above before downloading.</div>", unsafe_allow_html=True)

# ══════════════════════════════════════════════
#  TAB 3 — RESUME ANALYZER
# ══════════════════════════════════════════════
with tab3:
    st.markdown("### Get AI Feedback on Your Resume")
    st.markdown("<p style='color:#7A8BA0;font-size:0.9rem;margin-bottom:24px'>Paste your existing resume and get detailed, actionable feedback in seconds.</p>", unsafe_allow_html=True)

    col_paste, col_guide = st.columns([3, 2], gap="large")

    with col_paste:
        resume_text = st.text_area("📋 Paste Your Resume Here", height=300,
                                   placeholder="Paste the full text of your resume…")
        char_count = len(resume_text.strip())
        st.caption(f"{'✅' if char_count > 100 else '⚠️'} {char_count} characters — {'looks good' if char_count > 100 else 'paste more content for better analysis'}")

        if st.button("✦ Analyze My Resume", key="btn_analyze"):
            if char_count < 50:
                st.warning("Please paste more resume content for a meaningful analysis.")
            else:
                with st.spinner("Analyzing your resume…"):
                    data, err = call_api("/resume-feedback", {"resume": resume_text})
                if err:
                    st.error(err)
                else:
                    st.session_state.feedback_result = data.get("feedback", "No feedback returned.")
                    st.success("✅ Analysis complete!")

    with col_guide:
        st.markdown("### What We Check")
        checks = [
            ("🎯", "Impact & Action Verbs"),
            ("📐", "Structure & Formatting"),
            ("🔍", "ATS Keyword Density"),
            ("✍️", "Clarity & Conciseness"),
            ("📊", "Quantified Achievements"),
            ("⚡", "Skills Relevance"),
        ]
        for icon, label in checks:
            st.markdown(f"<div style='display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #2A3550;font-size:0.88rem'><span style='font-size:1.1rem'>{icon}</span><span>{label}</span></div>", unsafe_allow_html=True)

    if st.session_state.feedback_result:
        st.divider()
        show_result(st.session_state.feedback_result, "📄")

# ══════════════════════════════════════════════
#  TAB 4 — AI MENTOR
# ══════════════════════════════════════════════
with tab4:
    st.markdown("### Chat with Your AI Career Mentor")
    st.markdown("<p style='color:#7A8BA0;font-size:0.9rem;margin-bottom:24px'>Ask anything about careers, skills, interviews, or life decisions. Your mentor is always here.</p>", unsafe_allow_html=True)

    # Quick question chips
    st.markdown("**Quick Questions:**")
    chips = [
        "How do I prepare for a software job interview?",
        "Should I do MBA or MS after B.Tech?",
        "How to switch from IT to Data Science?",
        "What certifications help for cloud jobs?",
    ]
    chip_cols = st.columns(len(chips))
    for i, chip in enumerate(chips):
        if chip_cols[i].button(chip, key=f"chip_{i}", use_container_width=True):
            st.session_state["prefill_question"] = chip

    st.markdown("<br>", unsafe_allow_html=True)

    prefill = st.session_state.get("prefill_question", "")
    question = st.text_input("💬 Your Question", value=prefill,
                              placeholder="e.g. How do I become a product manager with no experience?")

    col_ask, col_clear = st.columns([3, 1])
    with col_ask:
        if st.button("✦ Ask Mentor", key="btn_mentor"):
            if not question.strip():
                st.warning("Please type a question.")
            else:
                with st.spinner("Your mentor is thinking…"):
                    data, err = call_api("/mentor", {"question": question})
                if err:
                    st.error(err)
                else:
                    st.session_state.mentor_result = data.get("response", "No response.")
                    if "prefill_question" in st.session_state:
                        del st.session_state["prefill_question"]
                    st.success("✅ Here's what your mentor says:")

    with col_clear:
        if st.button("🗑 Clear", key="btn_clear"):
            st.session_state.mentor_result = None
            if "prefill_question" in st.session_state:
                del st.session_state["prefill_question"]

    if st.session_state.mentor_result:
        show_result(st.session_state.mentor_result, "🤖")

# ─────────────────────────────────────────────
#  FOOTER
# ─────────────────────────────────────────────
st.divider()
st.markdown("""
<div style="text-align:center;color:#3A4A5E;font-size:0.8rem;padding:12px 0">
    Built with ❤️ by VidyGuide &nbsp;·&nbsp; Powered by AI &nbsp;·&nbsp; 
    <span style="color:#3DDC84">Always free for students</span>
</div>
""", unsafe_allow_html=True)
