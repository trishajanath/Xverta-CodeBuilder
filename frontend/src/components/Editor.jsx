import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function Editor({ code, language, onChange }) {
  return (
    <div className="editor-container">
      <MonacoEditor
        height="70vh"
        language={language}
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
  );
}

export default Editor;
