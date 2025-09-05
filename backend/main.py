from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
import time
import hashlib
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError
from dotenv import load_dotenv
from typing import Optional, Dict

# Load environment variables from .env
load_dotenv()

# Configure Gemini once at startup (expects GOOGLE_API_KEY in .env)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

# Simple in-memory cache
response_cache: Dict[str, dict] = {}
last_request_time = 0
MIN_REQUEST_INTERVAL = 10  # seconds between requests

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    app_type: str = "web"  # web, mobile, api, etc.
    framework: str = "react"  # react, vue, vanilla, etc.

def create_cache_key(prompt: str, framework: str) -> str:
    """Create a unique cache key for the request"""
    content = f"{prompt}_{framework}".lower()
    return hashlib.md5(content.encode()).hexdigest()

def get_fallback_response(prompt: str, framework: str) -> str:
    """Generate a fallback response when API is unavailable"""
    
    # Landing page fallback
    landing_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; line-height: 1.6; }}
        .hero {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }}
        .hero h1 {{ font-size: 3rem; margin-bottom: 1rem; }}
        .hero p {{ font-size: 1.2rem; margin-bottom: 2rem; }}
        .btn {{ background: #ff6b6b; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; }}
        .btn:hover {{ background: #ee5a5a; }}
        .features {{ padding: 80px 20px; text-align: center; }}
        .feature {{ display: inline-block; width: 300px; margin: 20px; }}
    </style>
</head>
<body>
    <section class="hero">
        <h1>Welcome to Our Product</h1>
        <p>The best solution for your business needs</p>
        <button class="btn" onclick="alert('Get started clicked!')">Get Started</button>
    </section>
    <section class="features">
        <div class="feature">
            <h3>🚀 Fast</h3>
            <p>Lightning fast performance</p>
        </div>
        <div class="feature">
            <h3>🔒 Secure</h3>
            <p>Bank-level security</p>
        </div>
        <div class="feature">
            <h3>📱 Responsive</h3>
            <p>Works on all devices</p>
        </div>
    </section>
</body>
</html>'''

    # Dashboard fallback
    dashboard_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; background: #f5f5f5; }}
        .dashboard {{ display: flex; min-height: 100vh; }}
        .sidebar {{ width: 250px; background: #2d3748; color: white; padding: 20px; }}
        .main {{ flex: 1; padding: 20px; }}
        .card {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }}
        .stat {{ background: linear-gradient(45deg, #4299e1, #3182ce); color: white; padding: 20px; border-radius: 8px; }}
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="sidebar">
            <h2>Dashboard</h2>
            <ul style="list-style: none; margin-top: 20px;">
                <li style="padding: 10px 0;">📊 Analytics</li>
                <li style="padding: 10px 0;">👥 Users</li>
                <li style="padding: 10px 0;">⚙️ Settings</li>
            </ul>
        </div>
        <div class="main">
            <h1>Analytics Overview</h1>
            <div class="stats">
                <div class="stat">
                    <h3>Total Users</h3>
                    <p style="font-size: 2rem;">1,234</p>
                </div>
                <div class="stat">
                    <h3>Revenue</h3>
                    <p style="font-size: 2rem;">$12,345</p>
                </div>
            </div>
            <div class="card">
                <h3>Recent Activity</h3>
                <p>Here would be your recent activity data...</p>
            </div>
        </div>
    </div>
</body>
</html>'''

    # Todo app fallback
    todo_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; background: #f0f2f5; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
        .todo-form {{ padding: 20px; border-bottom: 1px solid #eee; }}
        .todo-input {{ width: 70%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }}
        .add-btn {{ width: 25%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5%; }}
        .todo-list {{ padding: 20px; }}
        .todo-item {{ padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }}
        .delete-btn {{ background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Todo App</h1>
            <p>Stay organized and productive!</p>
        </div>
        <div class="todo-form">
            <input type="text" class="todo-input" id="todoInput" placeholder="Add a new task..." />
            <button class="add-btn" onclick="addTodo()">Add Task</button>
        </div>
        <div class="todo-list" id="todoList">
            <div class="todo-item">
                <span>✅ Example completed task</span>
                <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
            </div>
            <div class="todo-item">
                <span>📋 Example pending task</span>
                <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
            </div>
        </div>
    </div>
    
    <script>
        function addTodo() {{
            const input = document.getElementById('todoInput');
            const todoList = document.getElementById('todoList');
            
            if (input.value.trim() !== '') {{
                const todoItem = document.createElement('div');
                todoItem.className = 'todo-item';
                todoItem.innerHTML = `
                    <span>📋 ${{input.value}}</span>
                    <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
                `;
                todoList.appendChild(todoItem);
                input.value = '';
            }}
        }}
        
        document.getElementById('todoInput').addEventListener('keypress', function(e) {{
            if (e.key === 'Enter') {{
                addTodo();
            }}
        }});
    </script>
</body>
</html>'''

    # Default fallback template
    default_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo App</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Arial', sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; }}
        .container {{ max-width: 800px; margin: 0 auto; text-align: center; }}
        h1 {{ font-size: 2.5rem; margin-bottom: 1rem; }}
        p {{ font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; }}
        .demo-content {{ background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); }}
        .btn {{ background: #ff6b6b; color: white; padding: 12px 30px; border: none; border-radius: 25px; cursor: pointer; font-size: 1rem; margin: 10px; }}
        .btn:hover {{ background: #ee5a5a; transform: translateY(-2px); transition: all 0.3s; }}
        .prompt-display {{ background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Demo Application</h1>
        <p>This is a fallback demo while our AI is taking a break!</p>
        <div class="demo-content">
            <div class="prompt-display">
                <h3>Your request:</h3>
                <p>"{prompt_text}"</p>
                <small>Framework: {framework_text}</small>
            </div>
            <button class="btn" onclick="showAlert()">Try Feature</button>
            <button class="btn" onclick="changeTheme()">Change Theme</button>
            <button class="btn" onclick="showInfo()">About</button>
        </div>
    </div>
    
    <script>
        function showAlert() {{
            alert('🎉 This is a demo feature! The AI will generate more advanced functionality when available.');
        }}
        
        function changeTheme() {{
            const themes = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                'linear-gradient(135deg, #48cae4 0%, #023e8a 100%)',
                'linear-gradient(135deg, #06ffa5 0%, #3d8bff 100%)'
            ];
            document.body.style.background = themes[Math.floor(Math.random() * themes.length)];
        }}
        
        function showInfo() {{
            alert('💡 This fallback app demonstrates basic functionality while conserving AI API quota. Try again later for AI-generated content!');
        }}
    </script>
</body>
</html>'''

    # Determine which template to use based on prompt keywords
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['todo', 'task', 'checklist']):
        return todo_template
    elif any(word in prompt_lower for word in ['landing', 'homepage', 'hero', 'saas', 'marketing']):
        return landing_template
    elif any(word in prompt_lower for word in ['dashboard', 'admin', 'analytics', 'stats']):
        return dashboard_template
    else:
        return default_template.replace("{prompt_text}", prompt).replace("{framework_text}", framework)

@app.post("/generate-app")
async def generate_app_api(request: GenerateRequest):
    """
    Generate a complete web application from a prompt with caching and fallbacks
    """
    global last_request_time
    
    # Create cache key
    cache_key = create_cache_key(request.prompt, request.framework)
    
    # Check cache first
    if cache_key in response_cache:
        cached_response = response_cache[cache_key]
        cached_response["message"] = "Retrieved from cache (API quota conservation)"
        return cached_response
    
    # Rate limiting
    current_time = time.time()
    if current_time - last_request_time < MIN_REQUEST_INTERVAL:
        # Return fallback response if too soon
        fallback_html = get_fallback_response(request.prompt, request.framework)
        response = {
            "html": fallback_html,
            "success": True,
            "message": "Fallback response due to rate limiting (API quota conservation)"
        }
        response_cache[cache_key] = response
        return response
    
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        
        # Enhanced prompt for better app generation
        enhanced_prompt = f"""
        Create a complete web application based on this request: {request.prompt}
        
        Requirements:
        1. Generate ONLY the HTML code with inline CSS and JavaScript
        2. Make it fully functional and interactive
        3. Use modern CSS (flexbox, grid) for responsive design
        4. Include proper error handling
        5. Add hover effects and smooth animations
        6. Make it visually appealing with proper colors and spacing
        7. Ensure all functionality works without external dependencies
        8. Convert any framework-specific code to vanilla HTML/CSS/JS
        
        Return ONLY the complete HTML code, nothing else.
        """
        
        response = model.generate_content(enhanced_prompt)
        last_request_time = current_time
        
        # Clean the response to ensure it's valid HTML
        html_code = response.text.strip()
        if html_code.startswith('```html'):
            html_code = html_code[7:]
        if html_code.startswith('```'):
            html_code = html_code[3:]
        if html_code.endswith('```'):
            html_code = html_code[:-3]
            
        api_response = {
            "html": html_code,
            "success": True,
            "message": "Application generated successfully by AI"
        }
        
        # Cache the response
        response_cache[cache_key] = api_response
        return api_response
        
    except ResourceExhausted:
        # Return fallback when quota exceeded
        fallback_html = get_fallback_response(request.prompt, request.framework)
        response = {
            "html": fallback_html,
            "success": True,
            "message": "API quota exceeded - showing demo version. Try again in a few minutes for AI generation."
        }
        response_cache[cache_key] = response
        return response
        
    except GoogleAPIError as e:
        fallback_html = get_fallback_response(request.prompt, request.framework)
        response = {
            "html": fallback_html,
            "success": True,
            "message": f"API temporarily unavailable - showing demo version."
        }
        response_cache[cache_key] = response
        return response
        
    except Exception as e:
        fallback_html = get_fallback_response(request.prompt, request.framework)
        response = {
            "html": fallback_html,
            "success": True,
            "message": f"Unexpected error - showing demo version."
        }
        response_cache[cache_key] = response
        return response

@app.get("/api/status")
async def get_api_status():
    """
    Get API status and cache information
    """
    global last_request_time
    current_time = time.time()
    time_since_last_request = current_time - last_request_time
    can_make_request = time_since_last_request >= MIN_REQUEST_INTERVAL
    
    return {
        "cache_size": len(response_cache),
        "last_request_seconds_ago": int(time_since_last_request),
        "can_make_ai_request": can_make_request,
        "next_request_available_in": max(0, MIN_REQUEST_INTERVAL - time_since_last_request),
        "api_healthy": True
    }

@app.post("/api/clear-cache")
async def clear_cache():
    """
    Clear the response cache
    """
    global response_cache
    cache_size = len(response_cache)
    response_cache = {}
    return {
        "message": f"Cache cleared. Removed {cache_size} entries.",
        "success": True
    }

@app.post("/generate-component")
async def generate_component_api(request: GenerateRequest):
    """
    Generate a specific component or feature for an existing app
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        
        enhanced_prompt = f"""
        Create a {request.framework} component based on this request: {request.prompt}
        
        Requirements:
        1. Generate clean, reusable code
        2. Include proper styling with CSS
        3. Make it responsive and accessible
        4. Add interactive functionality if needed
        5. Return only the component code
        
        Framework: {request.framework}
        """
        
        response = model.generate_content(enhanced_prompt)
        
        return {
            "code": response.text,
            "success": True,
            "framework": request.framework
        }
        
    except ResourceExhausted:
        raise HTTPException(
            status_code=429,
            detail="API quota exceeded. Please try again later."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.websocket("/ws/generate-stream")
async def websocket_generate_stream(ws: WebSocket):
    """
    Stream application generation in real-time
    """
    await ws.accept()
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        data = await ws.receive_json()
        prompt = data.get("prompt", "")
        app_type = data.get("app_type", "web")
        framework = data.get("framework", "react")

        enhanced_prompt = f"""
        Create a complete {framework} web application based on this request: {prompt}
        
        Requirements:
        1. Generate ONLY the HTML code with inline CSS and JavaScript
        2. Make it fully functional and interactive
        3. Use modern CSS for responsive design
        4. Include proper error handling
        5. Make it visually appealing
        6. Ensure all functionality works without external dependencies
        
        Return ONLY the complete HTML code.
        """

        stream = model.generate_content(enhanced_prompt, stream=True)

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