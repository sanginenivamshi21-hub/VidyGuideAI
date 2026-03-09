import os
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def chat_claude(prompt: str, system: str = "You are a helpful career assistant.", model: str = "claude-opus-4-5") -> str:
    """Send a prompt to Claude (Anthropic) and return the text response."""
    message = client.messages.create(
        model=model,
        max_tokens=1500,
        system=system,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return message.content[0].text.strip()
