import React, { forwardRef } from 'react'

interface CanvasProps {
  children: React.ReactNode
  className?: string
  viewBox?: string
  enableZoom?: boolean
  onReplay?: () => void
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      children,
      className = '',
      viewBox = '0 0 800 600',
      enableZoom = false,
      onReplay,
    },
    ref
  ) => {
    return (
      <div className="relative">
        {onReplay && (
          <button
            onClick={onReplay}
            className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ↻ Rerun
          </button>
        )}
        <div
          ref={enableZoom ? ref : null}
          className={`my-4 w-full aspect-5/3 bg-gray-50/50 rounded-lg border border-gray-200 ${className}`}
          style={
            enableZoom ? { cursor: 'grab', overflow: 'hidden' } : undefined
          }
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
      </div>
    )
  }
)

Canvas.displayName = 'Canvas'

export default Canvas
