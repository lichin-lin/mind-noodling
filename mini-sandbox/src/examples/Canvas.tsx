import React from 'react'

interface CanvasProps {
  children: React.ReactNode
  className?: string
  viewBox?: string
}

export default function Canvas({
  children,
  className = '',
  viewBox = '0 0 800 600',
}: CanvasProps) {
  return (
    <div
      className={`my-4 w-full aspect-5/3 bg-gray-50/50 rounded-lg border border-gray-200 ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        aria-label="Diagram canvas"
      >
        {children}
      </svg>
    </div>
  )
}
