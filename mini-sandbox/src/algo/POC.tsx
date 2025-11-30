import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useControls } from 'leva'
import type {
  LayoutResult,
  Edge,
  LayoutNode,
  GraphData,
} from './GraphLayoutTypes.ts'
import { GraphLayout } from './GraphLayout.ts'
// import './theme.css'

interface GraphLayoutPOCProps {
  data: GraphData
}

export function GraphLayoutPOC({ data }: GraphLayoutPOCProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [darkMode, setDarkMode] = useState(false)

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Leva controls for layout options
  const layoutOptions = useControls('Layout Options', {
    // Spacing controls
    blockGap: { value: 60, min: 20, max: 200, step: 5 },
    portStart: { value: 20, min: 10, max: 50, step: 5 },
    portSpacing: { value: 15, min: 5, max: 30, step: 1 },
    trackPadding: { value: 40, min: 5, max: 50, step: 5 },
    jointSpacing: { value: 15, min: 5, max: 30, step: 1 },
    headerArrowPushdown: { value: 14, min: 5, max: 50, step: 1 },

    allSplit: { value: true, label: 'All Split (separate edges)' },

    // Debug controls
    layoutStep: { value: 6, min: 1, max: 5, step: 1 },
    debug: { value: false, label: 'Enable Debug Logging' },
    theme: {
      value: darkMode ? 'dark' : 'light',
      options: ['light', 'dark'],
      onChange: (value) => setDarkMode(value === 'dark'),
    },
  })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    try {
      // Compute layout directly from GraphData
      const graphLayout = new GraphLayout(data, layoutOptions)
      const result: LayoutResult = graphLayout.compute()

      // Render with D3
      renderGraph(svgRef.current, containerRef.current, result)
    } catch (error) {
      console.error('Error in GraphLayoutPOC:', error)
    }
  }, [data, layoutOptions])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

function renderGraph(
  svg: SVGSVGElement,
  container: HTMLDivElement,
  result: LayoutResult
) {
  const { nodesByLayer, edges, size } = result

  // Clear previous content
  d3.select(svg).selectAll('*').remove()

  // Set up SVG
  const svgSelection = d3
    .select(svg)
    .attr('width', container.clientWidth)
    .attr('height', container.clientHeight)

  // Create main group for pan/zoom
  const g = svgSelection.append('g')

  // Create separate groups for edges and nodes (so edges stay behind)
  const edgesGroup = g.append('g').attr('class', 'edges')
  const nodesGroup = g.append('g').attr('class', 'nodes')

  // Set up zoom behavior
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svgSelection.call(zoom as any)

  // Initial zoom to fit
  const padding = 50
  const scale = Math.min(
    (container.clientWidth - padding * 2) / size.x,
    (container.clientHeight - padding * 2) / size.y,
    1
  )
  const initialTransform = d3.zoomIdentity
    .translate(
      (container.clientWidth - size.x * scale) / 2,
      (container.clientHeight - size.y * scale) / 2
    )
    .scale(scale)

  svgSelection.call(zoom.transform as any, initialTransform)

  // Render edges first (so they appear behind nodes)
  renderEdges(edgesGroup, edges)

  // Render nodes
  renderNodes(nodesGroup, nodesByLayer)
}

function renderNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodesByLayer: LayoutNode[][]
) {
  const allNodes = nodesByLayer.flat().filter((node) => node.block !== null)

  const nodeGroups = g
    .selectAll<SVGGElement, LayoutNode>('g.node')
    .data(allNodes)
    .join('g')
    .attr('class', 'node')
    .attr('transform', (d) => `translate(${d.pos.x}, ${d.pos.y})`)

  // Rectangle
  nodeGroups
    .append('rect')
    .attr('width', (d) => d.size.x)
    .attr('height', (d) => d.size.y)
    .attr('rx', 4)
    .attr('class', 'node-rect')

  // Label
  nodeGroups
    .append('text')
    .attr('x', (d) => d.size.x / 2)
    .attr('y', (d) => d.size.y / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 600)
    .attr('class', 'node-text')
    .text((d) => `Block ${d.block!.id}`)
}

function renderEdges(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  edges: Edge[]
) {
  const ARROW_RADIUS = 12

  // Clear previous edges
  g.selectAll('*').remove()

  const edgeGroups = g
    .selectAll<SVGGElement, Edge>('g.edge')
    .data(edges)
    .join('g')
    .attr('class', 'edge')

  edgeGroups.each(function (edge) {
    const group = d3.select(this)

    // Build path based on edge type
    let path = ''
    const { x1, y1, x2, y2, ym, type } = edge

    switch (type) {
      case 'downward':
        path = buildDownwardPath(x1, y1, x2, y2, ym!, ARROW_RADIUS)
        break
      case 'upward':
        path = buildUpwardPath(x1, y1, x2, y2, ym!, ARROW_RADIUS)
        break
      case 'loopHeader':
        path = `M ${x1} ${y1} L ${x2} ${y2}`
        break
      case 'toBackedge':
        path = buildToBackedgePath(x1, y1, x2, y2, ARROW_RADIUS)
        break
      case 'toBackedgeDummy':
        path = buildToBackedgeDummyPath(x1, y1, x2, y2, ym!, ARROW_RADIUS)
        break
    }

    // Draw path
    group
      .append('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('class', 'edge-path')
      .attr('stroke', 'rgba(200, 200, 200, 0.8)')
      .attr('stroke-width', 1.5)

    // Draw arrowhead if needed
    if (edge.hasArrowhead) {
      let rotation = 180 // default for downward
      if (type === 'loopHeader' || type === 'toBackedge') {
        rotation = 270
      } else if (type === 'upward') {
        rotation = 0
      }

      group
        .append('path')
        .attr('d', 'M 0 0 L -5 7.5 L 5 7.5 Z')
        .attr('class', 'edge-arrow')
        .attr('transform', `translate(${x2}, ${y2}) rotate(${rotation})`)
    }
  })
}

// Path building helpers
function buildDownwardPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ym: number,
  r: number
): string {
  if (Math.abs(x2 - x1) < 2 * r) {
    // Degenerate case - use bezier
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
