# API Reference

Base URL: `http://localhost:8000`

## Authentication

All protected endpoints require a JWT access token sent via HTTP-only cookie (`accessToken`) or `Authorization: Bearer <token>` header.

### `POST /auth/register`
Create a new user account. OTP is sent to the registered email.
```json
{ "username": "john", "email": "john@example.com", "password": "SecurePass1!", "fullName": "John Doe" }
```
Response: `{ "message": "...", "userId": 1 }`

### `POST /auth/login`
Authenticate with email and password.
```json
{ "email": "john@example.com", "password": "SecurePass1!" }
```
Response: Sets `accessToken` and `refreshToken` cookies.

### `POST /auth/verify-otp`
Verify OTP for registration or login.
```json
{ "email": "john@example.com", "code": "123456", "purpose": "register" }
```

### `POST /auth/forgot-password`
Request password reset OTP.
```json
{ "email": "john@example.com" }
```

### `POST /auth/reset-password`
Reset password using OTP.
```json
{ "email": "john@example.com", "code": "123456", "password": "NewPass1!" }
```

### `POST /auth/logout`
Clear authentication cookies.

## Resume

### `POST /resume`
Generate ATS-optimized resume via AI.
```json
{ "name": "John", "target_role": "Software Engineer", "target_company": "Google", "education_level": "B.Tech", "skills": "Python, JS" }
```

### `POST /resume/feedback`
Get ATS score and improvement suggestions.
```json
{ "resume": "Resume text here...", "reply_language": "en" }
```

### `POST /resume/pdf`
Export resume as PDF.
```json
{ "resume_text": "...", "name": "...", "phone": "...", "email": "...", "location": "...", "linkedin": "..." }
```
Response: Binary PDF file.

## OCR

### `POST /ocr/scan`
Upload a PDF or image file (multipart/form-data, field: `file`) to extract text.

## Career

### `POST /career`
Get career suggestions.
```json
{ "education": "B.Tech CSE", "skills": "Python", "interests": "AI", "goal": "Software Engineer" }
```

### `POST /career/roadmap`
Generate career roadmap timeline.
```json
{ "education": "B.Tech", "goal": "Data Scientist" }
```

## Mentor

### `POST /mentor`
Ask the AI mentor.
```json
{ "query": "What career path should I take after 12th?", "language": "en" }
```

### `POST /mentor/interview`
Start mock interview.
```json
{ "role": "Software Engineer", "company": "TCS", "language": "en" }
```

### `POST /mentor/interview/feedback`
Get interview feedback.
```json
{ "qa_history": [{ "question": "...", "answer": "..." }] }
```

## Translator

### `POST /translator`
Translate text to target language.
```json
{ "text": "Hello", "target_lang": "te", "source_lang": "en" }
```

## Users

### `GET /users/profile`
Get authenticated user's profile.

### `PUT /users/profile`
Update user profile.
```json
{ "fullName": "John Updated", "preferredLanguage": "te" }
```

## Voice

### `GET /voice/widget`
Returns HTML widget for voice mentor.

## History

### `GET /history`
List user's interaction history.

### `POST /history`
Save an interaction.
```json
{ "actionType": "resume", "title": "Generated Resume", "payload": {}, "result": "..." }
```

### `DELETE /history/:id`
Delete a specific history entry.

### `DELETE /history`
Clear all user history.
