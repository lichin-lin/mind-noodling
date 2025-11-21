import Canvas from './Canvas'
import BaseNode from './node'
import Edge from './edge'
import type { NodeProps } from './node'

interface Edge {
  source: string
  target: string
}

export function Example3() {
  const nodes: NodeProps[] = Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    x: Math.floor(Math.random() * 700),
    y: Math.floor(Math.random() * 500),
  }))

  const edges: Edge[] = nodes.flatMap((node, i) => {
    const targets = [i + 1, i + 2].filter((t) => t < nodes.length)
    return targets.map((t) => ({ source: node.id, target: nodes[t].id }))
  })

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
            <Edge
              key={`${edge.source}-${edge.target}`}
              x1={from.x + 72}
              y1={from.y + 24}
              x2={to.x + 72}
              y2={to.y + 24}
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

export default Example3
