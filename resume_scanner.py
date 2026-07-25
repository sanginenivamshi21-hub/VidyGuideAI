"""
resume_scanner.py — VidyGuide Resume Scanner
Extracts text from uploaded PDF or image files.
Supports: PDF (native text), PDF (scanned/image), JPG/PNG images
Requires: pytesseract, Pillow, pypdf (pip install pytesseract Pillow pypdf)
Also requires: tesseract-ocr system package (sudo apt install tesseract-ocr)
"""

import io
import os
import re
import tempfile
from typing import Union

try:
    from PIL import Image, ImageEnhance, ImageFilter
    PIL_OK = True
except ImportError:
    PIL_OK = False

try:
    import pytesseract
    TESS_OK = True
except ImportError:
    TESS_OK = False

try:
    from pypdf import PdfReader
    PYPDF_OK = True
except ImportError:
    try:
        from PyPDF2 import PdfReader
        PYPDF_OK = True
    except ImportError:
        PYPDF_OK = False


def _preprocess_image(img: "Image.Image") -> "Image.Image":
    """Enhance image quality for better OCR accuracy."""
    # Convert to greyscale
    img = img.convert("L")
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    # Scale up if small
    w, h = img.size
    if w < 1000:
        scale = 1000 / w
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    return img


def _clean_extracted_text(text: str) -> str:
    """Clean up OCR / PDF-extracted text."""
    # Remove excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Remove stray single characters on their own line (OCR noise)
    text = re.sub(r"(?m)^\s*[|\\/_]\s*$", "", text)
    return text.strip()


def extract_text_from_image(file_bytes: bytes, filename: str = "") -> tuple[bool, str]:
    """
    Extract text from an image file (JPG, PNG, WEBP, BMP).
    Returns (success, text_or_error_message).
    """
    if not PIL_OK:
        return False, "Pillow not installed. Run: pip install Pillow"
    if not TESS_OK:
        return False, "pytesseract not installed. Run: pip install pytesseract"

    try:
        img = Image.open(io.BytesIO(file_bytes))
        img = _preprocess_image(img)

        # Try English + Hindi (covers most Indian resumes)
        try:
            text = pytesseract.image_to_string(img, lang="eng+hin",
                                               config="--psm 6 --oem 3")
        except Exception:
            text = pytesseract.image_to_string(img, lang="eng",
                                               config="--psm 6 --oem 3")

        text = _clean_extracted_text(text)
        if len(text.strip()) < 30:
            return False, "Could not extract enough text from this image. Try a clearer scan."
        return True, text

    except Exception as e:
        return False, f"Image processing error: {str(e)}"


def extract_text_from_pdf(file_bytes: bytes) -> tuple[bool, str]:
    """
    Extract text from a PDF file.
    Tries native text extraction first; falls back to OCR for scanned PDFs.
    Returns (success, text_or_error_message).
    """
    # ── Try native PDF text extraction ────────────────────────────────────
    if PYPDF_OK:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            full_text = ""
            for page in reader.pages:
                page_text = page.extract_text() or ""
                full_text += page_text + "\n"

            full_text = _clean_extracted_text(full_text)
            if len(full_text.strip()) > 100:
                return True, full_text
            # Text too short — likely a scanned PDF, fall through to OCR
        except Exception:
            pass

    # ── OCR fallback for scanned PDFs ─────────────────────────────────────
    if not PIL_OK or not TESS_OK:
        return False, ("Could not extract text. Install pytesseract + Pillow "
                       "for scanned PDF support, or copy-paste your resume text manually.")

    try:
        # Convert PDF pages to images using pdf2image if available
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, dpi=200)
        except ImportError:
            return False, ("pdf2image not installed. For scanned PDFs run: "
                           "pip install pdf2image\n"
                           "Or copy-paste your resume text in the text box.")

        full_text = ""
        for img in images[:6]:  # max 6 pages
            img = _preprocess_image(img)
            try:
                page_text = pytesseract.image_to_string(img, lang="eng",
                                                        config="--psm 6 --oem 3")
            except Exception:
                continue
            full_text += page_text + "\n"

        full_text = _clean_extracted_text(full_text)
        if len(full_text.strip()) < 50:
            return False, "Could not extract text from this PDF. Try uploading as JPG/PNG."
        return True, full_text

    except Exception as e:
        return False, f"PDF processing error: {str(e)}"


def scan_resume_file(uploaded_file) -> tuple[bool, str]:
    """
    Main entry point. Accepts a Streamlit UploadedFile object.
    Auto-detects file type and returns (success, extracted_text).
    """
    if uploaded_file is None:
        return False, "No file uploaded."

    filename = uploaded_file.name.lower()
    file_bytes = uploaded_file.read()

    if not file_bytes:
        return False, "Uploaded file is empty."

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif any(filename.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff"]):
        return extract_text_from_image(file_bytes, filename)
    elif filename.endswith(".txt"):
        try:
            return True, file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return False, "Could not read text file."
    else:
        return False, f"Unsupported file type: {filename.split('.')[-1].upper()}. Upload PDF, JPG, PNG, or TXT."