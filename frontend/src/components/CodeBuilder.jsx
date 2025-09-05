import React, { useState } from 'react';
import axios from 'axios';
import CodeEditor from './CodeEditor';
import CodePreview from './CodePreview';
import PromptInput from './PromptInput';

function CodeBuilder() {
  const [code, setCode] = useState('// Your generated code will appear here');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (prompt, selectedLanguage) => {
    setIsLoading(true);
    setError('');
    setLanguage(selectedLanguage);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('language', selectedLanguage);

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

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Xverta Code Builder</h1>
        <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-280px)]">
        <div className="h-full">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Editor</h2>
          <CodeEditor 
            code={code} 
            language={language} 
            onChange={setCode} 
          />
        </div>
        <div className="h-full">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview</h2>
          <CodePreview 
            code={code} 
            language={language} 
          />
        </div>
      </div>
    </div>
  );
}

export default CodeBuilder;
