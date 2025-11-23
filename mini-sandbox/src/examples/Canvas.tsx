import React, { forwardRef } from 'react'

interface CanvasProps {
  children: React.ReactNode
  className?: string
  viewBox?: string
  enableZoom?: boolean
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    { children, className = '', viewBox = '0 0 800 600', enableZoom = false },
    ref
  ) => {
    return (
      <div
        ref={enableZoom ? ref : null}
        className={`my-4 w-full aspect-5/3 bg-gray-50/50 rounded-lg border border-gray-200 ${className}`}
        style={enableZoom ? { cursor: 'grab', overflow: 'hidden' } : undefined}
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
)

Canvas.displayName = 'Canvas'

export default Canvas
