import React from 'react'
import AppTemplates from './AppTemplates'

function Sidebar({ onSelectTemplate }) {
  const handleTemplateSelect = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.prompt, { framework: 'react' })
    }
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      {/* Quick Templates */}
      <AppTemplates 
        onSelectTemplate={handleTemplateSelect}
        className="mb-6"
      />
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">🎯 Components</h3>
        <div className="space-y-2">
          <button 
            onClick={() => onSelectTemplate?.('Create a modern button component with hover effects and multiple variants (primary, secondary, danger)', { framework: 'react' })}
            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            🔘 Button
          </button>
          <button 
            onClick={() => onSelectTemplate?.('Create a contact form with validation, multiple input types, and submission handling', { framework: 'react' })}
            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            � Form
          </button>
          <button 
            onClick={() => onSelectTemplate?.('Design a product card component with image, title, description, price, and action buttons', { framework: 'react' })}
            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            �️ Card
          </button>
          <button 
            onClick={() => onSelectTemplate?.('Create a responsive navigation bar with logo, menu items, mobile hamburger menu, and dropdown', { framework: 'react' })}
            className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            🧭 Navigation
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">📂 Recent Projects</h3>
        <div className="text-sm text-gray-500">
          No recent projects
        </div>
      </div>
    </div>
  )
}

export default Sidebar
