import React, { useState } from 'react'

function PromptBar({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('')
  const [framework, setFramework] = useState('react')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt, { framework })
    }
  }

  const quickPrompts = [
    "Create a modern landing page for a tech startup",
    "Build a todo app with drag and drop functionality",
    "Design a portfolio website with dark mode",
    "Make a dashboard with charts and analytics",
    "Create a blog homepage with article cards"
  ]

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt)
    if (!isLoading) {
      onGenerate(quickPrompt, { framework })
    }
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-6">
      {/* Main Prompt Bar */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the app you want to build... (e.g., 'Create a modern e-commerce homepage')"
              className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="px-3 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="vanilla">Vanilla JS</option>
            <option value="html">HTML/CSS</option>
          </select>
          
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !prompt.trim() || isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
            }`}
          >
            {isLoading ? 'Generating...' : '✨ Generate'}
          </button>
        </div>
      </form>
      
      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-400 mr-2">Quick ideas:</span>
        {quickPrompts.map((quickPrompt, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(quickPrompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quickPrompt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PromptBar
