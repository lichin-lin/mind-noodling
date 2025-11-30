// ============================================================================
// Standalone Type Definitions for GraphLayout
// This file contains all types needed for the pure graph layout algorithm,
// with no dependencies on the legacy iongraph.ts file.
// ============================================================================

// ============================================================================
// Basic Types
// ============================================================================

export type BlockID = number

export interface Vec2 {
  x: number
  y: number
}

// ============================================================================
// Input Graph Data (Simplified Format)
// ============================================================================

export interface GraphNode {
  /** Unique identifier for the node */
  id: number
  /** Array of successor node IDs */
  successors: number[]
  /** Optional loop depth (omit if 0) */
  loopDepth?: number
  /** Optional flag indicating this node is a loop header */
  isLoopHeader?: boolean
  /** Optional flag indicating this node is a backedge */
  isBackedge?: boolean
}

export interface GraphData {
  /** Array of graph nodes */
  nodes: GraphNode[]
}

// ============================================================================
// MIR Types (Minimal subset needed for layout)

export interface MIRBlock {
  id: BlockID
  loopDepth: number
  attributes: string[]
  predecessors: BlockID[]
  successors: BlockID[]
}

// ============================================================================
// Block Types (Extended with layout properties)
// ============================================================================

export type Block = MIRBlock & {
  // Properties added at runtime for graph layout
  preds: Block[]
  succs: Block[]
  el: HTMLElement
  size: Vec2
  layer: number
  loopID: BlockID
  layoutNode: LayoutNode
}

export type LoopHeader = Block & {
  loopHeight: number
  parentLoop: LoopHeader | null
  outgoingEdges: Block[]
  backedge: Block
}

// ============================================================================
// Layout Node Types
// ============================================================================

export type LayoutNode = BlockNode | DummyNode

export type LayoutNodeID = number & { readonly __brand: 'LayoutNodeID' }

export interface _LayoutNodeCommon {
  id: LayoutNodeID
  pos: Vec2
  size: Vec2
  srcNodes: LayoutNode[]
  dstNodes: LayoutNode[]
  jointOffsets: number[]
  flags: NodeFlags
}

export type BlockNode = _LayoutNodeCommon & {
  block: Block
}

export type DummyNode = _LayoutNodeCommon & {
  block: null
  dstBlock: Block
}

export type NodeFlags = number
export const LEFTMOST_DUMMY: NodeFlags = 1 << 0
export const RIGHTMOST_DUMMY: NodeFlags = 1 << 1
export const IMMINENT_BACKEDGE_DUMMY: NodeFlags = 1 << 2

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Types of edges in the graph, determining how they are rendered.
 */
export type EdgeType =
  | 'downward' // Normal edge going down between layers
  | 'upward' // Backedge dummy chain going up
  | 'loopHeader' // Backedge to loop header (horizontal arrow)
  | 'toBackedge' // From imminent dummy to backedge block
  | 'toBackedgeDummy' // From block to backedge dummy

/**
 * Pre-calculated edge routing data.
 * Contains all information needed to render an edge as SVG.
 */
export interface Edge {
  /** Unique identifier for this edge */
  id: string

  /** Type of edge, determines which rendering function to use */
  type: EdgeType

  /** Source layout node */
  srcNode: LayoutNode

  /** Destination layout node */
  dstNode: LayoutNode

  /** Source port index (which output port on the source node) */
  srcPort: number

  /** Destination port index (which input port on the destination node) */
  dstPort: number

  /** Start X coordinate */
  x1: number

  /** Start Y coordinate */
  y1: number

  /** End X coordinate */
  x2: number

  /** End Y coordinate */
  y2: number

  /** Midpoint Y coordinate for multi-segment edges (optional) */
  ym?: number

  /** Whether to render an arrowhead at the destination */
  hasArrowhead: boolean

  /** Layer index where this edge originates (for context) */
  layer: number
}

// ============================================================================
// Layout Result
// ============================================================================

export interface LayoutResult {
  nodesByLayer: LayoutNode[][]
  layerHeights: number[]
  trackHeights: number[]
  edges: Edge[]
  size: Vec2
  numLayers: number
}
