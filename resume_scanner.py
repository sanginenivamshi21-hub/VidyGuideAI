"""
resume_scanner.py — VidyGuide Resume Scanner
Extracts text from uploaded PDF or image files.
Supports: PDF (native text), PDF (scanned/image), JPG/PNG images
Requires: pytesseract, Pillow, pypdf (pip install pytesseract Pillow pypdf)
Also requires: tesseract-ocr system package (sudo apt install tesseract-ocr)
"""

import io
import os
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
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
    import easyocr
    EASYOCR_OK = True
except ImportError:
    EASYOCR_OK = False

try:
    from pypdf import PdfReader
    PYPDF_OK = True
except ImportError:
    try:
        from PyPDF2 import PdfReader
        PYPDF_OK = True
    except ImportError:
        PYPDF_OK = False

EASYOCR_READER = None

def get_easyocr_reader():
    global EASYOCR_READER
    if EASYOCR_READER is None:
        if not EASYOCR_OK:
            raise ImportError("easyocr is not installed.")
        EASYOCR_READER = easyocr.Reader(['en', 'hi'], gpu=False)
    return EASYOCR_READER


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

    # Try EasyOCR first (Primary Production OCR)
    if EASYOCR_OK:
        try:
            reader = get_easyocr_reader()
            img = Image.open(io.BytesIO(file_bytes))
            results = reader.readtext(img, detail=0)
            text = "\n".join(results)
            text = _clean_extracted_text(text)
            if len(text.strip()) >= 30:
                return True, text
        except Exception as e:
            # Fall through if easyocr fails
            pass

    # Fallback to Tesseract OCR
    if TESS_OK:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img = _preprocess_image(img)
            try:
                text = pytesseract.image_to_string(img, lang="eng+hin",
                                                   config="--psm 6 --oem 3")
            except Exception:
                text = pytesseract.image_to_string(img, lang="eng",
                                                   config="--psm 6 --oem 3")
            text = _clean_extracted_text(text)
            if len(text.strip()) >= 30:
                return True, text
        except Exception as e:
            return False, f"Image processing fallback error: {str(e)}"

    return False, "No active OCR engine could extract text. Please copy-paste text manually."


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
    if not PIL_OK:
        return False, "Pillow not installed. Scanned PDF processing requires Pillow."

    # Try EasyOCR first
    if EASYOCR_OK:
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, dpi=150)
            reader = get_easyocr_reader()
            full_text = ""
            for img in images[:6]:  # max 6 pages
                results = reader.readtext(img, detail=0)
                full_text += "\n".join(results) + "\n"
            full_text = _clean_extracted_text(full_text)
            if len(full_text.strip()) >= 50:
                return True, full_text
        except Exception as e:
            # Fall through if easyocr fails
            pass

    # Tesseract Fallback
    if TESS_OK:
        try:
            from pdf2image import convert_from_bytes
            images = convert_from_bytes(file_bytes, dpi=150)
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
            if len(full_text.strip()) >= 50:
                return True, full_text
        except Exception as e:
            return False, f"PDF OCR processing fallback error: {str(e)}"

    return False, "Failed to extract text from scanned PDF. Try copying it manually."


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

if __name__ == "__main__":
    import sys
    import json
    try:
        if len(sys.argv) < 2:
            sys.stderr.write("Usage: python resume_scanner.py <file_path>\n")
            sys.exit(1)
        file_path = sys.argv[1]
        
        with open(file_path, "rb") as f:
            class MockFile:
                def __init__(self, name, data):
                    self.name = name
                    self.data = data
                def read(self):
                    return self.data
            
            uploaded_file = MockFile(os.path.basename(file_path), f.read())
            success, text = scan_resume_file(uploaded_file)
            
            if success:
                print(json.dumps({"success": True, "text": text}))
            else:
                print(json.dumps({"success": False, "error": text}))
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)