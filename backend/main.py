from fastapi import FastAPI
from pydantic import BaseModel
from backend.career_engine import suggest_career
from backend.resume_builder import generate_resume
from backend.resume_feedback import analyze_resume
from backend.mentor_chat import mentor_reply

app = FastAPI()

# --- Request Models ---
class CareerRequest(BaseModel):
    skills: str
    interests: str
    education: str

class ResumeRequest(BaseModel):
    name: str
    skills: str
    education: str
    projects: str

class FeedbackRequest(BaseModel):
    resume: str

class MentorRequest(BaseModel):
    question: str

# --- Routes ---
@app.get("/")
def home():
    return {"message": "VidyGuide AI Backend Running"}

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
