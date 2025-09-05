import google.generativeai as genai
import os

# Load API key (note: must be GOOGLE_API_KEY now)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_code(prompt: str, language: str = "python", model_name: str = "gemini-2.5-pro") -> str:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(
        f"Generate {language} code only. Do not add explanations.\n\nUser request:\n{prompt}"
    )
    return response.text


