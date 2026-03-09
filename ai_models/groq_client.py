import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def chat_groq(prompt: str, system: str = "You are a helpful career assistant.", model: str = "llama3-8b-8192") -> str:
    """Send a prompt to Groq (fast LLaMA inference) and return the text response."""
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    return response.choices[0].message.content.strip()

