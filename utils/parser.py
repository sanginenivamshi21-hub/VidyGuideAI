import re


def clean_text(text: str) -> str:
    """Remove excessive whitespace and normalize line endings."""
    text = text.strip()
    text = re.sub(r"{3,}", "", text)
    return text


def extract_sections(text: str, section_headers: list[str]) -> dict[str, str]:
    """
    Given a block of text and a list of expected section headers,
    extract each section's content as a dict.
    
    Example:
        extract_sections(resume_text, ["Summary", "Skills", "Education"])
    """
    sections = {}
    pattern = "|".join(re.escape(h) for h in section_headers)
    parts = re.split(rf"(?i)({pattern}):?", text)

    current_key = None
    for part in parts:
        if part.strip().title() in [h.title() for h in section_headers]:
            current_key = part.strip().title()
            sections[current_key] = ""
        elif current_key:
            sections[current_key] += part.strip()

    return sections


def parse_career_suggestions(text: str) -> list[dict]:
    """
    Parse numbered career suggestions from AI output into structured dicts.
    Expects format like:
      1. Software Engineer
         Why it suits you: ...
         ...
    """
    careers = []
    blocks = re.split(r"(?=\d+\.)", text.strip())
    for block in blocks:
        lines = block.strip().splitlines()
        if not lines:
            continue
        title_match = re.match(r"\d+\.\s+(.*)", lines[0])
        if title_match:
            title = title_match.group(1).strip()
            body = "".join(lines[1:]).strip()
            careers.append({"title": title, "details": body})
    return careers


def sanitize_input(text: str, max_length: int = 2000) -> str:
    """Strip dangerous characters and truncate over-long inputs."""
    text = text.strip()
    text = re.sub(r"[<>{}]", "", text)
    return text[:max_length]
