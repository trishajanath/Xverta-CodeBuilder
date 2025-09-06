import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MonacoEditor from '@monaco-editor/react';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview, 
  SandpackFileExplorer,
  SandpackCodeEditor 
} from '@codesandbox/sandpack-react';
import { 
  Download, Sparkles, Code, Database, Server, Eye, Layers, Folder, File, 
  ChevronRight, MessageSquare, Settings, RefreshCw, CheckCircle, AlertTriangle
} from 'lucide-react';
import JSZip from 'jszip';

// Enhanced Error Boundary with better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-red-800 font-medium">Preview Error</h3>
          </div>
          <p className="text-red-600 text-sm mb-2">
            {this.state.error?.message || 'Something went wrong with the preview'}
          </p>
          {this.state.errorInfo && (
            <details className="text-xs text-red-500 mb-2">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-1 p-2 bg-red-100 rounded overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry Preview
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ADO Inspector Component
const ADOInspector = ({ ado, onUpdateAdo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!ado) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'components', label: 'Components', icon: Code },
    { id: 'dependencies', label: 'Dependencies', icon: Database },
    { id: 'files', label: 'Files', icon: File }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span className="font-medium">Application Definition</span>
        </div>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-200">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-600">{ado.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600">{ado.description || 'No description'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Framework</label>
                  <p className="text-sm text-gray-600">{ado.framework}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Style Framework</label>
                  <p className="text-sm text-gray-600">{ado.style_config?.framework || 'None'}</p>
                </div>
              </div>
            )}
            
            {activeTab === 'components' && (
              <div className="space-y-2">
                {ado.components?.map((comp, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comp.name}</span>
                      <span className="text-xs text-gray-500">{comp.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{comp.file_path}</p>
                  </div>
                )) || <p className="text-sm text-gray-500">No components defined</p>}
              </div>
            )}
            
            {activeTab === 'dependencies' && (
              <div className="space-y-1">
                {ado.dependencies?.map((dep, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className={dep.dev ? 'text-gray-500' : 'text-gray-700'}>
                      {dep.name}
                    </span>
                    <span className="text-gray-500">{dep.version}</span>
                  </div>
                )) || <p className="text-sm text-gray-500">No dependencies</p>}
              </div>
            )}
            
            {activeTab === 'files' && (
              <div className="space-y-1">
                {ado.files?.map((file, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{file.path}</span>
                    <span className="text-gray-500">{file.type}</span>
                  </div>
                )) || <p className="text-sm text-gray-500">No files</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Chat Interface
const ChatInterface = ({ onSendMessage, messages, isConnected }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to modify your app..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

// Enhanced File Explorer with better UX
const FileExplorer = ({ files, activeFile, onSelectFile, ado }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']));

  const handleToggleFolder = (folder) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) return '⚛️';
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) return '📄';
    if (fileName.endsWith('.css') || fileName.endsWith('.scss')) return '🎨';
    if (fileName.endsWith('.json')) return '📋';
    if (fileName.endsWith('.html')) return '🌐';
    return '📄';
  };

  const renderTree = (tree, path = '') => {
    return Object.entries(tree).map(([name, content]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFolder = typeof content === 'object' && content !== null;
      
      if (isFolder) {
        const isExpanded = expandedFolders.has(currentPath);
        return (
          <div key={currentPath}>
            <div 
              onClick={() => handleToggleFolder(currentPath)} 
              className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-700/50 rounded group"
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              <Folder className="h-4 w-4 text-sky-400" />
              <span className="text-sm">{name}</span>
            </div>
            {isExpanded && (
              <div className="pl-4 border-l border-gray-700 ml-4">
                {renderTree(content, currentPath)}
              </div>
            )}
          </div>
        );
      } else {
        const isActive = activeFile === currentPath;
        const fileIcon = getFileIcon(name);
        
        return (
          <div 
            key={currentPath} 
            onClick={() => onSelectFile(currentPath, content)}
            className={`flex items-center space-x-2 p-2 cursor-pointer rounded group ${
              isActive ? 'bg-blue-600/30 border border-blue-500/50' : 'hover:bg-gray-700/50'
            }`}
          >
            <span className="text-sm">{fileIcon}</span>
            <span className="text-sm truncate">{name}</span>
            {isActive && <div className="w-1 h-1 bg-blue-400 rounded-full ml-auto" />}
          </div>
        );
      }
    });
  };

  const fileTree = useMemo(() => {
    const tree = {};
    Object.keys(files).forEach(path => {
      path.split('/').reduce((acc, part, i, arr) => {
        if (!acc[part]) {
          acc[part] = (i === arr.length - 1) ? files[path] : {};
        }
        return acc[part];
      }, tree);
    });
    return tree;
  }, [files]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300">Project Files</h3>
        <p className="text-xs text-gray-500">{Object.keys(files).length} files</p>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {renderTree(fileTree)}
      </div>
    </div>
  );
};

// Enhanced AI Input Section
const AIInputSection = ({ onGenerate, isGenerating }) => {
  const [input, setInput] = useState('');
  const [framework, setFramework] = useState('react');
  const [styleFramework, setStyleFramework] = useState('tailwindcss');

  const examples = [
    "A modern todo app with categories and due dates",
    "An e-commerce product catalog with filtering",
    "A personal blog with markdown support",
    "A weather dashboard with multiple cities"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg max-w-2xl w-full"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Create Your App</h2>
          <p className="text-gray-600">Describe your idea and watch it come to life</p>
        </div>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (input.trim() && !isGenerating) {
          onGenerate(input.trim(), framework, styleFramework);
        }
      }} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your application
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., A modern todo app with user authentication, categories, and due dates."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none h-32 text-gray-700"
            disabled={isGenerating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="react">React</option>
              <option value="vue">Vue.js</option>
              <option value="angular">Angular</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Styling
            </label>
            <select
              value={styleFramework}
              onChange={(e) => setStyleFramework(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="tailwindcss">Tailwind CSS</option>
              <option value="styled-components">Styled Components</option>
              <option value="css">Vanilla CSS</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Try these examples:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(example)}
                className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-all"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isGenerating || !input.trim()} 
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Generating Your App...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Generate Application</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

// Custom downloadBlob function to replace file-saver
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Enhanced No-Code Platform Component with ADO Support
const NoCodePlatform = () => {
  // Core state
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('');
  const [activeFileContent, setActiveFileContent] = useState('');
  const [ado, setAdo] = useState(null); // Application Definition Object
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // WebSocket refs
  const generationWs = useRef(null);
  const chatWs = useRef(null);

  // Initialize chat WebSocket connection
  useEffect(() => {
    if (Object.keys(files).length > 0) {
      initializeChatConnection();
    }
    return () => {
      if (chatWs.current) {
        chatWs.current.close();
      }
    };
  }, [files]);

  const initializeChatConnection = () => {
    try {
      chatWs.current = new WebSocket('ws://localhost:8000/ws/chat');
      
      chatWs.current.onopen = () => {
        setIsChatConnected(true);
        setChatMessages(prev => [...prev, {
          type: 'assistant',
          content: 'Hi! I can help you modify your application. What would you like to change?'
        }]);
      };
      
      chatWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_response') {
          setChatMessages(prev => [...prev, {
            type: 'assistant',
            content: data.response
          }]);
          
          // Apply changes if any
          if (data.changes && Object.keys(data.changes).length > 0) {
            setFiles(prev => ({ ...prev, ...data.changes }));
            
            // Update ADO if provided
            if (data.updated_ado) {
              setAdo(data.updated_ado);
            }
          }
        }
      };
      
      chatWs.current.onclose = () => {
        setIsChatConnected(false);
      };
      
      chatWs.current.onerror = () => {
        setIsChatConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to initialize chat connection:', error);
      setIsChatConnected(false);
    }
  };

  const handleSendChatMessage = (message) => {
    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    
    if (chatWs.current && chatWs.current.readyState === WebSocket.OPEN) {
      chatWs.current.send(JSON.stringify({
        type: 'chat_message',
        message: message,
        current_ado: ado,
        current_files: files
      }));
    }
  };

  const handleFileSelect = (path, content) => {
    setActiveFile(path);
    setActiveFileContent(content);
  };

  const handleCodeChange = (newContent) => {
    setActiveFileContent(newContent);
    setFiles(prev => ({...prev, [activeFile]: newContent }));
  };
  
  const handleGenerate = useCallback(async (prompt, framework = 'react', styleFramework = 'tailwindcss') => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setStatusMessage('Connecting to AI...');
    setFiles({});
    setActiveFile('');
    setActiveFileContent('');
    setAdo(null);

    try {
      generationWs.current = new WebSocket('ws://localhost:8000/ws/generate-stream');
      
      generationWs.current.onopen = () => {
        generationWs.current.send(JSON.stringify({ 
          prompt, 
          framework,
          style_framework: styleFramework
        }));
      };
      
      generationWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data.event, data);
        
        switch (data.event) {
          case 'status':
            setStatusMessage(data.message);
            setGenerationProgress(prev => Math.min(prev + 5, 20));
            break;
            
          case 'ado_generated':
            console.log('ADO generated:', data.ado);
            setAdo(data.ado);
            setStatusMessage(data.message);
            setGenerationProgress(25);
            break;
            
          case 'structure_generated':
            const initialFiles = data.files.reduce((acc, path) => ({...acc, [path]: ''}), {});
            setFiles(initialFiles);
            setStatusMessage(`📁 Created ${data.files.length} files. Writing code...`);
            setGenerationProgress(30);
            break;
            
          case 'file_start':
            console.log('Starting file generation:', data.path);
            setActiveFile(data.path);
            setActiveFileContent('');
            setStatusMessage(`✍️ Writing ${data.path}...`);
            break;
            
          case 'code_chunk':
            setFiles(prev => ({...prev, [data.path]: (prev[data.path] || '') + data.chunk}));
            if (data.path === activeFile) {
              setActiveFileContent(prev => prev + data.chunk);
            }
            break;
            
          case 'file_end':
            console.log('File generation completed:', data.path);
            if (data.error) {
              console.warn('File generation error:', data.error);
            }
            setGenerationProgress(data.progress || (prev => Math.min(prev + (60 / Object.keys(files).length), 95)));
            break;
            
          case 'finish':
            console.log('Generation finished!');
            setGenerationProgress(100);
            setStatusMessage(data.message || 'Generation complete!');
            if (data.ado) {
              setAdo(data.ado);
            }
            setTimeout(() => {
              setIsGenerating(false);
              setShowChat(true); // Show chat after generation
            }, 1500);
            break;
            
          case 'error':
            console.error('Generation error:', data.message);
            setStatusMessage(`Error: ${data.message}`);
            setIsGenerating(false);
            break;
            
          case 'warning':
            console.warn('Generation warning:', data.message);
            setStatusMessage(data.message);
            break;
            
          default:
            console.log('Unknown event:', data.event, data);
        }
      };

      generationWs.current.onerror = (err) => {
        setStatusMessage('Error: Connection to backend failed.');
        setIsGenerating(false);
        console.error("WebSocket Error:", err);
      };
      
    } catch (error) {
      setStatusMessage('Error: Failed to connect to backend');
      setIsGenerating(false);
      console.error('Generation error:', error);
    }
  }, [activeFile, files]);

  const handleExport = useCallback(async () => {
    const zip = new JSZip();
    
    // Add all files to zip
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    
    // Add ADO as metadata if available
    if (ado) {
      zip.file('_ado.json', JSON.stringify(ado, null, 2));
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${ado?.name || 'generated-app'}.zip`);
  }, [files, ado]);

  const sandpackFiles = useMemo(() => {
    // Convert our files structure to Sandpack format
    const spFiles = {};
    
    // Get frontend files only for preview
    const frontendFiles = Object.entries(files).filter(([path]) => 
      !path.startsWith('backend/') && !path.startsWith('server/')
    );
    
    if (frontendFiles.length === 0) {
      // Default files when no project is generated
      return {
        '/App.js': `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚀 Generate your app to see preview</h1>
      <p>Enter your app idea above and click generate!</p>
    </div>
  );
}`,
        '/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
      };
    }
    
    // Process files for Sandpack
    frontendFiles.forEach(([path, content]) => {
      let sandpackPath = path;
      
      // Convert file paths to Sandpack format
      if (path.startsWith('src/')) {
        sandpackPath = '/' + path;
      } else if (path.startsWith('public/')) {
        sandpackPath = '/' + path;
      } else if (path.includes('package.json')) {
        sandpackPath = '/package.json';
      } else if (!path.startsWith('/')) {
        sandpackPath = '/' + path;
      }
      
      spFiles[sandpackPath] = content;
    });

    // Ensure required files exist
    if (!spFiles['/package.json']) {
      const adoDeps = ado?.dependencies || [];
      const dependencies = {};
      const devDependencies = {};
      
      adoDeps.forEach(dep => {
        if (dep.dev) {
          devDependencies[dep.name] = dep.version;
        } else {
          dependencies[dep.name] = dep.version;
        }
      });
      
      // Add default React dependencies if not present
      if (!dependencies.react) {
        dependencies.react = "^18.2.0";
        dependencies["react-dom"] = "^18.2.0";
      }
      
      spFiles['/package.json'] = JSON.stringify({
        "name": ado?.name || "generated-app",
        "version": "1.0.0",
        "dependencies": dependencies,
        "devDependencies": devDependencies,
        "main": "/index.js"
      }, null, 2);
    }
    
    if (!spFiles['/index.js']) {
      spFiles['/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
    }
    
    if (!spFiles['/App.js'] && !spFiles['/App.jsx']) {
      spFiles['/App.js'] = `export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>${ado?.name || 'Generated App'}</h1>
      <p>${ado?.description || 'Your app is being generated...'}</p>
    </div>
  );
}`;
    }

    return spFiles;
  }, [files, ado]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Full-Stack Generator</h1>
            <p className="text-sm text-gray-500">Build and preview apps with natural language</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {Object.keys(files).length > 0 && (
            <>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  showChat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>AI Assistant</span>
                {isChatConnected && (
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                )}
              </button>
              
              <button 
                onClick={handleExport} 
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Export Project</span>
              </button>
            </>
          )}
        </div>
      </header>
      
      <div className="flex-1 p-4">
        <div className="max-w-8xl mx-auto h-full">
          {!Object.keys(files).length ? (
            <div className="h-full flex items-center justify-center">
              <AIInputSection onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* File Explorer */}
              <div className="col-span-2 bg-gray-800 text-white rounded-lg overflow-hidden">
                <FileExplorer 
                  files={files} 
                  activeFile={activeFile} 
                  onSelectFile={handleFileSelect}
                  ado={ado}
                />
              </div>

              {/* Editor */}
              <div className={`${showChat ? 'col-span-4' : 'col-span-5'} bg-gray-900 rounded-lg overflow-hidden transition-all`}>
                <div className="h-8 bg-gray-800 flex items-center px-3 border-b border-gray-700">
                  <Code className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-300">
                    {activeFile || 'Select a file to edit'}
                  </span>
                </div>
                <MonacoEditor
                  height="calc(100% - 32px)"
                  path={activeFile}
                  defaultValue="// Select a file to view code"
                  value={activeFileContent}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 13, 
                    automaticLayout: true,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false
                  }}
                />
              </div>

              {/* Chat Interface */}
              {showChat && (
                <div className="col-span-3 transition-all">
                  <ChatInterface
                    onSendMessage={handleSendChatMessage}
                    messages={chatMessages}
                    isConnected={isChatConnected}
                  />
                </div>
              )}

              {/* Preview */}
              <div className={`${showChat ? 'col-span-3' : 'col-span-5'} bg-white rounded-lg border border-gray-200 overflow-hidden transition-all`}>
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Live Preview</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {ado && (
                      <span className="text-xs text-gray-500">
                        {ado.name} v{ado.version}
                      </span>
                    )}
                    <button
                      onClick={() => window.location.reload()}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Refresh Preview"
                    >
                      <RefreshCw className="h-3 w-3 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="h-[calc(100%-38px)]">
                  <ErrorBoundary>
                    <SandpackProvider 
                      template="react" 
                      files={sandpackFiles}
                      theme="light"
                      options={{ 
                        showLineNumbers: false,
                        showTabs: false,
                        closableTabs: false,
                        editorHeight: '100%',
                        autoReload: true,
                        recompileMode: 'immediate',
                        recompileDelay: 300,
                      }}
                    >
                      <SandpackPreview 
                        showNavigator={false}
                        showOpenInCodeSandbox={false}
                        showRefreshButton={true}
                        style={{ height: '100%' }}
                      />
                    </SandpackProvider>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          )}

          {/* ADO Inspector - Always visible when available */}
          {ado && (
            <div className="fixed bottom-4 left-4 w-80 z-50">
              <ADOInspector ado={ado} onUpdateAdo={setAdo} />
            </div>
          )}

          {/* Generation Progress Overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl max-w-md w-full mx-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin">
                        <Sparkles className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Generating Your App</h3>
                        <p className="text-sm text-gray-600">{statusMessage}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {Math.round(generationProgress)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${generationProgress}%` }} 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <div className={`flex items-center space-x-1 ${generationProgress >= 25 ? 'text-green-600' : ''}`}>
                      {generationProgress >= 25 ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                      <span>Structure</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${generationProgress >= 60 ? 'text-green-600' : ''}`}>
                      {generationProgress >= 60 ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                      <span>Code Gen</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${generationProgress >= 100 ? 'text-green-600' : ''}`}>
                      {generationProgress >= 100 ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3 border border-gray-300 rounded-full" />}
                      <span>Complete</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NoCodePlatform;

