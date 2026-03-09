import os
import requests

HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HF_API_URL = "https://api-inference.huggingface.co/models"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

def query_hf_model(prompt: str, model: str = "mistralai/Mistral-7B-Instruct-v0.2") -> str:
    """Query a HuggingFace Inference API model and return the response text."""
    url = f"{HF_API_URL}/{model}"
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 512, "temperature": 0.7, "return_full_text": False}
    }
    response = requests.post(url, headers=HEADERS, json=payload, timeout=60)
    response.raise_for_status()
    result = response.json()
    if isinstance(result, list) and "generated_text" in result[0]:
        return result[0]["generated_text"].strip()
    return str(result)

def embed_text_hf(text: str, model: str = "sentence-transformers/all-MiniLM-L6-v2") -> list:
    """Get text embeddings from a HuggingFace sentence-transformer model."""
    url = f"{HF_API_URL}/{model}"
    payload = {"inputs": text}
    response = requests.post(url, headers=HEADERS, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()

