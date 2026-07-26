# API Reference

Base URL: `http://localhost:8000`

All protected endpoints require a JWT access token sent via HTTP-only cookie (`accessToken`).

---

## Authentication

### `POST /auth/register`
Create a new user account. OTP is sent to the registered email.

```json
{ "username": "john", "email": "john@example.com", "password": "SecurePass1!", "fullName": "John Doe" }
```

**Response:** `{ "message": "...", "userId": 1 }`

### `POST /auth/login`
Authenticate with email and password.

```json
{ "email": "john@example.com", "password": "SecurePass1!" }
```

**Response:** Sets `accessToken` and `refreshToken` cookies.

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

---

## Career

### `POST /career`
Get career suggestions based on education, skills, and interests.

```json
{ "education": "B.Tech CSE", "skills": "Python", "interests": "AI", "goal": "Software Engineer" }
```

### `POST /career/roadmap`
Generate a visual career roadmap timeline.

```json
{ "education": "B.Tech", "goal": "Data Scientist" }
```

---

## Resume

### `POST /resume`
Generate an ATS-optimized resume via AI.

```json
{ "name": "John", "target_role": "Software Engineer", "target_company": "Google", "education_level": "B.Tech", "skills": "Python, JS" }
```

### `POST /resume/feedback`
Get ATS score and section-by-section improvement suggestions.

```json
{ "resume": "Resume text here...", "reply_language": "en" }
```

### `POST /resume/pdf`
Export resume as a professionally formatted PDF.

```json
{ "resume_text": "...", "name": "...", "phone": "...", "email": "...", "location": "...", "linkedin": "..." }
```

**Response:** Binary PDF file.

---

## OCR

### `POST /ocr/scan`
Upload a PDF or image file (multipart/form-data, field: `file`) to extract text. Supports PDF (native + scanned), JPG, and PNG.

---

## AI Mentor

### `POST /mentor`
Ask the AI mentor a question.

```json
{ "query": "What career path should I take after 12th?", "language": "en" }
```

### `POST /mentor/stream`
Stream AI mentor response token-by-token (Server-Sent Events).

```json
{ "question": "...", "reply_language": "en", "model": "llama-3.3-70b-versatile", "messages": [] }
```

### `POST /mentor/interview`
Start a mock interview session.

```json
{ "role": "Software Engineer", "company": "TCS", "language": "en" }
```

### `POST /mentor/interview/feedback`
Get interview performance feedback.

```json
{ "qa_history": [{ "question": "...", "answer": "..." }] }
```

---

## Conversations

### `GET /conversations`
List all conversations for the authenticated user.

### `POST /conversations`
Create a new conversation.

```json
{ "title": "New Chat" }
```

### `GET /conversations/:id`
Get a conversation with all messages.

### `PUT /conversations/:id`
Update conversation (title, pinned status).

```json
{ "title": "Updated Title", "pinned": true }
```

### `DELETE /conversations/:id`
Delete a conversation and its messages.

### `POST /conversations/:id/messages`
Add a message to a conversation.

```json
{ "role": "user", "content": "Hello" }
```

---

## Translator

### `POST /translator`
Translate text to a target language.

```json
{ "text": "Hello", "target_lang": "te", "source_lang": "en" }
```

Supported languages: English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati.

---

## Settings

### `GET /settings`
Get the authenticated user's settings.

### `PUT /settings`
Update user settings (theme, accent color, model, voice, etc.).

```json
{ "theme": "dark", "accentColor": "emerald", "model": "llama-3.3-70b-versatile" }
```

---

## Users

### `GET /users/profile`
Get the authenticated user's profile with usage stats.

### `PUT /users/profile`
Update user profile (name, password, language, etc.).

```json
{ "fullName": "John Updated", "preferredLanguage": "te" }
```

### `POST /users/profile/picture`
Upload a profile picture (multipart/form-data, field: `file`).

### `DELETE /users/profile/picture`
Remove the profile picture.

### `DELETE /users/account`
Permanently delete the user account and all associated data.

### `GET /users/export`
Export all user data as a JSON file download.

---

## History

### `GET /history`
List all user interactions (paginated, searchable).

### `POST /history`
Save a new interaction record.

```json
{ "actionType": "resume", "title": "Generated Resume", "payload": {}, "result": "..." }
```

### `DELETE /history/:id`
Delete a specific history entry.

### `DELETE /history`
Clear all user history.
