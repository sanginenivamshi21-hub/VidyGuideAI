from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

LANG_INSTRUCTIONS = {
    "en": "",
    "te": "\nIMPORTANT: Write your ENTIRE response in Telugu (తెలుగు) only. Do not use English.",
    "hi": "\nIMPORTANT: Write your ENTIRE response in Hindi (हिन्दी) only. Do not use English.",
    "ta": "\nIMPORTANT: Write your ENTIRE response in Tamil (தமிழ்) only. Do not use English.",
    "kn": "\nIMPORTANT: Write your ENTIRE response in Kannada (ಕನ್ನಡ) only. Do not use English.",
    "ml": "\nIMPORTANT: Write your ENTIRE response in Malayalam (മലയാളം) only. Do not use English.",
    "mr": "\nIMPORTANT: Write your ENTIRE response in Marathi (मराठी) only. Do not use English.",
    "bn": "\nIMPORTANT: Write your ENTIRE response in Bengali (বাংলা) only. Do not use English.",
    "gu": "\nIMPORTANT: Write your ENTIRE response in Gujarati (ગુજરાતી) only. Do not use English.",
}


def analyze_resume(data):
    resume_text = data.get("resume", "")
    reply_lang  = data.get("reply_language", "en")
    lang_instr  = LANG_INSTRUCTIONS.get(reply_lang, "")

    prompt = f"""You are an expert resume reviewer for Indian job seekers.

Analyze this resume and provide detailed, actionable feedback:

Resume:
{resume_text}

Provide structured feedback covering:
1. **Overall Impression** — First impression score (X/10) and one-line summary
2. **Strengths** — What's working well (3-5 points)
3. **Weaknesses** — What needs improvement (3-5 points)  
4. **ATS Optimization** — Keywords missing, formatting issues
5. **Section-by-Section Review** — Objective, Education, Skills, Projects, Experience
6. **Missing Elements** — What should be added
7. **Top 3 Priority Fixes** — The most impactful changes to make right now
8. **Improved Objective Statement** — Rewrite their objective for their target role{lang_instr}"""

    chat = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        max_tokens=1200,
        temperature=0.6,
    )
    return {"feedback": chat.choices[0].message.content}