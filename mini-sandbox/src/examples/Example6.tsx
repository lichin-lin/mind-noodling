import Canvas from './Canvas'
import BaseNode from './node'
import Edge from './edge'
import { generateRoundedVerticalPath } from './pathUtils'
import { motion } from 'motion/react'
import { useState } from 'react'
import {
  graphStratify,
  sugiyama,
  layeringSimplex,
  decrossTwoLayer,
  twolayerGreedy,
  twolayerAgg,
} from 'd3-dag'

type NodeData = { id: string; parentIds: string[] }

export function Example6() {
  const [replayKey, setReplayKey] = useState(0)
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
    <Canvas onReplay={() => setReplayKey((prev) => prev + 1)}>
      <defs>
        <style>
          {`
            @keyframes dash {
              0% {
                stroke-dashoffset: 100%;
              }
              100% {
                stroke-dashoffset: 0%;
              }
            }
            .fill-edge {
              stroke-dasharray: 100%;
              stroke-dashoffset: 100%;
              animation: dash 2s ease-in-out forwards;
            }
          `}
        </style>
      </defs>
      <g key={replayKey} transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Curved Edges with Particles */}
        {[...dag.links()].map((link, index) => {
          const path = generateRoundedVerticalPath(link.source, link.target)
          const sourceNodeIndex = parseInt(link.source.data.id)
          const delay = sourceNodeIndex * 0.3 + index * 0.2

          return (
            <g key={index}>
              {/* Base edge (static) */}
              <Edge
                x1={0}
                y1={0}
                x2={0}
                y2={0}
                curved={true}
                pathData={path}
                delay={0}
                stroke="#CCC"
              />
              {/* Animated fill edge */}
              <motion.path
                d={path}
                fill="none"
                stroke="#333"
                strokeWidth={2}
                className="fill-edge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{
                  animationDelay: `${delay}s`,
                }}
              />
            </g>
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

export default Example6
