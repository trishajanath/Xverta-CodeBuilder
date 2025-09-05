from fastapi import FastAPI, WebSocket, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure Gemini once at startup (expects GOOGLE_API_KEY in .env)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-code")
async def generate_code_api(prompt: str = Form(...), language: str = Form("python")):
    """
    Generate code from Gemini 2.5 Pro
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-pro")
        response = model.generate_content(
            f"Generate only {language} code. Do not add explanations.\n\nUser request:\n{prompt}"
        )
        return {"code": response.text}
    except ResourceExhausted:
        raise HTTPException(
            status_code=429, detail="API quota exceeded. Please try again later."
        )
    except GoogleAPIError as e:
        raise HTTPException(status_code=500, detail=f"Google API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating code: {str(e)}")


@app.websocket("/ws/generate-code")
async def websocket_generate_code(ws: WebSocket):
    """
    Stream code generation from Gemini 2.5 Pro
    """
    await ws.accept()
    try:
        model = genai.GenerativeModel("gemini-2.5-pro")
        data = await ws.receive_json()
        prompt = data.get("prompt", "")
        language = data.get("language", "python")

        stream = model.generate_content(
            f"Generate only {language} code. Do not add explanations.\n\nUser request:\n{prompt}",
            stream=True,
        )

        for chunk in stream:
            if chunk.text:
                await ws.send_text(chunk.text)
        await ws.send_text("[END]")
    except ResourceExhausted:
        await ws.send_text("[ERROR] API quota exceeded. Please try again later.")
    except GoogleAPIError as e:
        await ws.send_text(f"[ERROR] Google API error: {str(e)}")
    except Exception as e:
        await ws.send_text(f"[ERROR] Unexpected error: {str(e)}")
    finally:
        await ws.close()
