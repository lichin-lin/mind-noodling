import { motion } from 'motion/react'
import Canvas from './Canvas'
import BaseNode from './node'
import type { NodeProps } from './node'

interface Edge {
  source: string
  target: string
}

export function Example2() {
  const nodes: NodeProps[] = [
    { id: '1', x: 50, y: 50 },
    { id: '2', x: 200, y: 150 },
    { id: '3', x: 350, y: 300 },
    { id: '4', x: 450, y: 150 },
  ]

  const edges: Edge[] = [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '1', target: '4' },
  ]

  const getNodeById = (id: string) => nodes.find((n) => n.id === id)!

  // Calculate bounding box
  const maxX = Math.max(...nodes.map((n) => n.x)) + 144 // node width
  const maxY = Math.max(...nodes.map((n) => n.y)) + 48 // node height
  const offsetX = (800 - maxX) / 2
  const offsetY = (600 - maxY) / 2

  return (
    <Canvas>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Edges with fade-in animation */}
        {edges.map((edge) => {
          const from = getNodeById(edge.source)
          const to = getNodeById(edge.target)
          return (
            <motion.line
              key={`${edge.source}-${edge.target}`}
              x1={from.x + 72}
              y1={from.y + 24}
              x2={to.x + 72}
              y2={to.y + 24}
              stroke="#666"
              strokeWidth={1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <BaseNode id={node.id} variant="outline" />
          </g>
        ))}
      </g>
    </Canvas>
  )
}

export default Example2
