from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

LANG_INSTRUCTIONS = {
    "en": "Reply in English.",
    "te": "IMPORTANT: Reply ONLY in Telugu (తెలుగు). Do not use English at all.",
    "hi": "IMPORTANT: Reply ONLY in Hindi (हिन्दी). Do not use English at all.",
    "ta": "IMPORTANT: Reply ONLY in Tamil (தமிழ்). Do not use English at all.",
    "kn": "IMPORTANT: Reply ONLY in Kannada (ಕನ್ನಡ). Do not use English at all.",
    "ml": "IMPORTANT: Reply ONLY in Malayalam (മലയാളം). Do not use English at all.",
    "mr": "IMPORTANT: Reply ONLY in Marathi (मराठी). Do not use English at all.",
    "bn": "IMPORTANT: Reply ONLY in Bengali (বাংলা). Do not use English at all.",
    "gu": "IMPORTANT: Reply ONLY in Gujarati (ગુજરાતી). Do not use English at all.",
    "pa": "IMPORTANT: Reply ONLY in Punjabi (ਪੰਜਾਬੀ). Do not use English at all.",
    "or": "IMPORTANT: Reply ONLY in Odia (ଓଡ଼ିଆ). Do not use English at all.",
    "ur": "IMPORTANT: Reply ONLY in Urdu (اردو). Do not use English at all.",
}


def mentor_reply(data: dict):
    question     = data.get("question", "")
    reply_lang   = data.get("reply_language", "en")   # ISO code, default English

    lang_instr = LANG_INSTRUCTIONS.get(reply_lang, LANG_INSTRUCTIONS["en"])

    system_prompt = (
        "You are VidyGuide AI Mentor — a warm, experienced career counselor "
        "for Indian students and young professionals. "
        "Give clear, practical, actionable career advice. "
        "Be encouraging but honest. End with one concrete next step. "
        f"{lang_instr}"
    )

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": question}
        ],
        max_tokens=600,
        temperature=0.7,
    )
    return {"response": completion.choices[0].message.content}