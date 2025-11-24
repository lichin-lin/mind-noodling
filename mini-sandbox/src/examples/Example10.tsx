import Canvas from './Canvas'
import BaseNode from './node'
import { generateRoundedVerticalPath } from './pathUtils'
import { motion, AnimatePresence } from 'motion/react'
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

export function Example10() {
  const nodeData = [
    { id: '0', parentIds: [] },
    { id: '1', parentIds: [] },
    { id: '2', parentIds: ['0'] },
    { id: '3', parentIds: ['0'] },
    { id: '4', parentIds: ['0', '1'] },
    { id: '5', parentIds: ['1', '2'] },
    { id: '6', parentIds: ['1', '3', '4'] },
    { id: '7', parentIds: ['0', '2', '4'] },
  ]

  const [currentIndex, setCurrentIndex] = useState<string | null>('1')

  const builder = graphStratify()
    .id((d: { id: string }) => d.id)
    .parentIds((d: NodeData) => d.parentIds)

  const dag = builder(nodeData)
  const layout = sugiyama()
    .layering(layeringSimplex())
    .decross(decrossTwoLayer().order(twolayerGreedy().base(twolayerAgg())))
    .nodeSize([200, 100])

  const { width, height } = layout(dag)

  // Calculate offset to center the diagram
  const offsetX = (800 - width) / 2
  const offsetY = (600 - height) / 2

  const links = [...dag.links()]
  const dagNodes = [...dag.nodes()]

  return (
    <Canvas>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Inactive Edges (render first, behind, all) */}
        {links.map((link, index) => {
          const path = generateRoundedVerticalPath(link.source, link.target)
          return (
            <g key={`inactive-${index}`}>
              <motion.path
                d={path}
                fill="none"
                strokeWidth={3}
                stroke="rgba(255, 255, 255, 1)"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.path
                d={path}
                fill="none"
                strokeWidth={2}
                stroke="rgba(200, 200, 200, 1)"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </g>
          )
        })}

        {/* Active Edges (render last, on top) */}
        <AnimatePresence>
          {links.map((link, index) => {
            const isActive =
              currentIndex === link.source.data.id ||
              currentIndex === link.target.data.id
            if (!isActive) return null

            const path = generateRoundedVerticalPath(link.source, link.target)
            return (
              <motion.g
                key={`active-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  d={path}
                  fill="none"
                  strokeWidth={4}
                  stroke="rgba(255, 255, 255, 1)"
                />
                <path
                  d={path}
                  fill="none"
                  strokeWidth={3}
                  stroke="rgba(48, 48, 48, 1)"
                />
              </motion.g>
            )
          })}
        </AnimatePresence>

        {/* Nodes */}
        {dagNodes.map((node) => {
          const estimatedLayer = Math.round(node.y / 80)
          const darkness = 256 - estimatedLayer * 7.5
          const clamped = Math.max(darkness, 200)
          const fill = `rgb(${clamped},${clamped},${clamped})`

          return (
            <g
              key={node.data.id}
              transform={`translate(${node.x - 72}, ${node.y - 24})`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (currentIndex === node.data.id) {
                  setCurrentIndex(null)
                  return
                }
                setCurrentIndex(node.data.id)
              }}
            >
              <BaseNode id={node.data.id} variant="outline" fill={fill} />
            </g>
          )
        })}
      </g>
    </Canvas>
  )
}

export default Example10
