"""
resume_pdf.py — VidyGuide Professional PDF Resume Generator
Converts plain-text resume output into a beautifully formatted PDF.
Requires: reportlab (pip install reportlab)
"""

from io import BytesIO
import re

try:
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    REPORTLAB_OK = True
except ImportError:
    REPORTLAB_OK = False


# ── Colour palette ─────────────────────────────────────────────────────────
DARK_GREEN   = colors.HexColor("#1E6B42")
MID_GREEN    = colors.HexColor("#3DDC84")
LIGHT_GREEN  = colors.HexColor("#E8F8F0")
DARK_TEXT    = colors.HexColor("#1A1A2E")
MUTED_TEXT   = colors.HexColor("#5A6A7A")
RULE_COLOR   = colors.HexColor("#2A3550")
WHITE        = colors.white


def _build_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles["name"] = ParagraphStyle(
        "name",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=DARK_GREEN,
        spaceAfter=2,
        leading=26,
    )
    styles["contact"] = ParagraphStyle(
        "contact",
        fontName="Helvetica",
        fontSize=8.5,
        textColor=MUTED_TEXT,
        spaceAfter=6,
        leading=13,
    )
    styles["section_head"] = ParagraphStyle(
        "section_head",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DARK_GREEN,
        spaceBefore=10,
        spaceAfter=3,
        leading=14,
        textTransform="uppercase",
        letterSpacing=0.8,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9,
        textColor=DARK_TEXT,
        spaceAfter=4,
        leading=13,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=9,
        textColor=DARK_TEXT,
        spaceAfter=3,
        leading=13,
        leftIndent=12,
        bulletIndent=4,
        bulletText="•",
    )
    styles["role_title"] = ParagraphStyle(
        "role_title",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        textColor=DARK_TEXT,
        spaceAfter=2,
        leading=13,
    )
    styles["role_meta"] = ParagraphStyle(
        "role_meta",
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        textColor=MUTED_TEXT,
        spaceAfter=4,
        leading=12,
    )
    return styles


def _section_rule(story, rule_color=RULE_COLOR):
    story.append(HRFlowable(
        width="100%", thickness=0.5, color=rule_color,
        spaceAfter=4, spaceBefore=0
    ))


def _parse_resume_sections(text: str) -> dict:
    """
    Parse plain-text resume into sections.
    Handles both well-structured and free-form AI-generated text.
    Supports: ALL CAPS, Title Case, markdown **bold**, colon-terminated headers.
    """
    import re as _re

    sections = {}
    current_key = "header"
    current_lines = []

    SECTION_KEYWORDS = {
        "objective", "summary", "education", "skills", "experience",
        "projects", "internships", "certifications", "achievements",
        "awards", "hobbies", "languages", "activities", "profile",
        "work experience", "technical skills", "career objective",
        "professional summary", "professional experience", "key skills",
        "personal information", "contact", "contact information",
        "about me", "declaration", "references",
    }

    def _normalise(raw: str) -> str:
        """Strip markdown bold/italic, dashes, colons, leading bullets."""
        s = raw.strip()
        s = _re.sub(r"[*_#]+", "", s)   # remove ** __ ## etc
        s = _re.sub(r"^[-•→▸]+\s*", "", s)  # remove leading bullets
        s = s.rstrip(":").strip()
        return s.lower()

    for line in text.split("\n"):
        stripped = line.strip()
        if not stripped:
            current_lines.append("")
            continue

        norm = _normalise(stripped)

        # Detect section header
        is_header = (
            # All-caps word(s) like SKILLS, EDUCATION
            (_re.sub(r"[*_#:\s]", "", stripped).isupper()
             and 3 < len(_re.sub(r"\s", "", stripped)) < 50) or
            # Exact keyword match after normalisation
            (norm in SECTION_KEYWORDS and len(stripped) < 60) or
            # Keyword with trailing colon  e.g. "Skills:" or "**Skills:**"
            (norm.rstrip(":") in SECTION_KEYWORDS and len(stripped) < 60)
        )

        if is_header:
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
            current_key = norm.rstrip(":").strip()
            current_lines = []
        else:
            current_lines.append(stripped)

    if current_lines:
        sections[current_key] = "\n".join(current_lines).strip()

    return sections


def _add_header(story, styles, resume_text: str, name: str, contact_info: str):
    """Add the name + contact block at the top."""
    # Try to extract name from first non-empty line
    lines = [l.strip() for l in resume_text.split("\n") if l.strip()]
    display_name = name if name else (lines[0] if lines else "Candidate")

    story.append(Paragraph(display_name.title(), styles["name"]))
    if contact_info:
        story.append(Paragraph(contact_info, styles["contact"]))
    _section_rule(story, MID_GREEN)
    story.append(Spacer(1, 4))


def _add_section(story, styles, title: str, content: str):
    """Add a labelled section with auto-detected bullet points."""
    if not content or not content.strip():
        return

    story.append(Paragraph(title.upper(), styles["section_head"]))
    _section_rule(story)

    for line in content.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 3))
            continue

        # Detect bullet lines
        if line.startswith(("-", "•", "*", "→", "▸")):
            clean = line.lstrip("-•*→▸ ").strip()
            story.append(Paragraph(clean, styles["bullet"]))
        elif re.match(r"^\d+[\.\)]\s", line):  # numbered lists
            clean = re.sub(r"^\d+[\.\)]\s*", "", line)
            story.append(Paragraph(f"  {clean}", styles["bullet"]))
        else:
            story.append(Paragraph(line, styles["body"]))

    story.append(Spacer(1, 4))


def generate_resume_pdf(
    resume_text: str,
    name: str = "",
    phone: str = "",
    email: str = "",
    location: str = "",
    linkedin: str = "",
) -> bytes:
    """
    Convert a plain-text resume into a professional PDF.
    Returns raw PDF bytes ready for st.download_button.
    """
    if not REPORTLAB_OK:
        raise ImportError("reportlab not installed. Run: pip install reportlab")

    buf    = BytesIO()
    styles = _build_styles()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=18*mm,
        rightMargin=18*mm,
        topMargin=16*mm,
        bottomMargin=16*mm,
    )

    story = []

    # ── Contact line ──────────────────────────────────────────────────────
    contact_parts = [p for p in [phone, email, location, linkedin] if p and p.strip()]
    contact_str   = "  |  ".join(contact_parts)

    _add_header(story, styles, resume_text, name, contact_str)

    # ── Parse and render sections ─────────────────────────────────────────
    sections = _parse_resume_sections(resume_text)

    SECTION_ORDER = [
        ("objective", "Career Objective"),
        ("summary",   "Professional Summary"),
        ("profile",   "Profile"),
        ("career objective", "Career Objective"),
        ("education", "Education"),
        ("experience","Work Experience"),
        ("work experience","Work Experience"),
        ("skills",    "Skills"),
        ("technical skills","Technical Skills"),
        ("projects",  "Projects"),
        ("internships","Internships"),
        ("certifications","Certifications"),
        ("achievements","Achievements & Awards"),
        ("awards",    "Awards"),
        ("languages", "Languages"),
        ("activities","Activities"),
        ("hobbies",   "Hobbies & Interests"),
    ]

    rendered = set()
    for key, display_title in SECTION_ORDER:
        if key in sections and key not in rendered:
            _add_section(story, styles, display_title, sections[key])
            rendered.add(key)

    # Render any remaining sections not in the order list
    # Exclude 'header' and contact-info-like keys that shouldn't be re-rendered
    _skip_keys = {"header", "contact", "contact information", "personal information",
                  "personal details", "contact details", "about", "ravi kumar"}
    for key, content in sections.items():
        if key not in rendered and key.lower() not in _skip_keys:
            # Skip if key looks like a name (no spaces and title-cased)
            if len(key.split()) == 2 and key.replace(" ","").isalpha():
                continue
            _add_section(story, styles, key.title(), content)

    doc.build(story)
    return buf.getvalue()

if __name__ == "__main__":
    import sys
    import json
    try:
        data = json.load(sys.stdin)
        pdf_bytes = generate_resume_pdf(
            resume_text=data.get("resume_text", ""),
            name=data.get("name", ""),
            phone=data.get("phone", ""),
            email=data.get("email", ""),
            location=data.get("location", ""),
            linkedin=data.get("linkedin", ""),
        )
        sys.stdout.buffer.write(pdf_bytes)
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)