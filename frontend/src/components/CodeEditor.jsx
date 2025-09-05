import React from 'react'
import Editor from '@monaco-editor/react'

function CodeEditor({ code, language, onChange }) {
  // Convert language format for Monaco editor
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      javascript: 'javascript',
      html: 'html',
      css: 'css',
      python: 'python',
      react: 'javascript', // React is JSX, but Monaco treats it as javascript
    }
    return languageMap[lang] || 'javascript'
  }

  return (
    <div className="h-full w-full overflow-hidden border border-gray-300 rounded-md">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  )
}

export default CodeEditor