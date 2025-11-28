import Canvas from './Canvas'
import BaseNode from './node'
import { generateRoundedVerticalPath } from './pathUtils'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
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

let globalReplayTrigger = 0

interface AnimatedEdgeProps {
  path: string
  index: number
  initialDelay: number
}

const AnimatedEdge = ({ path, index, initialDelay }: AnimatedEdgeProps) => {
  const maskId = `mask-${index}`
  const pathId = `path-${index}`
  const gradIdle = `idle-grad-${index}`
  const gradProc = `proc-grad-${index}`
  const idleAnimationRunTime = '2s'
  const processingAnimationRunTime = '4s'
  const [localState, setLocalState] = useState<EdgeStatus>('IDLE')
  const [replayTrigger, setReplayTrigger] = useState(0)

  useEffect(() => {
    const checkReplay = setInterval(() => {
      if (globalReplayTrigger !== replayTrigger) {
        setReplayTrigger(globalReplayTrigger)
        setLocalState('IDLE')
      }
    }, 100)
    return () => clearInterval(checkReplay)
  }, [replayTrigger])

  useEffect(() => {
    // Start from IDLE
    setLocalState('IDLE')

    // After initialDelay, move to PROCESSING
    const toProcessing = setTimeout(() => {
      setLocalState('PROCESSING')
    }, initialDelay)

    // After initialDelay + 3000ms, move to COMPLETED
    const toCompleted = setTimeout(() => {
      setLocalState('COMPLETED')
    }, initialDelay + 3000)

    return () => {
      clearTimeout(toProcessing)
      clearTimeout(toCompleted)
    }
  }, [initialDelay, replayTrigger])

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
            strokeWidth={2}
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

export function Example8() {
  const [replayKey, setReplayKey] = useState(0)

  const handleReplay = () => {
    globalReplayTrigger++
    setReplayKey((prev) => prev + 1)
  }

  const nodes = Array.from({ length: 8 }, (_, i) => {
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
    <Canvas onReplay={handleReplay}>
      <defs>
        <style>
          {`
            .edge-completed {
              stroke-dasharray: 100%;
              stroke-dashoffset: 100%;
              animation: dash 1s ease-in-out forwards;
              stroke: rgb(74, 172, 74);
          `}
        </style>
      </defs>
      <g key={replayKey} transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Curved Edges with States */}
        {[...dag.links()].map((link, index) => {
          const path = generateRoundedVerticalPath(link.source, link.target)
          // Random delay between 0-3000ms for staggered animations
          const initialDelay = Math.random() * 3000
          return (
            <AnimatedEdge
              path={path}
              index={index}
              key={`edge-${index}`}
              initialDelay={initialDelay}
            />
          )
        })}

        {/* Nodes */}
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
    </Canvas>
  )
}

export default Example8
