CAREER_DATA = [
    {
        "title": "Software Engineer",
        "skills": ["Python", "Java", "algorithms", "data structures", "system design"],
        "education": ["Computer Science", "Software Engineering", "IT"],
        "industries": ["Tech", "Finance", "Healthcare"],
        "avg_salary": "₹8–25 LPA",
        "growth": "High",
        "description": "Build and maintain software systems, applications, and services."
    },
    {
        "title": "Data Scientist",
        "skills": ["Python", "Machine Learning", "statistics", "SQL", "data visualization"],
        "education": ["Statistics", "Mathematics", "Computer Science", "Data Science"],
        "industries": ["Tech", "Finance", "Research"],
        "avg_salary": "₹7–22 LPA",
        "growth": "Very High",
        "description": "Extract insights from data using statistical modeling and ML."
    },
    {
        "title": "UI/UX Designer",
        "skills": ["Figma", "user research", "wireframing", "prototyping", "Adobe XD"],
        "education": ["Design", "HCI", "Fine Arts", "Psychology"],
        "industries": ["Tech", "Media", "E-commerce"],
        "avg_salary": "₹5–18 LPA",
        "growth": "High",
        "description": "Design intuitive digital experiences and interfaces."
    },
    {
        "title": "Digital Marketer",
        "skills": ["SEO", "content writing", "social media", "Google Ads", "analytics"],
        "education": ["Marketing", "Communications", "Business"],
        "industries": ["E-commerce", "Media", "Startups"],
        "avg_salary": "₹4–14 LPA",
        "growth": "High",
        "description": "Drive brand growth and customer acquisition through digital channels."
    },
    {
        "title": "Cybersecurity Analyst",
        "skills": ["networking", "ethical hacking", "Linux", "SIEM tools", "risk assessment"],
        "education": ["Computer Science", "IT", "Cybersecurity"],
        "industries": ["Finance", "Government", "Defense", "Tech"],
        "avg_salary": "₹6–20 LPA",
        "growth": "Very High",
        "description": "Protect systems and networks from digital threats and breaches."
    },
    {
        "title": "Product Manager",
        "skills": ["roadmapping", "stakeholder management", "agile", "user research", "data analysis"],
        "education": ["Business", "Engineering", "MBA"],
        "industries": ["Tech", "Finance", "E-commerce"],
        "avg_salary": "₹10–30 LPA",
        "growth": "High",
        "description": "Lead product development from ideation to launch."
    },
    {
        "title": "Data Analyst",
        "skills": ["Excel", "SQL", "Power BI", "Tableau", "statistics"],
        "education": ["Statistics", "Mathematics", "Commerce", "Computer Science"],
        "industries": ["Finance", "Retail", "Healthcare", "Consulting"],
        "avg_salary": "₹4–14 LPA",
        "growth": "High",
        "description": "Analyze datasets to support business decision-making."
    },
   {
        "title": "Cloud Engineer",
        "skills": ["AWS", "Azure", "GCP", "DevOps", "Terraform", "Linux"],
        "education": ["Computer Science", "IT", "Electronics"],
        "industries": ["Tech", "Finance", "Healthcare"],
        "avg_salary": "₹8–28 LPA",
        "growth": "Very High",
        "description": "Design and manage cloud infrastructure and deployments."
    },
    {
        "title": "Content Creator / Influencer",
        "skills": ["video editing", "storytelling", "social media", "photography", "writing"],
        "education": ["Media", "Communications", "Any field"],
        "industries": ["Media", "Entertainment", "Education"],
        "avg_salary": "₹2–20 LPA (variable)",
        "growth": "Medium",
        "description": "Create engaging content across platforms to build an audience."
    },
    {
        "title": "Teacher / Educator",
        "skills": ["communication", "curriculum design", "subject expertise", "patience"],
        "education": ["B.Ed", "Subject specialization", "Any graduate degree"],
        "industries": ["Education", "EdTech", "NGOs"],
        "avg_salary": "₹3–12 LPA",
        "growth": "Stable",
        "description": "Educate and inspire students in schools, colleges, or online platforms."
    },
]


def get_all_careers() -> list[dict]:
    """Return the full career dataset."""
    return CAREER_DATA


def get_career_by_title(title: str) -> dict | None:
    """Look up a career by title (case-insensitive)."""
    for career in CAREER_DATA:
        if career["title"].lower() == title.lower():
            return career
    return None

def get_careers_by_skill(skill: str) -> list[dict]:
    """Return careers that require a specific skill."""
    skill_lower = skill.lower()
    return [c for c in CAREER_DATA if any(skill_lower in s.lower() for s in c["skills"])]
