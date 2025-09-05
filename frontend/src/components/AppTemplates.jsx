import React from 'react'

const templates = [
  {
    id: 'landing',
    name: 'Landing Page',
    icon: '🚀',
    description: 'Modern landing page with hero section',
    prompt: 'Create a modern landing page for a SaaS product with hero section, features, testimonials, and call-to-action buttons. Use gradients and modern design.'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    description: 'Analytics dashboard with charts',
    prompt: 'Build a professional dashboard with sidebar navigation, charts, statistics cards, and data tables. Include dark mode styling.'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Product showcase and shopping cart',
    prompt: 'Create an e-commerce product page with image gallery, product details, add to cart functionality, and related products section.'
  },
  {
    id: 'blog',
    name: 'Blog',
    icon: '📝',
    description: 'Blog layout with articles',
    prompt: 'Design a blog homepage with featured articles, category filters, search functionality, and responsive card layout.'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: '💼',
    description: 'Personal portfolio site',
    prompt: 'Build a personal portfolio website with hero section, projects gallery, skills section, and contact form. Use modern animations.'
  },
  {
    id: 'app',
    name: 'Todo App',
    icon: '✅',
    description: 'Task management application',
    prompt: 'Create a todo application with add/delete tasks, mark as complete, filter by status, and local storage persistence.'
  }
]

function AppTemplates({ onSelectTemplate, className = '' }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">🎨 Quick Start Templates</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all transform hover:scale-105 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {template.icon}
            </div>
            <div className="text-white font-medium mb-1">{template.name}</div>
            <div className="text-gray-400 text-xs">{template.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default AppTemplates
