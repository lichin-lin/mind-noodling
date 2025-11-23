import Canvas from './Canvas'
import BaseNode from './node'
import { generateRoundedVerticalPath } from './pathUtils'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { select, zoom, interpolate } from 'd3'
import type { ZoomBehavior } from 'd3'
import {
  graphStratify,
  sugiyama,
  layeringSimplex,
  decrossTwoLayer,
  twolayerGreedy,
  twolayerAgg,
} from 'd3-dag'

type NodeData = { id: string; parentIds: string[] }
type EdgeStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED'

interface AnimatedEdgeProps {
  path: string
  index: number
  status: EdgeStatus
}

const AnimatedEdge = ({ path, index, status }: AnimatedEdgeProps) => {
  const maskId = `mask-${index}`
  const pathId = `path-${index}`
  const gradIdle = `idle-grad-${index}`
  const gradProc = `proc-grad-${index}`
  const idleAnimationRunTime = '6s'
  const processingAnimationRunTime = '2s'
  const [localState, setLocalState] = useState(status)

  useEffect(() => {
    if (localState === 'PROCESSING') {
      setTimeout(() => {
        setLocalState('COMPLETED')
      }, 5000)
    }

    if (localState === 'IDLE') {
      setTimeout(() => {
        setLocalState('PROCESSING')
      }, 5000)
    }
  }, [localState])

  const renderEdgeAddOn = () => {
    return (
      <AnimatePresence mode="wait">
        {(localState === 'IDLE' || localState === 'PROCESSING') && (
          <motion.g
            key={localState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            mask={`url(#${maskId})`}
          >
            <motion.circle
              r={localState === 'IDLE' ? 25 : 30}
              fill={`url(#${localState === 'IDLE' ? gradIdle : gradProc})`}
            >
              <animateMotion
                rotate="auto"
                dur={
                  localState === 'IDLE'
                    ? idleAnimationRunTime
                    : processingAnimationRunTime
                }
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.42 0 0.58 1"
                begin={0}
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </motion.circle>
          </motion.g>
        )}

        {localState === 'COMPLETED' && (
          <motion.path
            key="completed"
            d={path}
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="edge-completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    )
  }

  return (
    <g key={`edge-${index}`}>
      <defs>
        <linearGradient id={gradIdle} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop stopColor="#CCC" stopOpacity="0" offset="0%" />
          <stop stopColor="#CCC" stopOpacity="0.6" offset="100%" />
        </linearGradient>

        <linearGradient id={gradProc} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop stopColor="#007bff" stopOpacity="0" offset="0%" />
          <stop stopColor="#007bff" stopOpacity="1" offset="100%" />
        </linearGradient>

        <mask id={maskId}>
          <motion.path
            d={path}
            stroke="white"
            strokeWidth={localState === 'PROCESSING' ? 2.5 : 1.5}
            fill="none"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <path d={path} id={pathId} fill="none" stroke="#CCC" strokeWidth={1.5} />
      {renderEdgeAddOn()}
    </g>
  )
}

export function Example9() {
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(
    null
  )

  const handleNodeCanvasRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const nodeCanvasSelection = select(node)

      const updateGrid = (
        zoomEvent: d3.D3ZoomEvent<HTMLDivElement, unknown>
      ) => {
        select('#dot-pattern')
          .attr('x', zoomEvent.transform.x)
          .attr('y', zoomEvent.transform.y)
          .attr('width', 25 * zoomEvent.transform.k)
          .attr('height', 25 * zoomEvent.transform.k)
          .select('rect')
          .attr('x', (25 * zoomEvent.transform.k) / 2 - 2 / 2)
          .attr('y', (25 * zoomEvent.transform.k) / 2 - 2 / 2)
          .attr('opacity', Math.min(zoomEvent.transform.k, 1))
      }

      const PAN_THRESHOLD = 5
      let initialTransform: d3.ZoomTransform | null = null
      let hasMovedEnough = false

      const zoomBehavior = zoom<HTMLDivElement, unknown>()
        .scaleExtent([0.2, 5])
        .interpolate(interpolate)
        .on('start', (event) => {
          initialTransform = event.transform
          hasMovedEnough = false
        })
        .on('zoom', (event) => {
          if (!initialTransform) return
          const dx = event.transform.x - initialTransform.x
          const dy = event.transform.y - initialTransform.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (!hasMovedEnough && dist < PAN_THRESHOLD) {
            return
          }

          hasMovedEnough = true

          select('#edges-group').attr('transform', event.transform.toString())
          select('#nodes-overlay')
            .style('transform-origin', '0 0')
            .style(
              'transform',
              `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`
            )
          updateGrid(event)
        })

      zoomBehaviorRef.current = zoomBehavior
      nodeCanvasSelection.call(zoomBehavior)
    }
  }, [])

  const nodes = Array.from({ length: 30 }, (_, i) => {
    const id = String(i)
    const parentIds: string[] = []
    if (i > 0) {
      const possibleParents = Array.from({ length: i }, (_, j) => String(j))
      const numParents = 1
      for (let p = 0; p < numParents; p++) {
        const parent =
          possibleParents[Math.floor(Math.random() * possibleParents.length)]
        if (!parentIds.includes(parent)) parentIds.push(parent)
      }
    }
    return { id, parentIds }
  })

  const builder = graphStratify()
    .id((d: { id: string }) => d.id)
    .parentIds((d: NodeData) => d.parentIds)

  const dag = builder(nodes)
  const layout = sugiyama()
    .layering(layeringSimplex())
    .decross(decrossTwoLayer().order(twolayerGreedy().base(twolayerAgg())))
    .nodeSize([200, 100])

  const { width, height } = layout(dag)

  // Calculate offset to center the diagram in the canvas (800x600)
  const offsetX = (800 - width) / 2
  const offsetY = (600 - height) / 2

  return (
    <Canvas enableZoom ref={handleNodeCanvasRef}>
      <defs>
        <style>
          {`
            .edge-completed {
              stroke-dasharray: 100%;
              stroke-dashoffset: 100%;
              animation: dash 1s ease-in-out forwards;
              stroke: rgb(61, 142, 61);
            }
          `}
        </style>
      </defs>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        <g id="edges-group">
          {[...dag.links()].map((link, index) => {
            const path = generateRoundedVerticalPath(link.source, link.target)
            const random = Math.random()
            const status: EdgeStatus =
              random < 1 / 3
                ? 'IDLE'
                : random < 2 / 3
                ? 'PROCESSING'
                : 'COMPLETED'
            return (
              <AnimatedEdge
                path={path}
                index={index}
                key={`edge-${index}`}
                status={status}
              />
            )
          })}
        </g>

        <g id="nodes-overlay">
          {[...dag.nodes()].map((node) => {
            const estimatedLayer = Math.round(node.y / 80)
            const darkness = 256 - estimatedLayer * 7.5
            const clamped = Math.max(darkness, 200)
            const fill = `rgb(${clamped},${clamped},${clamped})`

            return (
              <g
                key={node.data.id}
                transform={`translate(${node.x - 72}, ${node.y - 24})`}
              >
                <BaseNode id={node.data.id} variant="outline" fill={fill} />
              </g>
            )
          })}
        </g>
      </g>
    </Canvas>
  )
}

export default Example9
