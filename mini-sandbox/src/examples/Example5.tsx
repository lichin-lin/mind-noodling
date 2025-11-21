import Canvas from './Canvas'
import BaseNode from './node'
import Edge from './edge'
import { generateRoundedVerticalPath } from './pathUtils'
import {
  graphStratify,
  sugiyama,
  layeringSimplex,
  decrossTwoLayer,
  twolayerGreedy,
  twolayerAgg,
} from 'd3-dag'

type NodeData = { id: string; parentIds: string[] }

export function Example5() {
  const nodes = Array.from({ length: 10 }, (_, i) => {
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
    <Canvas>
      <g transform={`translate(${offsetX}, ${offsetY})`}>
        {/* Curved Edges */}
        {[...dag.links()].map((link, index) => {
          const path = generateRoundedVerticalPath(link.source, link.target)
          return (
            <Edge
              key={index}
              x1={0}
              y1={0}
              x2={0}
              y2={0}
              curved={true}
              pathData={path}
              delay={0.3}
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

export default Example5
