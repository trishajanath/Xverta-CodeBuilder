import React from 'react'

function LoadingAnimation() {
  return (
    <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        {/* AI Brain Animation */}
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-2 border-purple-400 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text with Typing Effect */}
        <div className="flex-1">
          <div className="text-white font-medium">🤖 AI is crafting your application...</div>
          <div className="text-sm text-gray-400 mt-1">
            <span className="inline-block animate-bounce">Analyzing requirements</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.1s'}}>.</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
            <span className="inline-block animate-bounce" style={{animationDelay: '0.3s'}}>.</span>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingAnimation
