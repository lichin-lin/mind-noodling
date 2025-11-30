import type {
  BlockID,
  Block,
  LoopHeader,
  LayoutNode,
  LayoutNodeID,
  BlockNode,
  DummyNode,
  LayoutResult,
  Vec2,
  Edge,
  GraphData,
  GraphNode,
} from './GraphLayoutTypes.js'
import {
  LEFTMOST_DUMMY,
  RIGHTMOST_DUMMY,
  IMMINENT_BACKEDGE_DUMMY,
} from './GraphLayoutTypes.js'

// Default layout configuration
const DEFAULT_OPTIONS = {
  contentPadding: 200,
  blockGap: 40,
  portStart: 20,
  portSpacing: 10,
  arrowRadius: 12,
  trackPadding: 15,
  jointSpacing: 10,
  headerArrowPushdown: 14,
  layoutIterations: 2,
  nearlyStraight: 30,
  nearlyStraightIterations: 8,
  allSplit: false,
  layoutStep: 6,
  stopAtPass: 30,
  debug: true,
} as const

export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}

// ============================================================================
// Helper Functions
// ============================================================================

// Framerate-independent lerp smoothing, as sourced from the following talk
// by Freya Holmér: https://youtu.be/LSNQuFEDOyQ?si=VqUxBF2r7mfnuba8
export function filerp(
  current: number,
  target: number,
  r: number,
  dt: number
): number {
  return (current - target) * Math.pow(r, dt) + target
}

export type Falsy = null | undefined | false | 0 | -0 | 0n | ''

export function assert<T>(
  cond: T | Falsy,
  msg?: string,
  soft = false
): asserts cond is T {
  if (!cond) {
    if (soft) {
      console.error(msg ?? 'Assertion failed')
    } else {
      throw new Error(msg ?? 'Assertion failed')
    }
  }
}

export function must<T>(val: T | Falsy, msg?: string): T {
  assert(val, msg)
  return val
}

// ============================================================================
// Layout Options
// ============================================================================

export interface GraphLayoutOptions {
  // Spacing
  contentPadding?: number
  blockGap?: number
  portStart?: number
  portSpacing?: number
  arrowRadius?: number
  trackPadding?: number
  jointSpacing?: number
  headerArrowPushdown?: number

  // Algorithm parameters
  layoutIterations?: number
  nearlyStraight?: number
  nearlyStraightIterations?: number
  allSplit?: boolean
  layoutStep?: number
  stopAtPass?: number

  // Debug
  debug?: boolean
}

// ============================================================================
// Type Guards
// ============================================================================

export function isTrueLH(block: Block): block is LoopHeader {
  return block.attributes.includes('loopheader')
}

export function isLH(block: Block): block is LoopHeader {
  return (block as any).loopHeight !== undefined
}

export function asTrueLH(block: Block | undefined): LoopHeader {
  assert(block)
  if (isTrueLH(block)) {
    return block
  }
  throw new Error('Block is not a LoopHeader')
}

export function asLH(block: Block | undefined): LoopHeader {
  assert(block)
  if (isLH(block)) {
    return block as LoopHeader
  }
  throw new Error('Block is not a pseudo LoopHeader')
}

// ============================================================================
// GraphLayout Class
// ============================================================================

/**
 * Pure layout algorithm for iongraph.
 * Takes GraphData and produces positioned layout nodes.
 */
export class GraphLayout {
  private blocks: Block[]
  private blocksByID: Map<BlockID, Block>
  private numLayers: number = 0
  private options: Required<GraphLayoutOptions>

  constructor(graphData: GraphData, options: GraphLayoutOptions = {}) {
    // Compute predecessors from successors
    const predecessorsMap = new Map<number, number[]>()
    for (const node of graphData.nodes) {
      if (!predecessorsMap.has(node.id)) {
        predecessorsMap.set(node.id, [])
      }
      for (const succId of node.successors) {
        if (!predecessorsMap.has(succId)) {
          predecessorsMap.set(succId, [])
        }
        predecessorsMap.get(succId)!.push(node.id)
      }
    }

    // Convert GraphData nodes to internal Block format
    this.blocks = graphData.nodes.map((node: GraphNode) => {
      const attributes: string[] = []
      if (node.isLoopHeader) attributes.push('loopheader')
      if (node.isBackedge) attributes.push('backedge')

      const block = {
        id: node.id as any, // Cast to BlockID
        loopDepth: node.loopDepth || 0,
        attributes,
        predecessors:
          predecessorsMap.get(node.id)?.map((id) => id as any) || [],
        successors: node.successors.map((id) => id as any),
        instructions: [], // Empty, not needed for layout
        preds: [], // Will be filled in compute()
        succs: [], // Will be filled in compute()
        layer: -1,
        loopID: -1 as any,
        size: { x: 144, y: 48 }, // Default size
        lir: null,
        el: null as any,
        layoutNode: null as any,
      } as Block

      // Initialize loop header properties
      if (node.isLoopHeader) {
        const lh = block as any
        lh.loopHeight = 0
        lh.parentLoop = null
        lh.outgoingEdges = []
      }

      return block
    })

    this.blocksByID = new Map()
    for (const block of this.blocks) {
      this.blocksByID.set(block.id, block)
    }

    // Merge with defaults
    this.options = {
      contentPadding: options.contentPadding ?? DEFAULT_OPTIONS.contentPadding,
      blockGap: options.blockGap ?? DEFAULT_OPTIONS.blockGap,
      portStart: options.portStart ?? DEFAULT_OPTIONS.portStart,
      portSpacing: options.portSpacing ?? DEFAULT_OPTIONS.portSpacing,
      arrowRadius: options.arrowRadius ?? DEFAULT_OPTIONS.arrowRadius,
      trackPadding: options.trackPadding ?? DEFAULT_OPTIONS.trackPadding,
      jointSpacing: options.jointSpacing ?? DEFAULT_OPTIONS.jointSpacing,
      headerArrowPushdown:
        options.headerArrowPushdown ?? DEFAULT_OPTIONS.headerArrowPushdown,
      layoutIterations:
        options.layoutIterations ?? DEFAULT_OPTIONS.layoutIterations,
      nearlyStraight: options.nearlyStraight ?? DEFAULT_OPTIONS.nearlyStraight,
      nearlyStraightIterations:
        options.nearlyStraightIterations ??
        DEFAULT_OPTIONS.nearlyStraightIterations,
      allSplit: options.allSplit ?? DEFAULT_OPTIONS.allSplit,
      layoutStep: options.layoutStep ?? DEFAULT_OPTIONS.layoutStep,
      stopAtPass: options.stopAtPass ?? DEFAULT_OPTIONS.stopAtPass,
      debug: options.debug ?? DEFAULT_OPTIONS.debug,
    }
  }

  /**
   * Main entry point for computing graph layout.
   * Returns the positioned layout nodes and associated metrics.
   */
  compute(): LayoutResult {
    // Initialize block references
    for (const block of this.blocks) {
      block.preds = block.predecessors.map((id) => this.blocksByID.get(id)!)
      block.succs = block.successors.map((id) => this.blocksByID.get(id)!)

      // Set backedge for loop headers
      if (block.attributes.includes('loopheader')) {
        const backedges = block.preds.filter((b) =>
          b.attributes.includes('backedge')
        )
        if (backedges.length === 1) {
          ;(block as any).backedge = backedges[0]
        }
      }
    }

    const roots = this.blocks.filter((b) => b.predecessors.length === 0)

    // Make the roots into pseudo loop headers.
    for (const r of roots) {
      const root = r as LoopHeader
      root.loopHeight = 0
      root.parentLoop = null
      root.outgoingEdges = []
      Object.defineProperty(root, 'backedge', {
        get() {
          throw new Error(
            "Accessed .backedge on a pseudo loop header! Don't do that."
          )
        },
        configurable: true,
      })
    }

    for (const r of roots) {
      this.findLoops(r)
      this.layer(r)
    }

    // Step 1: layering only (no dummies)
    if (this.options.layoutStep === 1) {
      const layoutNodesByLayer = this.makeSimpleLayerNodes()
      const trackHeights = new Array(layoutNodesByLayer.length).fill(0)
      const layerHeights = this.verticalize(layoutNodesByLayer, trackHeights)
      const size = this.computeSize(layoutNodesByLayer)
      const edges = this.computeEdges(
        layoutNodesByLayer,
        layerHeights,
        trackHeights
      )
      return {
        nodesByLayer: layoutNodesByLayer,
        layerHeights,
        trackHeights,
        edges,
        size,
        numLayers: this.numLayers,
      }
    }

    // Step 2+: add dummy nodes
    const layoutNodesByLayer = this.makeLayoutNodes()

    // If we haven't computed joint tracks yet (steps 2–3), ensure
    // jointOffsets exist so rendering and refinement can proceed safely.
    if (this.options.layoutStep < 4) {
      for (const nodes of layoutNodesByLayer) {
        for (const node of nodes) {
          node.jointOffsets = new Array(node.dstNodes.length).fill(0)
        }
      }
    }

    // Step 3: horizontal refinement passes
    if (this.options.layoutStep >= 3) {
      this.straightenEdges(layoutNodesByLayer)
    }

    // Step 4: joint tracks
    const trackHeights =
      this.options.layoutStep >= 4
        ? this.finagleJoints(layoutNodesByLayer)
        : new Array(layoutNodesByLayer.length).fill(0)

    // Step 5: vertical placement
    const layerHeights = this.verticalize(layoutNodesByLayer, trackHeights)

    const size = this.computeSize(layoutNodesByLayer)

    // Step 6: compute edge routing
    const edges = this.computeEdges(
      layoutNodesByLayer,
      layerHeights,
      trackHeights
    )

    return {
      nodesByLayer: layoutNodesByLayer,
      layerHeights,
      trackHeights,
      edges,
      size,
      numLayers: this.numLayers,
    }
  }

  // ==========================================================================
  // Loop Detection
  // ==========================================================================

  /**
   * Walks through the graph tracking which loop each block belongs to.
   */
  private findLoops(block: Block, loopIDsByDepth: BlockID[] | null = null) {
    if (loopIDsByDepth === null) {
      loopIDsByDepth = [block.id]
    }

    // Early out if we already have a loop ID.
    if (block.loopID >= 0) {
      return
    }

    if (isTrueLH(block)) {
      assert(block.loopDepth === loopIDsByDepth.length)
      const parentID = loopIDsByDepth[loopIDsByDepth.length - 1]
      const parent = asLH(this.blocksByID.get(parentID))
      block.parentLoop = parent

      loopIDsByDepth = [...loopIDsByDepth, block.id]
    }

    if (block.loopDepth < loopIDsByDepth.length - 1) {
      loopIDsByDepth = loopIDsByDepth.slice(0, block.loopDepth + 1)
    } else if (block.loopDepth >= loopIDsByDepth.length) {
      block.loopDepth = loopIDsByDepth.length - 1
    }
    block.loopID = loopIDsByDepth[block.loopDepth]

    if (!block.attributes.includes('backedge')) {
      for (const succ of block.succs) {
        this.findLoops(succ, loopIDsByDepth)
      }
    }
  }

  // ==========================================================================
  // Layering
  // ==========================================================================

  /**
   * Assign horizontal layers.
   */
  private layer(block: Block, layer = 0) {
    if (block.attributes.includes('backedge')) {
      block.layer = block.succs[0].layer
      return
    }

    if (layer <= block.layer) {
      return
    }

    block.layer = Math.max(block.layer, layer)
    this.numLayers = Math.max(block.layer + 1, this.numLayers)

    let loopHeader: LoopHeader | null = asLH(this.blocksByID.get(block.loopID))
    while (loopHeader) {
      loopHeader.loopHeight = Math.max(
        loopHeader.loopHeight,
        block.layer - loopHeader.layer + 1
      )
      loopHeader = loopHeader.parentLoop
    }

    for (const succ of block.succs) {
      if (succ.loopDepth < block.loopDepth) {
        const loopHeader = asLH(this.blocksByID.get(block.loopID))
        loopHeader.outgoingEdges.push(succ)
      } else {
        this.layer(succ, layer + 1)
      }
    }

    if (isTrueLH(block)) {
      for (const succ of block.outgoingEdges) {
        this.layer(succ, layer + block.loopHeight)
      }
    }
  }

  // ==========================================================================
  // Simple Layout Nodes (Step 1)
  // ==========================================================================

  /**
   * Build minimal layout nodes from layered blocks (no dummies), for Step 1
   */
  private makeSimpleLayerNodes(): LayoutNode[][] {
    const { contentPadding } = this.options

    const blocksByLayerObj: { [layer: number]: Block[] } = {}
    for (const block of this.blocks) {
      if (!blocksByLayerObj[block.layer]) {
        blocksByLayerObj[block.layer] = []
      }
      blocksByLayerObj[block.layer].push(block)
    }
    const blocksByLayer = Object.entries(blocksByLayerObj)
      .map(([layer, blocks]) => [Number(layer), blocks] as const)
      .sort((a, b) => a[0] - b[0])
      .map(([_, blocks]) => blocks)

    let nodeID = 0 as LayoutNodeID
    const layoutNodesByLayer: LayoutNode[][] = blocksByLayer.map(() => [])

    // First pass: create nodes
    for (const [layer, blocks] of blocksByLayer.entries()) {
      for (const block of blocks) {
        const node: BlockNode = {
          id: nodeID++ as LayoutNodeID,
          pos: { x: contentPadding, y: contentPadding },
          size: block.size,
          block: block,
          srcNodes: [],
          dstNodes: [],
          jointOffsets: [],
          flags: 0,
        }
        layoutNodesByLayer[layer].push(node)
        block.layoutNode = node
      }
    }

    // Second pass: connect edges without dummies
    for (const nodes of layoutNodesByLayer) {
      for (const node of nodes) {
        if (!node.block) continue
        node.dstNodes = node.block.succs.map((succ) => succ.layoutNode)
        node.jointOffsets = new Array(node.dstNodes.length).fill(0)
        for (const dst of node.dstNodes) {
          if (!dst.srcNodes.includes(node)) {
            dst.srcNodes.push(node)
          }
        }
      }
    }

    return layoutNodesByLayer
  }

  // ==========================================================================
  // Full Layout Nodes (with Dummies)
  // ==========================================================================

  /**
   * Convert layered blocks into layout nodes, inserting dummies for edges
   * that span layers.
   */
  private makeLayoutNodes(): LayoutNode[][] {
    function connectNodes(from: LayoutNode, fromPort: number, to: LayoutNode) {
      from.dstNodes[fromPort] = to
      if (!to.srcNodes.includes(from)) {
        to.srcNodes.push(from)
      }
    }

    let blocksByLayer: Block[][]
    {
      const blocksByLayerObj: { [layer: number]: Block[] } = {}
      for (const block of this.blocks) {
        if (!blocksByLayerObj[block.layer]) {
          blocksByLayerObj[block.layer] = []
        }
        blocksByLayerObj[block.layer].push(block)
      }
      blocksByLayer = Object.entries(blocksByLayerObj)
        .map(([layer, blocks]) => [Number(layer), blocks] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([_, blocks]) => blocks)
    }

    type IncompleteEdge = {
      src: LayoutNode
      srcPort: number
      dstBlock: Block
    }

    let nodeID = 0 as LayoutNodeID

    const layoutNodesByLayer: LayoutNode[][] = blocksByLayer.map(() => [])
    const activeEdges: IncompleteEdge[] = []
    const latestDummiesForBackedges = new Map<Block, DummyNode>()

    for (const [layer, blocks] of blocksByLayer.entries()) {
      // Delete any active edges that terminate at this layer
      const terminatingEdges: IncompleteEdge[] = []
      for (const block of blocks) {
        for (let i = activeEdges.length - 1; i >= 0; i--) {
          const edge = activeEdges[i]
          if (edge.dstBlock === block) {
            terminatingEdges.unshift(edge)
            activeEdges.splice(i, 1)
          }
        }
      }

      // Create dummy nodes for active edges
      const dummiesByDest: Map<number, DummyNode> = new Map()
      for (const edge of activeEdges) {
        let dummy: DummyNode

        if (!this.options.allSplit) {
          const existingDummy = dummiesByDest.get(edge.dstBlock.id)
          if (existingDummy) {
            connectNodes(edge.src, edge.srcPort, existingDummy)
            dummy = existingDummy
          } else {
            const newDummy: DummyNode = {
              id: nodeID++ as LayoutNodeID,
              pos: {
                x: this.options.contentPadding,
                y: this.options.contentPadding,
              },
              size: { x: 0, y: 0 },
              block: null,
              srcNodes: [],
              dstNodes: [],
              dstBlock: edge.dstBlock,
              jointOffsets: [],
              flags: 0,
            }
            connectNodes(edge.src, edge.srcPort, newDummy)
            layoutNodesByLayer[layer].push(newDummy)
            dummiesByDest.set(edge.dstBlock.id, newDummy)
            dummy = newDummy
          }
        } else {
          const newDummy: DummyNode = {
            id: nodeID++ as LayoutNodeID,
            pos: {
              x: this.options.contentPadding,
              y: this.options.contentPadding,
            },
            size: { x: 0, y: 0 },
            block: null,
            srcNodes: [],
            dstNodes: [],
            dstBlock: edge.dstBlock,
            jointOffsets: [],
            flags: 0,
          }
          connectNodes(edge.src, edge.srcPort, newDummy)
          layoutNodesByLayer[layer].push(newDummy)
          dummy = newDummy
        }

        edge.src = dummy
        edge.srcPort = 0
      }

      // Track which blocks will get backedge dummy nodes
      interface PendingLoopDummy {
        loopID: BlockID
        block: Block
      }
      const pendingLoopDummies: PendingLoopDummy[] = []
      for (const block of blocks) {
        let currentLoopHeader = asLH(this.blocksByID.get(block.loopID))
        while (isTrueLH(currentLoopHeader)) {
          const existing = pendingLoopDummies.find(
            (d) => d.loopID === currentLoopHeader.id
          )
          if (existing) {
            existing.block = block
          } else {
            pendingLoopDummies.push({
              loopID: currentLoopHeader.id,
              block: block,
            })
          }

          const parentLoop = currentLoopHeader.parentLoop
          if (!parentLoop) {
            break
          }
          currentLoopHeader = parentLoop
        }
      }

      // Create real nodes for each block on the layer
      const backedgeEdges: IncompleteEdge[] = []
      for (const block of blocks) {
        const node: BlockNode = {
          id: nodeID++ as LayoutNodeID,
          pos: {
            x: this.options.contentPadding,
            y: this.options.contentPadding,
          },
          size: block.size,
          block: block,
          srcNodes: [],
          dstNodes: [],
          jointOffsets: [],
          flags: 0,
        }
        for (const edge of terminatingEdges) {
          if (edge.dstBlock === block) {
            connectNodes(edge.src, edge.srcPort, node)
          }
        }
        layoutNodesByLayer[layer].push(node)
        block.layoutNode = node

        // Create dummy nodes for backedges
        for (const loopDummy of pendingLoopDummies.filter(
          (d) => d.block === block
        )) {
          const backedge = asLH(this.blocksByID.get(loopDummy.loopID)).backedge
          const backedgeDummy: DummyNode = {
            id: nodeID++ as LayoutNodeID,
            pos: {
              x: this.options.contentPadding,
              y: this.options.contentPadding,
            },
            size: { x: 0, y: 0 },
            block: null,
            srcNodes: [],
            dstNodes: [],
            dstBlock: backedge,
            jointOffsets: [],
            flags: 0,
          }

          const latestDummy = latestDummiesForBackedges.get(backedge)
          if (latestDummy) {
            connectNodes(backedgeDummy, 0, latestDummy)
          } else {
            backedgeDummy.flags |= IMMINENT_BACKEDGE_DUMMY
            connectNodes(backedgeDummy, 0, backedge.layoutNode)
          }
          layoutNodesByLayer[layer].push(backedgeDummy)
          latestDummiesForBackedges.set(backedge, backedgeDummy)
        }

        if (block.attributes.includes('backedge')) {
          connectNodes(block.layoutNode, 0, block.succs[0].layoutNode)
        } else {
          for (const [i, succ] of block.succs.entries()) {
            if (succ.attributes.includes('backedge')) {
              backedgeEdges.push({ src: node, srcPort: i, dstBlock: succ })
            } else {
              activeEdges.push({ src: node, srcPort: i, dstBlock: succ })
            }
          }
        }
      }
      for (const edge of backedgeEdges) {
        const backedgeDummy = must(latestDummiesForBackedges.get(edge.dstBlock))
        connectNodes(edge.src, edge.srcPort, backedgeDummy)
      }
    }

    // Prune backedge dummies that don't have a source
    this.pruneOrphanedBackedgeDummies(layoutNodesByLayer)

    // Mark leftmost and rightmost dummies
    this.markEdgeDummies(layoutNodesByLayer)

    // Validation
    this.validateLayoutNodes(layoutNodesByLayer)

    return layoutNodesByLayer
  }

  private pruneOrphanedBackedgeDummies(layoutNodesByLayer: LayoutNode[][]) {
    const orphanRoots: DummyNode[] = []
    for (const dummy of backedgeDummies(layoutNodesByLayer)) {
      if (dummy.srcNodes.length === 0) {
        orphanRoots.push(dummy)
      }
    }

    const removedNodes = new Set<LayoutNode>()
    for (const orphan of orphanRoots) {
      let current: LayoutNode = orphan
      while (current.block === null && current.srcNodes.length === 0) {
        pruneNode(current)
        removedNodes.add(current)
        assert(current.dstNodes.length === 1)
        current = current.dstNodes[0]
      }
    }
    for (const nodes of layoutNodesByLayer) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (removedNodes.has(nodes[i])) {
          nodes.splice(i, 1)
        }
      }
    }
  }

  private markEdgeDummies(layoutNodesByLayer: LayoutNode[][]) {
    for (const nodes of layoutNodesByLayer) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].block === null) {
          nodes[i].flags |= LEFTMOST_DUMMY
        } else {
          break
        }
      }
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].block === null) {
          nodes[i].flags |= RIGHTMOST_DUMMY
        } else {
          break
        }
      }
    }
  }

  private validateLayoutNodes(layoutNodesByLayer: LayoutNode[][]) {
    for (const layer of layoutNodesByLayer) {
      for (const node of layer) {
        if (node.block) {
          assert(
            node.dstNodes.length === node.block.successors.length,
            `expected node ${node.id} for block ${node.block.id} to have ${node.block.successors.length} destination nodes, but got ${node.dstNodes.length} instead`
          )
        } else {
          assert(
            node.dstNodes.length === 1,
            `expected dummy node ${node.id} to have only one destination node, but got ${node.dstNodes.length} instead`
          )
        }
        for (let i = 0; i < node.dstNodes.length; i++) {
          assert(
            node.dstNodes[i] !== undefined,
            `dst slot ${i} of node ${node.id} was undefined`
          )
        }
      }
    }
  }

  // ==========================================================================
  // Edge Straightening
  // ==========================================================================

  /**
   * Horizontal refinement without reordering nodes.
   */
  private straightenEdges(layoutNodesByLayer: LayoutNode[][]) {
    const pushNeighbors = (nodes: LayoutNode[]) => {
      for (let i = 0; i < nodes.length - 1; i++) {
        const node = nodes[i]
        const neighbor = nodes[i + 1]

        const firstNonDummy = node.block === null && neighbor.block !== null
        const nodeRightPlusPadding =
          node.pos.x +
          node.size.x +
          (firstNonDummy ? this.options.portStart : 0) +
          this.options.blockGap
        neighbor.pos.x = Math.max(neighbor.pos.x, nodeRightPlusPadding)
      }
    }

    const pushIntoLoops = () => {
      for (const nodes of layoutNodesByLayer) {
        for (const node of nodes) {
          if (node.block === null) {
            continue
          }

          const loopHeader =
            node.block.loopID !== null
              ? asLH(this.blocksByID.get(node.block.loopID))
              : null
          if (loopHeader) {
            const loopHeaderNode = loopHeader.layoutNode
            node.pos.x = Math.max(node.pos.x, loopHeaderNode.pos.x)
          }
        }
      }
    }

    const straightenDummyRuns = () => {
      const dummyLinePositions = new Map<Block, number>()
      for (const dummy of dummies(layoutNodesByLayer)) {
        const dst = dummy.dstBlock
        let desiredX = dummy.pos.x
        dummyLinePositions.set(
          dst,
          Math.max(dummyLinePositions.get(dst) ?? 0, desiredX)
        )
      }

      const dummiesToStraighten = this.options.allSplit
        ? backedgeDummies(layoutNodesByLayer)
        : dummies(layoutNodesByLayer)

      for (const dummy of dummiesToStraighten) {
        const dst = dummy.dstBlock
        const x = dummyLinePositions.get(dst)
        assert(x !== undefined, `no position for destination ${dst.id}`)
        dummy.pos.x = x!
      }

      if (!this.options.allSplit) {
        for (const nodes of layoutNodesByLayer) {
          pushNeighbors(nodes)
        }
      }
    }

    const suckInLeftmostDummies = () => {
      const dummyRunPositions = new Map<Block, number>()
      for (const nodes of layoutNodesByLayer) {
        let i = 0
        let nextX = 0
        for (; i < nodes.length; i++) {
          if (!(nodes[i].flags & LEFTMOST_DUMMY)) {
            nextX = nodes[i].pos.x
            break
          }
        }

        i -= 1
        nextX -= this.options.blockGap + this.options.portStart
        for (; i >= 0; i--) {
          const dummy = nodes[i] as DummyNode
          assert(dummy.block === null && dummy.flags & LEFTMOST_DUMMY)
          let maxSafeX = nextX
          for (const src of dummy.srcNodes) {
            const srcX =
              src.pos.x + src.dstNodes.indexOf(dummy) * this.options.portSpacing
            if (srcX < maxSafeX) {
              maxSafeX = srcX
            }
          }
          if (dummy.dstBlock.layoutNode.pos.x < maxSafeX) {
            maxSafeX = dummy.dstBlock.layoutNode.pos.x
          }
          dummy.pos.x = maxSafeX
          nextX = dummy.pos.x - this.options.blockGap
          dummyRunPositions.set(
            dummy.dstBlock,
            Math.min(
              dummyRunPositions.get(dummy.dstBlock) ?? Infinity,
              maxSafeX
            )
          )
        }
      }

      const dummiesToApply = this.options.allSplit
        ? backedgeDummies(layoutNodesByLayer)
        : dummies(layoutNodesByLayer)

      for (const dummy of dummiesToApply) {
        if (!(dummy.flags & LEFTMOST_DUMMY)) {
          continue
        }
        const x = dummyRunPositions.get(dummy.dstBlock)
        assert(
          x !== undefined,
          `no position for run to block ${dummy.dstBlock.id}`
        )
        dummy.pos.x = x!
      }
    }

    const straightenChildren = () => {
      for (let layer = 0; layer < layoutNodesByLayer.length - 1; layer++) {
        const nodes = layoutNodesByLayer[layer]

        pushNeighbors(nodes)

        let lastShifted = -1
        for (const node of nodes) {
          for (const [srcPort, dst] of node.dstNodes.entries()) {
            let dstIndexInNextLayer = layoutNodesByLayer[layer + 1].indexOf(dst)
            if (dstIndexInNextLayer > lastShifted && dst.srcNodes[0] === node) {
              const srcPortOffset =
                this.options.portStart + this.options.portSpacing * srcPort
              const dstPortOffset = this.options.portStart

              let xBefore = dst.pos.x
              dst.pos.x = Math.max(
                dst.pos.x,
                node.pos.x + srcPortOffset - dstPortOffset
              )
              if (dst.pos.x !== xBefore) {
                lastShifted = dstIndexInNextLayer
              }
            }
          }
        }
      }
    }

    const straightenConservative = () => {
      for (const nodes of layoutNodesByLayer) {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const node = nodes[i]

          if (!node.block || node.block.attributes.includes('backedge')) {
            continue
          }

          let deltasToTry: number[] = []
          for (const parent of node.srcNodes) {
            const srcPortOffset =
              this.options.portStart +
              parent.dstNodes.indexOf(node) * this.options.portSpacing
            const dstPortOffset = this.options.portStart
            deltasToTry.push(
              parent.pos.x + srcPortOffset - (node.pos.x + dstPortOffset)
            )
          }
          for (const [srcPort, dst] of node.dstNodes.entries()) {
            if (
              dst.block === null &&
              dst.dstBlock.attributes.includes('backedge')
            ) {
              continue
            }
            const srcPortOffset =
              this.options.portStart + srcPort * this.options.portSpacing
            const dstPortOffset = this.options.portStart
            deltasToTry.push(
              dst.pos.x + dstPortOffset - (node.pos.x + srcPortOffset)
            )
          }
          if (deltasToTry.includes(0)) {
            continue
          }
          deltasToTry = deltasToTry.filter((d) => d > 0).sort((a, b) => a - b)

          for (const delta of deltasToTry) {
            let overlapsAny = false
            for (let j = i + 1; j < nodes.length; j++) {
              const other = nodes[j]
              if (other.flags & RIGHTMOST_DUMMY) {
                continue
              }
              const a1 = node.pos.x + delta,
                a2 = node.pos.x + delta + node.size.x
              const b1 = other.pos.x - this.options.blockGap,
                b2 = other.pos.x + other.size.x + this.options.blockGap
              const overlaps = a2 >= b1 && a1 <= b2
              if (overlaps) {
                overlapsAny = true
              }
            }
            if (!overlapsAny) {
              node.pos.x += delta
              break
            }
          }
        }

        pushNeighbors(nodes)
      }
    }

    const straightenNearlyStraightEdgesUp = () => {
      for (let layer = layoutNodesByLayer.length - 1; layer >= 0; layer--) {
        const nodes = layoutNodesByLayer[layer]

        pushNeighbors(nodes)

        for (const node of nodes) {
          for (const src of node.srcNodes) {
            if (src.block !== null) {
              continue
            }

            const wiggle = Math.abs(src.pos.x - node.pos.x)
            if (wiggle <= this.options.nearlyStraight) {
              src.pos.x = Math.max(src.pos.x, node.pos.x)
              node.pos.x = Math.max(src.pos.x, node.pos.x)
            }
          }
        }
      }
    }

    const straightenNearlyStraightEdgesDown = () => {
      for (let layer = 0; layer < layoutNodesByLayer.length; layer++) {
        const nodes = layoutNodesByLayer[layer]

        pushNeighbors(nodes)

        for (const node of nodes) {
          if (node.dstNodes.length === 0) {
            continue
          }
          const dst = node.dstNodes[0]
          if (dst.block !== null) {
            continue
          }

          const wiggle = Math.abs(dst.pos.x - node.pos.x)
          if (wiggle <= this.options.nearlyStraight) {
            dst.pos.x = Math.max(dst.pos.x, node.pos.x)
            node.pos.x = Math.max(dst.pos.x, node.pos.x)
          }
        }
      }
    }

    function repeat<T>(a: T[], n: number): T[] {
      const result: T[] = []
      for (let i = 0; i < +n; i++) {
        for (const item of a) {
          result.push(item)
        }
      }
      return result
    }

    // Execute refinement passes
    const passes = [
      ...repeat(
        [straightenChildren, pushIntoLoops, straightenDummyRuns],
        this.options.layoutIterations
      ),
      straightenDummyRuns,
      ...repeat(
        [straightenNearlyStraightEdgesUp, straightenNearlyStraightEdgesDown],
        this.options.nearlyStraightIterations
      ),
      straightenConservative,
      straightenDummyRuns,
      suckInLeftmostDummies,
    ]
    assert(
      passes.length <= this.options.stopAtPass,
      `stopAtPass was too small - should be at least ${passes.length}`
    )
    for (const [i, pass] of passes.entries()) {
      if (i < this.options.stopAtPass) {
        pass()
      }
    }
  }

  // ==========================================================================
  // Joint Track Assignment
  // ==========================================================================

  /**
   * Assign vertical offsets to horizontal edge segments (joints).
   */
  private finagleJoints(layoutNodesByLayer: LayoutNode[][]): number[] {
    interface Joint {
      x1: number
      x2: number
      src: LayoutNode
      srcPort: number
      dst: LayoutNode
    }

    const trackHeights: number[] = []

    for (const nodes of layoutNodesByLayer) {
      const joints: Joint[] = []
      for (const node of nodes) {
        node.jointOffsets = new Array(node.dstNodes.length).fill(0)

        if (node.block?.attributes.includes('backedge')) {
          continue
        }

        for (const [srcPort, dst] of node.dstNodes.entries()) {
          const x1 =
            node.pos.x +
            this.options.portStart +
            this.options.portSpacing * srcPort
          const incomingIndex = Math.max(0, dst.srcNodes.indexOf(node))
          const isBackedgeDummy =
            dst.block === null && dst.dstBlock.attributes.includes('backedge')
          const dstPortIndex =
            isBackedgeDummy || !this.options.allSplit ? 0 : incomingIndex
          const x2 =
            dst.pos.x +
            this.options.portStart +
            this.options.portSpacing * dstPortIndex

          if (Math.abs(x2 - x1) < 2 * this.options.arrowRadius) {
            continue
          }
          joints.push({ x1, x2, src: node, srcPort, dst })
        }
      }

      joints.sort((a, b) => a.x1 - b.x1)

      const rightwardTracks: Joint[][] = []
      const leftwardTracks: Joint[][] = []

      nextJoint: for (const joint of joints) {
        const trackSet =
          joint.x2 - joint.x1 >= 0 ? rightwardTracks : leftwardTracks

        let lastValidTrack: Joint[] | null = null
        for (let i = trackSet.length - 1; i >= 0; i--) {
          const track = trackSet[i]
          let overlapsWithAnyInThisTrack = false

          for (const otherJoint of track) {
            const isBackedgeJoint =
              joint.dst.block === null &&
              joint.dst.dstBlock.attributes.includes('backedge')
            if (
              (isBackedgeJoint || !this.options.allSplit) &&
              joint.dst === otherJoint.dst
            ) {
              track.push(joint)
              continue nextJoint
            }

            const al = Math.min(joint.x1, joint.x2),
              ar = Math.max(joint.x1, joint.x2)
            const bl = Math.min(otherJoint.x1, otherJoint.x2),
              br = Math.max(otherJoint.x1, otherJoint.x2)
            const overlaps = ar >= bl && al <= br

            if (overlaps) {
              overlapsWithAnyInThisTrack = true
              break
            }
          }

          if (overlapsWithAnyInThisTrack) {
            break
          } else {
            lastValidTrack = track
          }
        }

        if (lastValidTrack) {
          lastValidTrack.push(joint)
        } else {
          trackSet.push([joint])
        }
      }

      const tracksHeight =
        Math.max(0, rightwardTracks.length + leftwardTracks.length - 1) *
        this.options.jointSpacing
      let trackOffset = -tracksHeight / 2

      for (const track of [...rightwardTracks.reverse(), ...leftwardTracks]) {
        for (const joint of track) {
          joint.src.jointOffsets[joint.srcPort] = trackOffset
        }
        trackOffset += this.options.jointSpacing
      }

      trackHeights.push(tracksHeight)
    }

    assert(trackHeights.length === layoutNodesByLayer.length)
    return trackHeights
  }

  // ==========================================================================
  // Vertical Positioning
  // ==========================================================================

  /**
   * Assign a single y to all nodes in each layer.
   */
  private verticalize(
    layoutNodesByLayer: LayoutNode[][],
    trackHeights: number[]
  ): number[] {
    const layerHeights: number[] = new Array(layoutNodesByLayer.length)

    let nextLayerY = this.options.contentPadding
    for (let i = 0; i < layoutNodesByLayer.length; i++) {
      const nodes = layoutNodesByLayer[i]

      let layerHeight = 0
      for (const node of nodes) {
        node.pos.y = nextLayerY
        layerHeight = Math.max(layerHeight, node.size.y)
      }

      layerHeights[i] = layerHeight
      nextLayerY +=
        layerHeight +
        this.options.trackPadding +
        trackHeights[i] +
        this.options.trackPadding
    }

    return layerHeights
  }

  // ==========================================================================
  // Size Computation
  // ==========================================================================

  /**
   * Compute the total size of the graph based on node positions.
   */
  private computeSize(layoutNodesByLayer: LayoutNode[][]): Vec2 {
    let maxX = 0,
      maxY = 0
    for (const nodes of layoutNodesByLayer) {
      for (const node of nodes) {
        maxX = Math.max(
          maxX,
          node.pos.x + node.size.x + this.options.contentPadding
        )
        maxY = Math.max(
          maxY,
          node.pos.y + node.size.y + this.options.contentPadding
        )
      }
    }
    return { x: maxX, y: maxY }
  }

  // ==========================================================================
  // Edge Computation
  // ==========================================================================

  /**
   * Compute all edge routing data.
   * This calculates the coordinates and metadata for rendering each edge.
   */
  private computeEdges(
    layoutNodesByLayer: LayoutNode[][],
    layerHeights: number[],
    trackHeights: number[]
  ): Edge[] {
    const edges: Edge[] = []
    let edgeId = 0

    for (let layer = 0; layer < layoutNodesByLayer.length; layer++) {
      const nodes = layoutNodesByLayer[layer]
      for (const node of nodes) {
        for (const [i, dst] of node.dstNodes.entries()) {
          const edge: Edge = {
            id: `edge-${edgeId++}`,
            srcNode: node,
            dstNode: dst,
            srcPort: i,
            dstPort: 0, // Will be calculated below
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            hasArrowhead: false,
            type: 'downward',
            layer,
          }

          // Calculate base coordinates
          edge.x1 =
            node.pos.x + this.options.portStart + this.options.portSpacing * i
          edge.y1 = node.pos.y + node.size.y

          // Determine edge type and calculate specific coordinates
          if (node.block?.attributes.includes('backedge')) {
            // Loop header arrow (backedge → header, horizontal)
            edge.type = 'loopHeader'
            const header = node.block.succs[0]
            edge.x1 = node.pos.x
            edge.y1 = node.pos.y + this.options.headerArrowPushdown
            edge.x2 = header.layoutNode.pos.x + header.size.x
            edge.y2 = header.layoutNode.pos.y + this.options.headerArrowPushdown
            edge.hasArrowhead = true
          } else if (node.flags & IMMINENT_BACKEDGE_DUMMY) {
            // Imminent backedge dummy → backedge block
            edge.type = 'toBackedge'
            const backedge = must(dst.block)
            edge.x1 = node.pos.x + this.options.portStart
            edge.y1 =
              node.pos.y +
              this.options.headerArrowPushdown +
              this.options.arrowRadius
            edge.x2 = backedge.layoutNode.pos.x + backedge.size.x
            edge.y2 =
              backedge.layoutNode.pos.y + this.options.headerArrowPushdown
            edge.hasArrowhead = true
          } else if (
            dst.block === null &&
            dst.dstBlock.attributes.includes('backedge')
          ) {
            // Edge to backedge dummy
            edge.dstPort = 0 // Backedge dummies always use port 0
            edge.x2 = dst.pos.x + this.options.portStart
            edge.y2 =
              dst.pos.y +
              (dst.flags & IMMINENT_BACKEDGE_DUMMY
                ? this.options.headerArrowPushdown + this.options.arrowRadius
                : 0)

            if (node.block === null) {
              // Upward arrow between dummies
              edge.type = 'upward'
              edge.ym = edge.y1 - this.options.trackPadding
              edge.hasArrowhead = false
            } else {
              // Block to backedge dummy
              edge.type = 'toBackedgeDummy'
              edge.ym =
                edge.y1 -
                node.size.y +
                layerHeights[layer] +
                this.options.trackPadding +
                trackHeights[layer] / 2 +
                node.jointOffsets[i]
              edge.hasArrowhead = false
            }
          } else {
            // Normal downward edge
            edge.type = 'downward'
            const incomingIndex = Math.max(0, dst.srcNodes.indexOf(node))
            const isBackedgeDummy =
              dst.block === null &&
              dst.dstBlock?.attributes.includes('backedge')
            edge.dstPort =
              isBackedgeDummy || !this.options.allSplit ? 0 : incomingIndex
            edge.x2 =
              dst.pos.x +
              this.options.portStart +
              this.options.portSpacing * edge.dstPort
            edge.y2 = dst.pos.y
            edge.ym =
              edge.y1 -
              node.size.y +
              layerHeights[layer] +
              this.options.trackPadding +
              trackHeights[layer] / 2 +
              node.jointOffsets[i]
            edge.hasArrowhead = dst.block !== null
          }

          edges.push(edge)
        }
      }
    }

    return edges
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function pruneNode(node: LayoutNode) {
  for (const dst of node.dstNodes) {
    const indexOfSelfInDst = dst.srcNodes.indexOf(node)
    assert(indexOfSelfInDst !== -1)
    dst.srcNodes.splice(indexOfSelfInDst, 1)
  }
}

function* dummies(layoutNodesByLayer: LayoutNode[][]) {
  for (const nodes of layoutNodesByLayer) {
    for (const node of nodes) {
      if (node.block === null) {
        yield node
      }
    }
  }
}

function* backedgeDummies(layoutNodesByLayer: LayoutNode[][]) {
  for (const nodes of layoutNodesByLayer) {
    for (const node of nodes) {
      if (
        node.block === null &&
        node.dstBlock.attributes.includes('backedge')
      ) {
        yield node
      }
    }
  }
}
