"""
translator.py — VidyGuide Multilingual Support
Uses Google Translate public HTTP endpoint — no API key, no extra packages.
Falls back gracefully if network is unavailable.
"""

import re
import json
import urllib.request
import urllib.parse

SUPPORTED_LANGUAGES = {
    "English":    "en",
    "Telugu":     "te",
    "Hindi":      "hi",
    "Tamil":      "ta",
    "Kannada":    "kn",
    "Malayalam":  "ml",
    "Marathi":    "mr",
    "Bengali":    "bn",
    "Gujarati":   "gu",
    "Punjabi":    "pa",
    "Odia":       "or",
    "Urdu":       "ur",
}

# RTL languages
RTL_LANGS = {"ur", "ar"}


def translate_text(text: str, target_lang: str, source_lang: str = "en") -> tuple[bool, str]:
    """
    Translate text using Google Translate's public endpoint.
    Returns (success, translated_text_or_error).
    No API key required. Works for reasonable lengths of text.
    """
    if not text or not text.strip():
        return True, text

    if target_lang == source_lang or target_lang == "en":
        return True, text

    # Google Translate public API (unofficial but widely used)
    try:
        base_url = "https://translate.googleapis.com/translate_a/single"
        params   = {
            "client": "gtx",
            "sl":     source_lang,
            "tl":     target_lang,
            "dt":     "t",
            "q":      text[:4000],  # cap to avoid request too large
        }
        url = base_url + "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0"
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        # Parse response: list of [translated, original, ...]
        translated = ""
        for chunk in data[0]:
            if chunk[0]:
                translated += chunk[0]

        return True, translated.strip()

    except Exception as e:
        err = str(e).lower()
        if "timeout" in err or "connection" in err or "resolution" in err:
            return False, "Translation unavailable — no internet connection."
        return False, f"Translation error: {str(e)}"


def translate_chunks(text: str, target_lang: str, chunk_size: int = 2000) -> tuple[bool, str]:
    """
    Translate long text in chunks to stay within limits.
    Preserves paragraph structure.
    """
    if target_lang == "en":
        return True, text

    paragraphs = text.split("\n\n")
    translated_parts = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) > chunk_size:
            if current_chunk:
                ok, result = translate_text(current_chunk.strip(), target_lang)
                if not ok:
                    return False, result
                translated_parts.append(result)
                current_chunk = para
            else:
                # Single paragraph too long — translate directly
                ok, result = translate_text(para[:chunk_size], target_lang)
                if not ok:
                    return False, result
                translated_parts.append(result)
        else:
            current_chunk += ("\n\n" if current_chunk else "") + para

    if current_chunk.strip():
        ok, result = translate_text(current_chunk.strip(), target_lang)
        if not ok:
            return False, result
        translated_parts.append(result)

    return True, "\n\n".join(translated_parts)


def get_lang_code(lang_name: str) -> str:
    """Get ISO language code from display name."""
    return SUPPORTED_LANGUAGES.get(lang_name, "en")


def is_rtl(lang_code: str) -> bool:
    return lang_code in RTL_LANGS