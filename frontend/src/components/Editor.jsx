import React from 'react'
import MonacoEditor from '@monaco-editor/react'

function Editor({ code, onChange, language = 'html' }) {
  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Editor Header */}
      <div className="px-4 py-2 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">Code Editor</span>
          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
            Format
          </button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            glyphMargin: false,
            contextmenu: false,
          }}
        />
      </div>
    </div>
  )
}

export default Editor
