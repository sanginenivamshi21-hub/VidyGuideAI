# Frequently Asked Questions (FAQ)

### 1. What is VidyGuideAI?
VidyGuideAI is an AI-powered career counseling platform tailored for Indian students across different qualifications (Class 10, Class 12, ITI, Diploma, Bachelors, and Masters).

### 2. Can I use the platform for free?
Yes. VidyGuideAI is built as an open-source tool, always free for students.

### 3. Which regional Indian languages are supported?
The platform supports translation of career guidance, resume evaluation feedback, and mentor conversation replies in Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, and Gujarati.

### 4. Why does the visual career roadmap occasionally show as empty?
The visual timeline generator parses milestones from the AI response using English regex keywords. If the LLM generates the output in a regional language (like Hindi or Telugu), the regex parser will fail to find matches. We recommend generating the roadmap in English if the timeline is needed.
