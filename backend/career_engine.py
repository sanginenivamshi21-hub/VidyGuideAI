from dotenv import load_dotenv
load_dotenv()
import os
from groq import Groq

client = Groq(api_key="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")

def suggest_career(data):

    skills = data["skills"]
    interests = data["interests"]
    education = data["education"]

    prompt = f"""
    Suggest 5 tech careers.

    Skills: {skills}
    Interests: {interests}
    Education: {education}

    Explain each career briefly.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role":"user","content":prompt}]
    )

    return {
        "career_suggestions": response.choices[0].message.content
    }
