from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import time
import hashlib
import asyncio
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError
from dotenv import load_dotenv
from typing import Dict, Any
from services.websocket_handler import EnhancedWebSocketHandler
from schemas.application_definition import GenerationRequest, GenerationResponse

# Load environment variables from .env
load_dotenv()

# Configure the Gemini API key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Enhanced AI Code Generation API",
    description="An advanced API to generate and modify full project structures using Application Definition Objects (ADO).",
    version="4.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize enhanced WebSocket handler
websocket_handler = EnhancedWebSocketHandler(api_key)

@app.websocket("/ws/generate-stream")
async def websocket_generate_stream(ws: WebSocket):
    """Enhanced real-time streaming experience for project generation using ADO."""
    await websocket_handler.handle_generate_stream(ws)

@app.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket):
    """Enhanced conversational AI chat for modifying projects using ADO."""
    await websocket_handler.handle_chat(ws)

@app.get("/health")
async def health_check():
    """Health check endpoint to verify API key and quota status."""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        generation_config = {
            "temperature": 0.1,
            "max_output_tokens": 100,
        }
        response = model.generate_content("Say 'API is working'", generation_config=generation_config)
        return {
            "status": "healthy",
            "api_key_status": "valid",
            "quota_status": "available",
            "model": "gemini-2.5-flash",
            "message": response.text if hasattr(response, 'text') else "API working",
            "features": {
                "ado_support": True,
                "real_time_generation": True,
                "conversational_modification": True,
                "enhanced_error_handling": True
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "api_key_status": "unknown",
            "quota_status": "unknown",
            "model": "gemini-2.5-flash",
            "message": str(e),
            "features": {
                "ado_support": False,
                "real_time_generation": False,
                "conversational_modification": False,
                "enhanced_error_handling": False
            }
        }

@app.get("/api/templates")
async def get_templates():
    """Get available application templates"""
    templates = [
        {
            "id": "todo-app",
            "name": "Todo Application",
            "description": "A modern todo app with categories, due dates, and local storage",
            "tags": ["productivity", "react", "localStorage"]
        },
        {
            "id": "ecommerce-catalog",
            "name": "E-commerce Catalog",
            "description": "Product catalog with filtering, search, and shopping cart",
            "tags": ["ecommerce", "react", "shopping"]
        },
        {
            "id": "blog-platform",
            "name": "Blog Platform",
            "description": "Personal blog with markdown support and responsive design",
            "tags": ["blog", "markdown", "cms"]
        },
        {
            "id": "weather-dashboard",
            "name": "Weather Dashboard",
            "description": "Weather dashboard with multiple cities and forecasts",
            "tags": ["weather", "api", "dashboard"]
        },
        {
            "id": "portfolio-site",
            "name": "Portfolio Website",
            "description": "Personal portfolio with project showcase and contact form",
            "tags": ["portfolio", "showcase", "professional"]
        }
    ]
    return {"templates": templates}

@app.post("/api/generate")
async def generate_application(request: GenerationRequest):
    """Generate application using ADO (for non-WebSocket clients)"""
    try:
        from services.ado_generator import ADOGenerator
        generator = ADOGenerator(api_key)
        
        # Generate ADO
        ado = await generator.generate_ado_from_prompt(request)
        
        # Generate files
        files = await generator.generate_files_from_ado(ado)
        
        return GenerationResponse(
            success=True,
            ado=ado,
            files=files
        )
        
    except Exception as e:
        return GenerationResponse(
            success=False,
            errors=[str(e)]
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
