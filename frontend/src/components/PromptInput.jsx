import React, { useState } from 'react'

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'html', label: 'HTML' },
  { value: 'react', label: 'React' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
]

function PromptInput({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState('javascript')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt, language)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Describe what code you want to generate
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., Create a React counter with increment and decrement buttons"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-auto">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${isLoading || !prompt.trim() 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
        >
          {isLoading ? 'Generating...' : 'Generate Code'}
        </button>
      </div>
    </form>
  )
}

export default PromptInput