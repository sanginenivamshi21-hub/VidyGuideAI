from groq import Groq
import os
client = Groq(api_key="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")

def generate_resume(data):

    name = data["name"]
    skills = data["skills"]
    education = data["education"]
    projects = data["projects"]

    prompt = f"""
    Create a professional ATS-friendly resume.

    Name: {name}
    Skills: {skills}
    Education: {education}
    Projects: {projects}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role":"user","content":prompt}]
    )

    return {"resume": response.choices[0].message.content}
