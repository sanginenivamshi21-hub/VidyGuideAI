# Feature Specifications

This document catalogs technical scopes for every validated feature in the prototype.

---

## 1. User Authentication & Verification OTP
* **Validation Rules**:
  * Username: Alpha-numeric, 3 to 20 characters.
  * Password: Minimum 8 characters, containing at least 1 uppercase letter, 1 number, and 1 special symbol.
  * Email: Match standard regex format.
* **OTP Rule**: 6-digit random string, valid for 10 minutes, flagged with single-use markers.

---

## 2. Localized Career suggestions
* **Inputs**:
  * Skills (string list)
  * Interests (string list)
  * Qualification (drop-down value from Class 10 to Masters)
  * Career Goal (Text)
  * Location (Text)
* **Response Requirements**: Must include salary projections, key entry portals, and timeline step actions.

---

## 3. Targeted Resume Builder
* **Template Heuristic**: Plaintext layout block including objective, skills array, qualification history, and target organization profile.
* **PDF Exporter**: Use ReportLab grid layout to generate A4 print-ready resumes with 0.75-inch margins.

---

## 4. PDF Resume OCR Analyzer
* **Input File**: `.pdf` upload (max 5MB).
* **Processing**: Parse using `PyPDF2` (plaintext extraction) or Image OCR if scanning a picture format.
* **Output Evaluation**: ATS Match Rating (1-100), key skills gap findings, formatting feedback comments.
