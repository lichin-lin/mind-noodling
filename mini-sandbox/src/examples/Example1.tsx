import Canvas from './Canvas'
import BaseNode from './node'
import type { NodeProps } from './node'
// Example1: foundational concept demo
// A diagram: blocks (nodes) positioned on a 2D surface; each block could later gain ports, labels, and edges.
// Using foreignObject to embed HTML with Tailwind-styled nodes within SVG.

const nodes: NodeProps[] = [
  { id: 'Build Application', x: 60, y: 50 },
  { id: 'Run Tests', x: 300, y: 120 },
  { id: 'Deploy to Staging', x: 480, y: 60 },
  { id: 'Validate Release', x: 120, y: 240 },
  { id: 'Notify Team', x: 420, y: 270 },
]

export default function Example1() {
  // Calculate bounding box
  const maxX = Math.max(...nodes.map((n) => n.x)) + 220 // foreignObject width
  const maxY = Math.max(...nodes.map((n) => n.y)) + 56 // foreignObject height
  const offsetX = (800 - maxX) / 2
  const offsetY = (600 - maxY) / 2

  return (
    <Canvas>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {nodes.map((n) => (
          <foreignObject key={n.id} x={n.x} y={n.y} width={220} height={56}>
            <BaseNode id={n.id} />
          </foreignObject>
        ))}
      </g>
    </Canvas>
  )
}
