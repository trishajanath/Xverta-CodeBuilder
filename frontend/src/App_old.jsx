import React, { useState } from 'react'
import './App.css'
import CodeEditor from './components/CodeEditor'
import CodePreview from './components/CodePreview'
import PromptInput from './components/PromptInput'

function App() {
  const [code, setCode] = useState('// Your code will appear here')
  const [language, setLanguage] = useState('javascript')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCodeGeneration = async (prompt, selectedLanguage) => {
    setIsLoading(true)
    setError('')
    setLanguage(selectedLanguage)
    
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('language', selectedLanguage)
      
      const response = await fetch('http://localhost:8000/generate-code', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API quota exceeded. Please try again later.')
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setCode(data.code)
    } catch (err) {
      setError(err.message)
      console.error('Error generating code:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Xverta Code Builder</h1>
        
        <PromptInput onGenerate={handleCodeGeneration} isLoading={isLoading} />
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="h-[70vh]">
            <CodeEditor code={code} language={language} onChange={setCode} />
          </div>
          <div className="h-[70vh] bg-white rounded-md border border-gray-200 overflow-hidden">
            <CodePreview code={code} language={language} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App