import React, { useState } from 'react';
import axios from 'axios';
import Editor from './Editor';
import './CodeBuilder.css';

function CodeBuilder() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('// Your generated code will appear here');
  const [language, setLanguage] = useState('python');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('language', language);

      const response = await axios.post('http://localhost:8000/generate-code', formData);
      
      if (response.data.code) {
        setCode(response.data.code);
      }
    } catch (err) {
      console.error('Error:', err);
      
      if (err.response && err.response.status === 429) {
        setError('API quota exceeded. Please try again later.');
      } else {
        setError(`Error: ${err.message || 'Failed to generate code'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const languageOptions = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];

  return (
    <div className="code-builder">
      <h1>Xverta Code Builder</h1>
      
      <div className="control-panel">
        <div className="prompt-container">
          <label htmlFor="prompt">Describe the code you want to generate:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Write a function to calculate fibonacci numbers"
            rows={4}
          />
        </div>
        
        <div className="options">
          <div className="language-selector">
            <label htmlFor="language">Language:</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleGenerateCode}
            disabled={isLoading || !prompt.trim()}
            className="generate-btn"
          >
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="editor-section">
        <Editor 
          code={code} 
          language={language} 
          onChange={setCode} 
        />
      </div>
    </div>
  );
}

export default CodeBuilder;
