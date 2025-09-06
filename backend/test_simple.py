"""
Simple test to check if Gemini model is working
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

def test_simple_generation():
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    
    generation_config = {
        "temperature": 0.9,
        "top_p": 1.0,
        "top_k": 1,
        "max_output_tokens": 2048,
    }
    
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
    ]
    
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        simple_prompt = "Generate a simple React todo app file structure as JSON array. Example: ['package.json', 'src/App.jsx']"
        
        print("Testing with simple prompt...")
        response = model.generate_content(simple_prompt)
        
        print(f"Response object: {response}")
        print(f"Has text attribute: {hasattr(response, 'text')}")
        
        if hasattr(response, 'candidates'):
            print(f"Number of candidates: {len(response.candidates)}")
            if response.candidates:
                candidate = response.candidates[0]
                print(f"Finish reason: {candidate.finish_reason}")
                if hasattr(candidate, 'content'):
                    print(f"Has content: {candidate.content}")
                    if hasattr(candidate.content, 'parts'):
                        print(f"Number of parts: {len(candidate.content.parts)}")
                        if candidate.content.parts:
                            print(f"First part text: {candidate.content.parts[0].text}")
        
        try:
            text = response.text
            print(f"Response text: {text}")
        except Exception as e:
            print(f"Error getting text: {e}")
            
            # Try alternative method
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    if hasattr(candidate.content, 'parts') and candidate.content.parts:
                        alt_text = candidate.content.parts[0].text
                        print(f"Alternative text extraction: {alt_text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_simple_generation()
