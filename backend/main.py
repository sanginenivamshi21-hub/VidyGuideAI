from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

# Import backend handlers
try:
    from backend.career_engine   import suggest_career
    from backend.resume_builder  import generate_resume
    from backend.resume_feedback import analyze_resume
    from backend.mentor_chat     import mentor_reply
except ImportError:
    # When running from project root
    from career_engine   import suggest_career
    from resume_builder  import generate_resume
    from resume_feedback import analyze_resume
    from mentor_chat     import mentor_reply

app = FastAPI(title="VidyGuide AI Backend")


# ── Request models ──────────────────────────────────────────────────────────

class CareerRequest(BaseModel):
    skills:           str
    interests:        str
    education:        str
    education_level:  Optional[str] = ""
    education_detail: Optional[str] = ""
    goal:             Optional[str] = ""
    location:         Optional[str] = ""
    extra_context:    Optional[str] = ""
    reply_language:   Optional[str] = "en"   # ISO language code

class ResumeRequest(BaseModel):
    name:             str
    skills:           str
    education:        Optional[str] = ""
    projects:         Optional[str] = ""
    target_role:      Optional[str] = ""
    target_company:   Optional[str] = ""
    education_level:  Optional[str] = ""
    phone:            Optional[str] = ""
    email:            Optional[str] = ""
    location:         Optional[str] = ""
    linkedin:         Optional[str] = ""
    languages:        Optional[str] = ""
    achievements:     Optional[str] = ""
    hobbies:          Optional[str] = ""
    domain:           Optional[str] = ""

class FeedbackRequest(BaseModel):
    resume:           str
    reply_language:   Optional[str] = "en"

class MentorRequest(BaseModel):
    question:         str
    reply_language:   Optional[str] = "en"


# ── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "VidyGuide AI Backend Running ✅", "version": "2.0"}

@app.post("/career")
def career(data: CareerRequest):
    return suggest_career(data.dict())

@app.post("/resume")
def resume(data: ResumeRequest):
    return generate_resume(data.dict())

@app.post("/resume-feedback")
def resume_feedback(data: FeedbackRequest):
    return analyze_resume(data.dict())

@app.post("/mentor")
def mentor(data: MentorRequest):
    return mentor_reply(data.dict())