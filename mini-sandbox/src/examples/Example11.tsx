import Canvas from './Canvas'
import Edge from './edge'
import { BaseNode } from './node'
import { useState, useEffect } from 'react'
import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode, ElkExtendedEdge, ElkPoint } from 'elkjs'

const elk = new ELK()
const nodeWidth = 140

type NodeData = { id: string; parentIds: string[] }

export function Example11() {
  const nodes: NodeData[] = [
    { id: '0', parentIds: [] },
    { id: '1', parentIds: [] },
    { id: '2', parentIds: ['0'] },
    { id: '3', parentIds: ['0'] },
    { id: '4', parentIds: ['0', '1'] },
    { id: '5', parentIds: ['1', '2'] },
    { id: '6', parentIds: ['1', '3', '4'] },
    { id: '7', parentIds: ['0', '2', '4', '5', '6'] },
  ]

  const [layout, setLayout] = useState<ElkNode | null>(null)
  const [currentIndex, setCurrentIndex] = useState<string | null>(null)

  useEffect(() => {
    const elkGraph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '40',
        'elk.spacing.edgeNode': '60',
        'elk.layered.spacing.edgeNodeBetweenLayers': '30',
        'elk.layered.spacing.nodeNodeBetweenLayers': '10',
        'elk.spacing.portPort': '5',
        'elk.layered.portAlignment': 'CENTER',
      },
      children: nodes.map((n) => ({
        id: n.id,
        width: nodeWidth,
        height: 48,
      })),
      edges: nodes.flatMap((n) =>
        n.parentIds.map((pid) => ({
          id: `${pid}->${n.id}`,
          sources: [pid],
          targets: [n.id],
        }))
      ),
    }

    elk.layout(elkGraph).then(setLayout)
  }, [])

  const generateCurvedPathFromPoints = (points: ElkPoint[]) => {
    if (!points || points.length < 2) return ''
    const [start] = points
    let d = `M ${start.x} ${start.y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const t = Math.min(30, distance / 2)
      const angle = Math.atan2(dy, dx)
      const cp1x = prev.x + t * Math.cos(angle)
      const cp1y = prev.y + t * Math.sin(angle)
      const cp2x = curr.x - t * Math.cos(angle)
      const cp2y = curr.y - t * Math.sin(angle)

      if (next) {
        const dxNext = next.x - curr.x
        const dyNext = next.y - curr.y
        const angleChange = Math.abs(
          Math.atan2(dyNext, dxNext) - Math.atan2(dy, dx)
        )
        const isSharpTurn = Math.abs(angleChange - Math.PI / 2) < 0.2

        if (isSharpTurn) {
          const cornerRadius = 8
          const angleIn = Math.atan2(dy, dx)
          const angleOut = Math.atan2(dyNext, dxNext)

          const cornerStartX = curr.x - cornerRadius * Math.cos(angleIn)
          const cornerStartY = curr.y - cornerRadius * Math.sin(angleIn)
          const cornerEndX = curr.x + cornerRadius * Math.cos(angleOut)
          const cornerEndY = curr.y + cornerRadius * Math.sin(angleOut)

          d += ` L ${cornerStartX} ${cornerStartY}`
          d += ` Q ${curr.x} ${curr.y}, ${cornerEndX} ${cornerEndY}`
          continue
        }
      }

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }

    return d
  }

  // Calculate centering offset
  const offsetX = layout ? (800 - (layout.width || 0)) / 2 : 0
  const offsetY = layout ? (600 - (layout.height || 0)) / 2 : 0

  if (!layout) return null

  return (
    <Canvas>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Edges */}
        {(layout.edges ?? []).map((edge: ElkExtendedEdge) => {
          const points = edge.sections?.[0]?.bendPoints ?? []
          const start = edge.sections?.[0]?.startPoint
          const end = edge.sections?.[0]?.endPoint

          const path = generateCurvedPathFromPoints(
            [start, ...points, end].filter(
              (p): p is ElkPoint => p !== undefined
            )
          )

          const active =
            currentIndex &&
            (edge.sources.includes(currentIndex) ||
              edge.targets.includes(currentIndex))

          return (
            <Edge
              key={edge.id}
              x1={0}
              y1={0}
              x2={0}
              y2={0}
              curved={true}
              pathData={path}
              stroke={
                active
                  ? 'rgba(100, 100, 100, 1)'
                  : currentIndex !== null
                  ? 'rgba(200, 200, 200, 0.4)'
                  : 'rgba(200, 200, 200, 0.8)'
              }
            />
          )
        })}

        {/* Nodes */}
        {(layout.children ?? []).map((node: ElkNode) => {
          const layer = Math.round((node.y ?? 0) / 80)
          const darkness = 256 - layer * 15
          const clamped = Math.max(darkness, 200)
          const fill = `rgb(${clamped},${clamped},${clamped})`

          return (
            <g
              key={node.id}
              transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
              style={{ cursor: 'pointer' }}
              onClick={() =>
                setCurrentIndex(currentIndex === node.id ? null : node.id)
              }
            >
              <BaseNode id={node.id} variant="outline" fill={fill} />
            </g>
          )
        })}
      </g>
    </Canvas>
  )
}

export default Example11
