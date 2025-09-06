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
  ChevronRight, Settings, MessageSquare, RefreshCw, CheckCircle, AlertTriangle
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

// Custom downloadBlob function
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

export default AIInputSection;
