import React, { useState, useCallback } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import PromptBar from './components/PromptBar'
import LoadingAnimation from './components/LoadingAnimation'

function App() {
  const [generatedHTML, setGeneratedHTML] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(true)

  const handleGenerate = useCallback(async (prompt, options = {}) => {
    setIsGenerating(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8000/generate-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          app_type: options.app_type || 'web',
          framework: options.framework || 'react'
        })
      })
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API quota exceeded. Please try again later.')
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setGeneratedHTML(data.html)
    } catch (err) {
      setError(err.message)
      console.error('Error generating app:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Xverta Builder
          </h1>
          <span className="text-sm text-gray-400">AI-Powered No-Code Platform</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowEditor(!showEditor)}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            {showEditor ? 'Hide Code' : 'Show Code'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Project Structure (Future Enhancement) */}
        <Sidebar />
        
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Prompt Bar */}
          <PromptBar 
            onGenerate={handleGenerate} 
            isLoading={isGenerating} 
          />
          
          {/* Error Display */}
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-900/20 border border-red-500/20 text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          {/* Loading Animation */}
          {isGenerating && <LoadingAnimation />}
          
          {/* Editor and Preview */}
          <div className="flex-1 flex overflow-hidden">
            {showEditor && (
              <div className="w-1/2 border-r border-gray-700">
                <Editor 
                  code={generatedHTML} 
                  onChange={setGeneratedHTML}
                  language="html"
                />
              </div>
            )}
            
            <div className={`${showEditor ? 'w-1/2' : 'w-full'} flex flex-col`}>
              <Preview html={generatedHTML} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
