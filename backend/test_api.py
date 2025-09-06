"""
Test script to verify Gemini API key and check quota status
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError

# Load environment variables
load_dotenv()

def test_api_key():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_API_KEY environment variable not set.")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Test with a simple prompt
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content("Say 'Hello, API is working!'")
        
        print("✅ API Test Successful!")
        print(f"Response: {response.text}")
        return True
        
    except ResourceExhausted as e:
        print(f"❌ Rate Limit/Quota Error: {e}")
        print("This means your API key is valid but you've exceeded quota limits.")
        return False
        
    except GoogleAPIError as e:
        print(f"❌ Google API Error: {e}")
        if "API_KEY_INVALID" in str(e):
            print("Your API key appears to be invalid.")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Gemini API Configuration...")
    test_api_key()
