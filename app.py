import streamlit as st
import requests
import streamlit as st

API = "http://127.0.0.1:8000"

st.title("VidyGuide AI")
st.subheader("Career Planning & Resume Mentor")
skills = st.text_input("Enter your skills")
interests = st.text_input("Enter your interests")
education = st.text_input("Enter your education")

menu = st.sidebar.selectbox(
    "Select Feature",
    ["Career Guidance","Resume Builder","Resume Analyzer","AI Mentor"]
)

# Career guidance
if menu == "Career Guidance":

    interests = interests
    skills = skills
    education = education

if st.button("Get Career Suggestions"):

    r = requests.post(
        "http://127.0.0.1:8000/career",
        json={
            "skills": skills,
            "interests": interests,
            "education": education
        }
    )

    if r.status_code == 200:
        data = r.json()
        st.success("Career Suggestions")
        st.write(data.get("career_suggestions", "No suggestions returned"))
    else:
        st.error("Backend error")
        st.text(r.text)

        


# Resume builder
elif menu == "Resume Builder":

    name = st.text_input("Name")
    skills = st.text_area("Skills")
    education = st.text_area("Education")
    projects = st.text_area("Projects")

    if st.button("Generate Resume"):

        r = requests.post(
            f"{API}/resume",
            json={
                "name":name,
                "skills":skills,
                "education":education,
                "projects":projects
            }
        )

        if r.status_code == 200:
            data = r.json()
            st.text_area("Generated Resume", data.get("resume","No resume generated"), height=400)
        else:
            st.error("Backend error")
            st.write(r.text)


# Resume analyzer
elif menu == "Resume Analyzer":

    resume = st.text_area("Paste your resume")

    if st.button("Analyze Resume"):

        r = requests.post(
            f"{API}/resume-feedback",
            json={"resume":resume}
        )

        st.write(r.json()["feedback"])


# AI mentor
elif menu == "AI Mentor":

    question = st.text_input("Ask career question")

    if st.button("Ask Mentor"):

        r = requests.post(
            f"{API}/mentor",
            json={"question":question}
        )

        st.write(r.json()["reply"])