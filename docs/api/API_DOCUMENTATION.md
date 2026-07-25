# API Documentation

This document describes the REST API endpoints exposed by the FastAPI backend server (`http://localhost:8000`).

---

## 1. Request Header Specification
Every client must interact with the backend using standard JSON headers:
```http
Content-Type: application/json
```

---

## 2. API Endpoints

### 📡 GET / (Health Check)
Verifies the running state of the ASGI runtime environment.

* **Response (200 OK)**:
  ```json
  {
    "message": "VidyGuide AI Backend Running ✅",
    "version": "2.0"
  }
  ```

---

### 🌱 POST /career (Guidance Generator)
Generates level-specific, localized career recommendations and timeline milestones using LLaMA-3.

* **Request Body**:
  ```json
  {
    "skills": "Python, SQL, HTML",
    "interests": "Computers, Data Analytics",
    "education": "🎓 Bachelor's Degree (B.Tech / B.Sc)",
    "education_level": "bachelors",
    "education_detail": "B.Tech CSE - JNTU",
    "goal": "Get a job quickly",
    "location": "Hyderabad, Telangana",
    "extra_context": "Want to start working within 6 months",
    "reply_language": "en"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "career_suggestions": "🌱 1. Software Engineer\n- Average salary: ₹6-12 LPA\n- Skills needed: Python, Git..."
  }
  ```

---

### 📝 POST /resume (Resume Builder)
Generates plaintext targeted resumes based on candidate profile.

* **Request Body**:
  ```json
  {
    "name": "Ravi Kumar",
    "skills": "Python, SQL, JavaScript",
    "education": "B.Tech CSE",
    "projects": "Library Management System - Python - 2025",
    "target_role": "Software Engineer",
    "target_company": "TCS",
    "education_level": "bachelors",
    "phone": "+91 98765 43210",
    "email": "ravi@gmail.com",
    "location": "Hyderabad",
    "linkedin": "linkedin.com/in/ravi",
    "languages": "English, Telugu",
    "achievements": "School topper, Hackathon runner-up",
    "hobbies": "Cricket, Chess",
    "domain": "Software / IT"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "resume": "RAVI KUMAR\n------------------\nOBJECTIVE\n..."
  }
  ```

---

### 📄 POST /resume-feedback (ATS Evaluator)
Evaluates resume text and outputs improvement advice.

* **Request Body**:
  ```json
  {
    "resume": "Full resume plaintext goes here...",
    "reply_language": "en"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "feedback": "1. Overall Impression: 7/10\n- Strengths: Clear skills list...\n- Weaknesses: No action verbs..."
  }
  ```

---

### 🤖 POST /mentor (AI Counselor Advice)
Generates conversational career advice for specific user queries.

* **Request Body**:
  ```json
  {
    "question": "How can I switch from mechanical engineering to data science?",
    "reply_language": "en"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "response": "Hello! Switching domains is fully possible. Here is what you should do: 1..."
  }
  ```
