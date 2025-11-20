import React from 'react'
import Canvas from './Canvas'
import BaseNode from './node'
// Example1: foundational concept demo
// A diagram: blocks (nodes) positioned on a 2D surface; each block could later gain ports, labels, and edges.
// Using foreignObject to embed HTML with Tailwind-styled nodes within SVG.

interface Node {
  id: string
  x: number
  y: number
}

const nodes: Node[] = [
  { id: 'Build Application', x: 60, y: 50 },
  { id: 'Run Tests', x: 300, y: 120 },
  { id: 'Deploy to Staging', x: 480, y: 60 },
  { id: 'Validate Release', x: 120, y: 240 },
  { id: 'Notify Team', x: 420, y: 270 },
]

export default function Example1() {
  return (
    <Canvas>
      {nodes.map((n) => (
        <foreignObject key={n.id} x={n.x} y={n.y} width={180} height={48}>
          <BaseNode id={n.id} />
        </foreignObject>
      ))}
    </Canvas>
  )
}
