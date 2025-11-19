import React from 'react'
import './Example1.css'

// Example1: foundational concept demo
// A diagram: blocks (nodes) positioned on a 2D surface; each block could later gain ports, labels, and edges.
// Using foreignObject to embed HTML/CSS styled nodes within SVG for richer styling.

const nodes = [
  { id: 'build', x: 40, y: 30 },
  { id: 'test', x: 200, y: 80 },
  { id: 'deploy', x: 340, y: 40 },
  { id: 'validate', x: 80, y: 160 },
  { id: 'notify', x: 280, y: 180 },
]

export default function Example1() {
  return (
    <div
      style={{
        width: 520,
        height: 300,
        background: '#f9fafb',
        borderRadius: 8,
        padding: 16,
        border: '1px solid #e5e7eb',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 520 300"
        role="img"
        aria-label="Scattered nodes demo"
      >
        {nodes.map((n) => (
          <foreignObject key={n.id} x={n.x} y={n.y} width={200} height={50}>
            <div className="example1-node">
              {/* <div className="example1-indicator" /> */}
              <p className="example1-label">{n.id}</p>
            </div>
          </foreignObject>
        ))}
      </svg>
    </div>
  )
}
