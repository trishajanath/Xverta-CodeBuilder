"""
Test with different Gemini models to find one that works
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError

load_dotenv()

def test_different_models():
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    
    models_to_try = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b", 
        "gemini-1.0-pro",
        "gemini-pro"
    ]
    
    for model_name in models_to_try:
        try:
            print(f"\n🧪 Testing {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say 'Hello from " + model_name + "'")
            print(f"✅ {model_name} WORKS!")
            print(f"Response: {response.text}")
            return model_name
        except ResourceExhausted as e:
            print(f"❌ {model_name}: Quota exceeded")
        except Exception as e:
            print(f"❌ {model_name}: {str(e)}")
    
    return None

if __name__ == "__main__":
    working_model = test_different_models()
    if working_model:
        print(f"\n🎉 Use this model: {working_model}")
    else:
        print("\n💀 All models are hitting quota limits")
