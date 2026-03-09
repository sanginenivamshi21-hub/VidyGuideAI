import os
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("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"))

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
