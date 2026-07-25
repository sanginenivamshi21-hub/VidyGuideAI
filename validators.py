"""validators.py — VidyGuide Real-Time Input Validation"""
import re


def validate_username(u: str) -> tuple[bool, str]:
    u = u.strip()
    if not u: return False, ""
    if len(u) < 3: return False, "⚠️ Min. 3 characters"
    if len(u) > 30: return False, "⚠️ Max. 30 characters"
    if not re.match(r"^[a-zA-Z0-9_]+$", u): return False, "⚠️ Letters, numbers, underscores only"
    return True, "✅ Looks good"


def validate_email(e: str) -> tuple[bool, str]:
    e = e.strip()
    if not e: return False, ""
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", e): return False, "⚠️ Enter a valid email"
    return True, "✅ Valid email"


def validate_password(p: str) -> tuple[bool, str]:
    if not p: return False, ""
    if len(p) < 6: return False, f"⚠️ {6-len(p)} more character(s) needed"
    strength = sum([len(p) >= 8, any(c.isupper() for c in p), any(c.isdigit() for c in p)])
    return True, ["Weak 🔴", "Fair 🟡", "Good 🟢", "Strong 💪"][min(strength, 3)]


def validate_password_match(p1: str, p2: str) -> tuple[bool, str]:
    if not p2: return False, ""
    if p1 != p2: return False, "⚠️ Passwords don't match"
    return True, "✅ Passwords match"


def validate_skills(s: str) -> tuple[bool, str]:
    s = s.strip()
    if not s: return False, ""
    items = [w for w in re.split(r"[,\n]+", s) if w.strip()]
    if len(s) > 500: return False, "⚠️ Max 500 characters"
    return True, f"✅ {len(items)} skill(s) detected"


def validate_interests(t: str) -> tuple[bool, str]:
    t = t.strip()
    if not t: return False, ""
    if len(t) < 3: return False, "⚠️ Tell us a bit more"
    return True, "✅"


def validate_name(n: str) -> tuple[bool, str]:
    n = n.strip()
    if not n: return False, ""
    if len(n) < 2: return False, "⚠️ Enter your full name"
    if not re.match(r"^[a-zA-Z\s'.]+$", n): return False, "⚠️ Letters only"
    return True, "✅"


def validate_phone(p: str) -> tuple[bool, str]:
    p = p.strip()
    if not p: return False, ""
    digits = re.sub(r"[\s\-\+\(\)]", "", p)
    if not digits.isdigit(): return False, "⚠️ Digits only"
    if not (10 <= len(digits) <= 13): return False, "⚠️ Enter a valid 10-digit number"
    return True, "✅"


def validate_resume_text(t: str) -> tuple[bool, str]:
    t = t.strip()
    if not t: return False, ""
    wc = len(t.split())
    if len(t) < 50: return False, "⚠️ Paste more content"
    if wc < 20: return False, "⚠️ Resume too short"
    quality = "Good ✅" if len(t) > 500 else "Fair 🟡"
    return True, f"{quality} — {wc} words"


def validate_question(q: str) -> tuple[bool, str]:
    q = q.strip()
    if not q: return False, ""
    if len(q) < 10: return False, "⚠️ Ask a complete question"
    return True, "✅ Ready to ask"


def validate_free_text(t: str, name: str = "Field", min_len: int = 2, max_len: int = 1000) -> tuple[bool, str]:
    t = t.strip()
    if not t: return False, ""
    if len(t) < min_len: return False, f"⚠️ {name} too short"
    if len(t) > max_len: return False, f"⚠️ Max {max_len} chars"
    return True, "✅"


def sanitize(text: str, max_len: int = 2000) -> str:
    text = text.strip()
    text = re.sub(r"[<>{}]", "", text)
    return text[:max_len]