# Enhanced No-Code Platform (Lovable-style)

A sophisticated no-code platform that generates full-stack applications using AI, similar to Lovable. Features include real-time code generation, interactive editing, and an Application Definition Object (ADO) system for structured app development.

## 🚀 Key Features

### Core Architecture
- **Application Definition Object (ADO)**: Structured JSON schema that AI targets for consistent generation
- **Multi-component Architecture**: React frontend with Python FastAPI backend
- **Real-time Generation**: WebSocket-based streaming for live code generation
- **Interactive Editor**: Monaco editor with live preview using Sandpack
- **Conversational Modifications**: Chat with AI to modify your generated app

### Enhanced Features
- **Component Library**: Reusable UI components with proper dependency management
- **Error Boundaries**: Robust error handling for preview and generation
- **File Explorer**: Tree-view file navigation with file type icons
- **Live Preview**: Real-time preview with hot reloading
- **Export Functionality**: Download complete projects as ZIP files
- **ADO Inspector**: Visual representation of application structure

## 🏗️ Architecture Overview

```
├── Frontend (React + Vite)
│   ├── Real-time WebSocket connection
│   ├── Monaco Editor for code editing
│   ├── Sandpack for live preview
│   ├── Chat interface for modifications
│   └── ADO inspector for structure visualization
│
├── Backend (FastAPI + Python)
│   ├── ADO Generator Service
│   ├── Enhanced WebSocket handlers
│   ├── Gemini AI integration
│   └── Structured schema validation
│
└── Application Definition Object (ADO)
    ├── Component definitions
    ├── File structure
    ├── Dependencies
    ├── Routes & state
    └── Generation metadata
```

## 📋 Prerequisites

- **Node.js** 18+ 
- **Python** 3.8+
- **Google AI API Key** (Gemini)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Xverta-CodeBuilder
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `backend/.env` file:
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 How to Use

### 1. Generate a New Application

1. Open the platform in your browser
2. Describe your application idea in natural language
3. Select framework (React, Vue, Angular) and styling (Tailwind, Styled Components, etc.)
4. Click "Generate Application"
5. Watch as the AI creates your app in real-time

### 2. Modify Your Application

1. Once generated, click "AI Assistant" to open the chat
2. Describe changes you want to make
3. The AI will modify your code while preserving structure
4. See changes reflected immediately in the preview

### 3. Inspect Application Structure

1. Click on the "Application Definition" panel
2. Explore components, dependencies, and file structure
3. Understand how your application is organized

### 4. Export Your Project

1. Click "Export Project" in the header
2. Download a ZIP file containing all generated code
3. Extract and run locally with standard commands

## 🔧 API Endpoints

### WebSocket Endpoints

- `ws://localhost:8000/ws/generate-stream` - Real-time app generation
- `ws://localhost:8000/ws/chat` - Conversational modifications

### REST Endpoints

- `GET /health` - Health check and API status
- `GET /api/templates` - Available application templates
- `POST /api/generate` - Generate app (non-WebSocket)

## 📊 Application Definition Object (ADO) Schema

The ADO is the core structure that AI targets when generating applications:

```json
{
  "name": "app-name",
  "description": "App description",
  "framework": "react",
  "files": [
    {
      "path": "src/App.jsx",
      "type": "jsx",
      "content": "// React component code",
      "component": "App"
    }
  ],
  "components": [
    {
      "name": "App",
      "type": "functional",
      "file_path": "src/App.jsx",
      "props": [],
      "imports": ["react"],
      "exports": ["default"]
    }
  ],
  "dependencies": [
    {
      "name": "react",
      "version": "^18.2.0",
      "dev": false
    }
  ],
  "style_config": {
    "framework": "tailwindcss",
    "theme": {},
    "custom_css": null
  }
}
```

## 🎨 Supported Frameworks & Technologies

### Frontend Frameworks
- **React** (Primary)
- **Vue.js**
- **Angular**

### Styling Options
- **Tailwind CSS** (Recommended)
- **Styled Components**
- **CSS Modules**
- **Vanilla CSS**

### UI Libraries
- **Lucide React** (Icons)
- **Framer Motion** (Animations)
- **Monaco Editor** (Code editing)
- **Sandpack** (Live preview)

## 🔧 Development

### Project Structure

```
Xverta-CodeBuilder/
├── backend/
│   ├── schemas/
│   │   └── application_definition.py    # ADO schema definitions
│   ├── services/
│   │   ├── ado_generator.py            # Core ADO generation logic
│   │   └── websocket_handler.py        # Enhanced WebSocket handling
│   ├── main.py                         # FastAPI application
│   └── requirements.txt                # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── EnhancedComponents.jsx  # Reusable UI components
│   │   ├── NoCodePlatform.jsx          # Main platform component
│   │   └── main.jsx                    # React entry point
│   └── package.json                    # Node.js dependencies
└── README.md
```

### Adding New Features

1. **Backend**: Add new services in `services/` directory
2. **Frontend**: Add new components in `components/` directory
3. **ADO**: Extend schema in `schemas/application_definition.py`

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if Google API key is set correctly in `.env`
- Ensure all Python dependencies are installed
- Verify Python version is 3.8+

**Frontend won't connect:**
- Ensure backend is running on port 8000
- Check browser console for WebSocket errors
- Verify frontend is running on port 5173

**Generation fails:**
- Check Google AI API quota limits
- Verify API key has proper permissions
- Check backend logs for detailed error messages

**Preview not working:**
- Ensure generated code has proper React structure
- Check browser console for compilation errors
- Try refreshing the preview panel

## 📈 Performance Optimization

### Backend
- Connection pooling for WebSocket management
- Efficient ADO validation and caching
- Rate limiting for API calls

### Frontend
- Code splitting for large applications
- Lazy loading of components
- Optimized bundle size with Vite

## 🔒 Security Considerations

- API key stored securely in environment variables
- Input validation for all user prompts
- Safe code generation practices
- CORS properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Sandpack** for live preview functionality
- **Monaco Editor** for code editing
- **Lovable** for inspiration and architecture ideas

---

Built with ❤️ using React, FastAPI, and Google Gemini AI
