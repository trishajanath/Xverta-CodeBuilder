import React, { useEffect, useState } from 'react'

function Preview({ html }) {
  const [iframeKey, setIframeKey] = useState(0)

  // Refresh iframe when HTML changes
  useEffect(() => {
    if (html) {
      setIframeKey(prev => prev + 1)
    }
  }, [html])

  const defaultHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .welcome-container {
            text-align: center;
            max-width: 500px;
          }
          .welcome-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .welcome-subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
          }
          .feature-list {
            text-align: left;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 2rem;
            margin-top: 2rem;
          }
          .feature-item {
            margin: 0.8rem 0;
            font-size: 1rem;
          }
          .sparkle {
            animation: sparkle 2s infinite;
          }
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
        </style>
      </head>
      <body>
        <div class="welcome-container">
          <h1 class="welcome-title">
            ✨ Xverta Builder
          </h1>
          <p class="welcome-subtitle">
            Your AI-powered no-code platform is ready!
          </p>
          <div class="feature-list">
            <div class="feature-item">🚀 Type your idea in the prompt bar above</div>
            <div class="feature-item">🎨 Watch as AI creates beautiful applications</div>
            <div class="feature-item">⚡ See live previews instantly</div>
            <div class="feature-item">🔧 Edit code with Monaco Editor</div>
            <div class="feature-item">📱 Responsive design by default</div>
          </div>
        </div>
      </body>
    </html>
  `

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Preview Header */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Live Preview</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIframeKey(prev => prev + 1)}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 relative">
        <iframe
          key={iframeKey}
          title="preview"
          srcDoc={html || defaultHTML}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-forms allow-same-origin"
        />
      </div>
    </div>
  )
}

export default Preview
