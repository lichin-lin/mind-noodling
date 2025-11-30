import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useControls } from 'leva'
import Canvas from './Canvas'
import { BaseNode } from './node'
import type { Edge as LayoutEdge, GraphData } from '../algo/GraphLayoutTypes'
import { GraphLayout } from '../algo/GraphLayout'

type NodeData = { id: string; parentIds: string[] }

const rawNodes: NodeData[] = [
  { id: '0', parentIds: [] },
  { id: '1', parentIds: [] },
  { id: '2', parentIds: ['0'] },
  { id: '3', parentIds: ['0'] },
  { id: '4', parentIds: ['0', '1'] },
  { id: '5', parentIds: ['1', '2'] },
  { id: '6', parentIds: ['1', '3', '4'] },
  { id: '7', parentIds: ['0', '2', '4', '5', '6'] },
]

export function Example12() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [transform, setTransform] = useState(d3.zoomIdentity)

  const graphData: GraphData = useMemo(
    () => ({
      nodes: rawNodes.map((n, index) => ({
        id: index,
        successors: rawNodes
          .map((m, j) => ({ node: m, index: j }))
          .filter(({ node }) => node.parentIds.includes(n.id))
          .map(({ index: j }) => j),
        loopDepth: 0,
        isLoopHeader: false,
        isBackedge: false,
      })),
    }),
    []
  )

  // Leva controls for layout options (mirrors POC, but local)
  const layoutOptions = useControls('Layout Options (Custom DAG)', {
    blockGap: { value: 50, min: 20, max: 200, step: 5 },
    portStart: { value: 30, min: 10, max: 50, step: 5 },
    portSpacing: { value: 15, min: 5, max: 30, step: 1 },
    trackPadding: { value: 40, min: 5, max: 50, step: 5 },
    jointSpacing: { value: 15, min: 5, max: 30, step: 1 },
    headerArrowPushdown: { value: 14, min: 5, max: 50, step: 1 },
    allSplit: { value: true, label: 'All Split (separate edges)' },
    layoutStep: { value: 6, min: 1, max: 5, step: 1 },
  })
  const { nodes, edges, viewBox } = useMemo(() => {
    const graphLayout = new GraphLayout(graphData, layoutOptions)
    const result = graphLayout.compute()

    const padding = 20

    const width = 800
    const height = 600

    const contentWidth = result.size.x
    const contentHeight = result.size.y

    const offsetX = (width - (contentWidth + padding * 2)) / 2
    const offsetY = (height - (contentHeight + padding * 2)) / 2

    const flatNodes = result.nodesByLayer
      .flat()
      .filter((n) => n.block !== null)
      .map((n) => ({
        id: n.block!.id,
        x: n.pos.x + padding * 2 + offsetX,
        y: n.pos.y + padding * 2 + offsetY,
        width: n.size.x,
        height: n.size.y,
      }))

    const flatEdges = result.edges.map((e) => ({
      id: e.id,
      type: e.type,
      hasArrowhead: e.hasArrowhead,
      x1: e.x1 + padding * 2 + offsetX,
      y1: e.y1 + padding * 2 + offsetY,
      x2: e.x2 + padding * 2 + offsetX,
      y2: e.y2 + padding * 2 + offsetY,
      ym: e.ym !== undefined ? e.ym + padding * 2 + offsetY : undefined,
    }))

    return {
      nodes: flatNodes,
      edges: flatEdges,
      viewBox: `0 0 ${width} ${height}`,
    }
  }, [graphData, layoutOptions])

  useEffect(() => {
    if (!svgRef.current) return

    const svgSelection = d3.select(svgRef.current)
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setTransform(event.transform)
      })

    svgSelection.call(zoom as any)
    const initialTransform = d3.zoomIdentity.scale(0.95)
    svgSelection.call(zoom.transform as any, initialTransform)
    setTransform(initialTransform)
    return () => {
      svgSelection.on('.zoom', null)
    }
  }, [])

  return (
    <Canvas enableZoom viewBox={viewBox} svgRef={svgRef}>
      <g transform={transform.toString()}>
        <Edges edges={edges} />
        <Nodes nodes={nodes} />
      </g>
    </Canvas>
  )
}
type RenderNode = {
  id: number
  x: number
  y: number
}

type RenderEdge = {
  id: string
  type: LayoutEdge['type']
  hasArrowhead: boolean
  x1: number
  y1: number
  x2: number
  y2: number
  ym?: number
}

function Nodes({ nodes }: { nodes: RenderNode[] }) {
  return (
    <g className="nodes">
      {nodes.map((n) => {
        return (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
            <BaseNode id={String(n.id)} variant="outline" />
          </g>
        )
      })}
    </g>
  )
}

function Edges({ edges }: { edges: RenderEdge[] }) {
  const ARROW_RADIUS = 12

  return (
    <g className="edges">
      {edges.map((e) => {
        const { x1, y1, x2, y2, ym } = e

        let d = ''
        switch (e.type) {
          case 'downward':
            d = buildDownwardPath(x1, y1, x2, y2, ym!, ARROW_RADIUS)
            break
          case 'upward':
            d = buildUpwardPath(x1, y1, x2, y2, ym!, ARROW_RADIUS)
            break
          case 'loopHeader':
            d = `M ${x1} ${y1} L ${x2} ${y2}`
            break
          case 'toBackedge':
            d = buildToBackedgePath(x1, y1, x2, y2, ARROW_RADIUS)
            break
          case 'toBackedgeDummy':
            d = buildToBackedgeDummyPath(x1, y1, x2, y2, ym!, ARROW_RADIUS)
            break
        }

        let rotation = 180
        if (e.type === 'loopHeader' || e.type === 'toBackedge') rotation = 270
        else if (e.type === 'upward') rotation = 0

        return (
          <g key={e.id} className="edge">
            <path
              d={d}
              fill="none"
              stroke="rgba(200, 200, 200, 0.8)"
              strokeWidth={1.5}
            />
            {e.hasArrowhead && (
              <path
                d="M 0 0 L -5 7.5 L 5 7.5 Z"
                transform={`translate(${x2}, ${y2}) rotate(${rotation})`}
              />
            )}
          </g>
        )
      })}
    </g>
  )
}

function buildDownwardPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ym: number,
  r: number
): string {
  if (Math.abs(x2 - x1) < 2 * r) {
    return `M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${
      y1 + (2 * (y2 - y1)) / 3
    } ${x2} ${y2}`
  }

  const dir = Math.sign(x2 - x1)
  let path = `M ${x1} ${y1} `
  path += `L ${x1} ${ym - r} `
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x1 + r * dir} ${ym} `
  path += `L ${x2 - r * dir} ${ym} `
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x2} ${ym + r} `
  path += `L ${x2} ${y2}`
  return path
}

function buildUpwardPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ym: number,
  r: number
): string {
  if (Math.abs(x2 - x1) < 2 * r) {
    return `M ${x1} ${y1} C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${
      y1 + (2 * (y2 - y1)) / 3
    } ${x2} ${y2}`
  }

  const dir = Math.sign(x2 - x1)
  let path = `M ${x1} ${y1} `
  path += `L ${x1} ${ym + r} `
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x1 + r * dir} ${ym} `
  path += `L ${x2 - r * dir} ${ym} `
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x2} ${ym - r} `
  path += `L ${x2} ${y2}`
  return path
}

function buildToBackedgePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number
): string {
  let path = `M ${x1} ${y1} `
  path += `A ${r} ${r} 0 0 0 ${x1 - r} ${y2} `
  path += `L ${x2} ${y2}`
  return path
}

function buildToBackedgeDummyPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ym: number,
  r: number
): string {
  let path = `M ${x1} ${y1} `
  path += `L ${x1} ${ym - r} `
  path += `A ${r} ${r} 0 0 0 ${x1 + r} ${ym} `
  path += `L ${x2 - r} ${ym} `
  path += `A ${r} ${r} 0 0 0 ${x2} ${ym - r} `
  path += `L ${x2} ${y2}`
  return path
}

export default Example12
