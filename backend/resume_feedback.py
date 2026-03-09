from groq import Groq
import os

client = Groq(api_key=os.getenv("gsk_wS9TSwhjrbMRTs2GSKYIWGdyb3FY0SozqQDscYembYLhT3G0ipG"))

def analyze_resume(data):

    resume_text = data["resume"]

    prompt = f"""
    Analyze this resume and suggest improvements.

    Resume:
    {resume_text}

    Provide:
    - weaknesses
    - improvements
    - missing skills
    """

    chat = client.chat.completions.create(
        messages=[{"role":"user","content":prompt}],
        model="llama-3.1-8b-instant"
    )

    return {"feedback": chat.choices[0].message.content}
