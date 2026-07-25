# Local Setup & Verification

This guide helps configure and run the VidyGuideAI environment locally.

---

## 1. Setup Environment

### Clone & Create Virtual Environment
```bash
git clone https://github.com/sanginenivamshi21-hub/VidyGuideAI.git
cd VidyGuideAI
python3 -m venv .venv
source .venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

---

## 2. Running Services

### Start the FastAPI Backend
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
Verify the API is active by checking the health endpoint: `curl http://127.0.0.1:8000/`.

### Start the Streamlit Frontend
In a new terminal window:
```bash
streamlit run app.py --server.port 8501 --server.address 127.0.0.1
```
Open [http://127.0.0.1:8501](http://127.0.0.1:8501) in your browser.

---

## 3. Local Port Verification Checklist
* Port `8000` (FastAPI) must be available. Check usage: `lsof -i :8000`.
* Port `8501` (Streamlit) must be available. Check usage: `lsof -i :8501`.
