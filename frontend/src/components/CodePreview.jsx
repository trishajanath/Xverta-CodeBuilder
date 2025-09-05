import React, { useEffect, useState } from 'react'

function CodePreview({ code, language }) {
  const [html, setHtml] = useState('')
  
  useEffect(() => {
    if (!code) return
    
    // Handle different types of code for preview
    if (language === 'html') {
      setHtml(code)
    } else if (language === 'javascript') {
      setHtml(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>body { font-family: sans-serif; padding: 20px; }</style>
          </head>
          <body>
            <div id="output"></div>
            <script>
              try {
                // Wrapping in IIFE to avoid global scope pollution
                (function() {
                  ${code}
                })();
              } catch (error) {
                document.getElementById('output').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
              }
            </script>
          </body>
        </html>
      `)
    } else if (language === 'react') {
      setHtml(`
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>body { font-family: sans-serif; padding: 20px; }</style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              try {
                ${code}
                
                // Find component/function to render
                const rootComponent = (() => {
                  const exports = {};
                  const defaultExport = (comp) => { exports.default = comp; };
                  
                  // Execute the code to extract components
                  new Function('React', 'export default', 'exports', code)(React, defaultExport, exports);
                  
                  // Look for App, default export, or any capital-named function
                  return exports.default || exports.App || 
                    Object.values(exports).find(x => typeof x === 'function') ||
                    window.App || 
                    (() => <div>Component not found to render</div>);
                })();
                
                ReactDOM.createRoot(document.getElementById('root')).render(<rootComponent />);
              } catch (error) {
                document.getElementById('root').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
              }
            </script>
          </body>
        </html>
      `)
    } else {
      // For Python and other non-browser languages, just display the code
      setHtml(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: monospace; padding: 20px; background: #f5f5f5; }
              pre { background: #fff; padding: 15px; border-radius: 4px; overflow: auto; }
            </style>
          </head>
          <body>
            <h3>Preview not available for ${language}</h3>
            <pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `)
    }
  }, [code, language])

  return (
    <div className="h-full w-full bg-white">
      <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
        <span className="text-sm font-medium">Preview</span>
        <span className="text-xs px-2 py-1 bg-gray-200 rounded-md">{language}</span>
      </div>
      <iframe
        title="code-preview"
        srcDoc={html}
        sandbox="allow-scripts allow-modals"
        className="w-full h-[calc(100%-34px)]"
        style={{ border: 'none' }}
      />
    </div>
  )
}

export default CodePreview