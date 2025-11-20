import React from 'react'

interface CanvasProps {
  children: React.ReactNode
  className?: string
}

export default function Canvas({ children, className = '' }: CanvasProps) {
  return (
    <div
      className={`w-full aspect-5/3 bg-gray-50 rounded-lg border border-gray-200 ${className}`}
    >
      <svg width="100%" height="100%" aria-label="Diagram canvas">
        {children}
      </svg>
    </div>
  )
}
