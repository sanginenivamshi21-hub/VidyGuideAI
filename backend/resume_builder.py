from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))


def generate_resume(data):
    name         = data.get("name", "")
    target_role  = data.get("target_role", "")
    target_co    = data.get("target_company", "")
    edu_level    = data.get("education_level", "")
    phone        = data.get("phone", "")
    email        = data.get("email", "")
    location     = data.get("location", "")
    linkedin     = data.get("linkedin", "")
    skills       = data.get("skills", "")
    languages    = data.get("languages", "")
    achievements = data.get("achievements", "")
    hobbies      = data.get("hobbies", "")
    education    = data.get("education", "")
    projects     = data.get("projects", "")

    prompt = f"""You are an expert resume writer for Indian students and professionals.

Write a professional, ATS-friendly resume for:
- Name: {name}
- Target Role: {target_role}
- Target Company: {target_co}
- Education Level: {edu_level}
- Contact: {phone} | {email} | {location}
- LinkedIn/GitHub: {linkedin}
- Education: {education}
- Skills: {skills}
- Languages: {languages}
- Achievements: {achievements}
- Hobbies: {hobbies}
- Projects/Internships: {projects}

INSTRUCTIONS:
1. Write a resume SPECIFICALLY tailored for "{target_role}" at "{target_co}"
2. Use plain text format with clear section headers (no markdown asterisks)
3. Write a strong objective mentioning the target role and company
4. Use powerful action verbs
5. Keep it concise: 1 page for 10th/12th students, 1-2 pages for graduates
6. Do NOT invent fake data — use only what is provided above
7. Format section headers in ALL CAPS followed by a line of dashes

Output the complete resume in plain text format, ready to use."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
        temperature=0.6,
    )
    return {"resume": response.choices[0].message.content}