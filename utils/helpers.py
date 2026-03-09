import os
import time
import functools


def load_prompt(filename: str, **kwargs) -> str:
    """
    Load a prompt template from the /prompts directory and fill in variables.
    
    Usage:
        prompt = load_prompt("career_prompt.txt", skills="Python", interests="AI", education="B.Tech")
    """
    prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
    filepath = os.path.join(prompts_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        template = f.read()
    if kwargs:
        template = template.format(**kwargs)
    return template


def retry(times: int = 3, delay: float = 1.0, exceptions=(Exception,)):
    """
    Decorator to retry a function on failure.
    
    Usage:
        @retry(times=3, delay=1.0)
        def call_api(): ...
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_error = e
                    if attempt < times - 1:
                        time.sleep(delay)
            raise last_error
        return wrapper
    return decorator


def truncate(text: str, max_chars: int = 300, suffix: str = "...") -> str:
    """Truncate text to max_chars, appending suffix if truncated."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars - len(suffix)] + suffix


def format_salary(salary_str: str) -> str:
    """Normalize salary string display."""
    return salary_str.strip().replace("LPA", "Lakhs Per Annum")


def build_profile_summary(skills: str, interests: str, education: str) -> str:
    """Combine user inputs into a single profile string for embedding/search."""
    parts = []
    if skills:
        parts.append(f"Skills: {skills}")
    if interests:
        parts.append(f"Interests: {interests}")
    if education:
        parts.append(f"Education: {education}")
    return " | ".join(parts)

