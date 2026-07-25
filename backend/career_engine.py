from dotenv import load_dotenv
load_dotenv()
import os
from groq import Groq

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
    "pa": "\nIMPORTANT: Write your ENTIRE response in Punjabi (ਪੰਜਾਬੀ) only. Do not use English.",
    "or": "\nIMPORTANT: Write your ENTIRE response in Odia (ଓଡ଼ିଆ) only. Do not use English.",
    "ur": "\nIMPORTANT: Write your ENTIRE response in Urdu (اردو) only. Do not use English.",
}


def suggest_career(data):
    skills          = data.get("skills", "")
    interests       = data.get("interests", "")
    education       = data.get("education", "")
    education_level = data.get("education_level", "")
    education_detail= data.get("education_detail", "")
    goal            = data.get("goal", "")
    location        = data.get("location", "")
    extra_context   = data.get("extra_context", "")
    reply_lang      = data.get("reply_language", "en")

    lang_instr = LANG_INSTRUCTIONS.get(reply_lang, "")

    prompt = f"""You are VidyGuide, a compassionate career counselor for Indian students.

Student Profile:
- Education Level: {education_level} — {education}
- Education Details: {education_detail}
- Skills: {skills}
- Interests: {interests}
- Goal: {goal}
- Location: {location}
- Additional Context: {extra_context}

Provide 3-5 tailored career suggestions. For each include:
1. Career Title
2. Why it suits this person
3. Clear next steps (action plan)
4. What to learn / certifications
5. Realistic salary range in India
6. Job demand (High/Medium/Stable)
7. Time to first income from today

End with a "Your Next 30 Days" action plan with 3 concrete steps.{lang_instr}"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
        temperature=0.7,
    )
    return {"career_suggestions": response.choices[0].message.content}