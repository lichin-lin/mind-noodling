import { useState } from 'react'
import {
  ScrollytellingLayout,
  Section,
} from '../components/ScrollytellingLayout'
import { CodeBlock } from '../CodeBlock'
import Example1 from '../examples/Example1'
import Example2 from '../examples/Example2'
import Example3 from '../examples/Example3'
import Example4 from '../examples/Example4'
import Example5 from '../examples/Example5'
import Example6 from '../examples/Example6'
import Example7 from '../examples/Example7'
import Example8 from '../examples/Example8'
import Example9 from '../examples/Example9'
import Example10 from '../examples/Example10'
import Example11 from '../examples/Example11'

const ExampleRenderer = ({ exampleNumber }: { exampleNumber: number }) => {
  switch (exampleNumber) {
    case 1:
      return <Example1 />
    case 2:
      return <Example2 />
    case 3:
      return <Example3 />
    case 4:
      return <Example4 />
    case 5:
      return <Example5 />
    case 6:
      return <Example6 />
    case 7:
      return <Example7 />
    case 8:
      return <Example8 />
    case 9:
      return <Example9 />
    case 10:
      return <Example10 />
    case 11:
      return <Example11 />
    default:
      return <Example1 />
  }
}

export default function NodeEdgeDiagramFundamentals() {
  const [activeExample, setActiveExample] = useState(1)

  return (
    <>
      <ScrollytellingLayout
        activeExample={activeExample}
        demoContent={<ExampleRenderer exampleNumber={activeExample} />}
        articleContent={
          <div>
            <h1>Building Interactive Workflow Diagrams</h1>
            <p>
              A diagram begins with a simple question:{' '}
              <strong>how do I make complexity visible?</strong> Not just
              visible—manipulable, explorable, alive. The kind that updates when
              your system changes, that reveals structure you couldn't see in
              text or tables.
            </p>
            <p>
              What if we could watch data flow? What if the diagram itself told
              us which processes are idle, which are racing, and which just
              completed?
            </p>
            <p>
              We'll start from the most fundamental primitive and work our way
              up to layout algorithms that organize nodes automatically.
            </p>

            <Section exampleNumber={1} onVisible={setActiveExample}>
              <h3>1. The Empty Canvas</h3>
              <p>
                It all starts with space. An infinite, blank surface waiting for
                structure.
              </p>
              <p>
                To map a system, we first need to identify its landmarks. We
                could call these <strong>nodes</strong>. Before we worry about
                connections or flows, we must simply give these pieces a place
                to exist.
              </p>
              <p>
                The act of positioning is powerful. By placing things near or
                far, aligned or scattered, you are already defining
                relationships.
              </p>
            </Section>

            <Section exampleNumber={2} onVisible={setActiveExample}>
              <h3>2. Drawing Connections</h3>
              <p>
                Once the nodes are in place, we draw lines. These lines are the
                relationship made visible. They turn a collection of isolated
                parts into a cohesive system.
              </p>
              <p>
                Suddenly, we can see how data flows, where dependencies lie, and
                how one piece influences another.{' '}
                <strong>The edge is where the story lives.</strong> Without it,
                nodes are just dots. With it, they become a narrative of cause
                and effect.
              </p>
            </Section>

            <Section exampleNumber={3} onVisible={setActiveExample}>
              <h3>3. When Manual Breaks Down</h3>
              <p>
                But what happens when the system grows? With more and more nodes
                on the canvas, relationships become tangled. We start to get
                lost in our own diagram.
              </p>
              <p>
                <strong>This is the breaking point.</strong> What felt
                intentional with a few blocks now feels like chaos. Manual
                positioning doesn't scale. The diagram has outgrown our ability
                to manage it by hand.
              </p>
            </Section>

            <Section exampleNumber={4} onVisible={setActiveExample}>
              <h3>4. Algorithms as Collaborators</h3>
              <p>
                This is where we stop arranging nodes ourselves and start
                exploring layout algorithms. Instead of fighting chaos, we need
                a systematic way to organize these elements.
              </p>
              <p>
                One of the most popular approaches is the{' '}
                <strong>Sugiyama framework</strong> (Layered Graph Drawing).
                Introduced by Kozo Sugiyama in{' '}
                <a href="https://ieeexplore.ieee.org/document/4308636">1981</a>,
                it revolutionized how we visualize hierarchical structures. The
                idea is elegant: arrange nodes in layers so that edges flow in a
                single direction (usually top-to-bottom) with minimal crossing.
              </p>

              <CodeBlock className="language-javascript">
                {`import { graphStratify, sugiyama, layeringSimplex } from 'd3-dag'

// Build a directed acyclic graph from your data
const builder = graphStratify()
  .id((d) => d.id)
  .parentIds((d) => d.parentIds)

const dag = builder(nodes)

// Apply Sugiyama layout algorithm
const layout = sugiyama()
  .layering(layeringSimplex()) // Assign nodes to layers
  .decross(decrossTwoLayer()) // Minimize edge crossings
  .nodeSize([150, 60]) // Set node dimensions

const { width, height } = layout(dag) // Get calculated dimensions

// Now each node has x, y coordinates automatically assigned`}
              </CodeBlock>

              <p>
                With the algorithm in charge, the diagram suddenly makes sense.
                We've moved from manual placement to{' '}
                <strong>structural clarity</strong>.
              </p>
            </Section>

            <Section exampleNumber={5} onVisible={setActiveExample}>
              <h3>5. Smooth Paths</h3>
              <p>
                Now that we have structure, we can refine how connections flow
                between nodes. Straight lines work, but curved paths guide the
                eye more naturally. They soften the visual noise and make
                complex hierarchies easier to trace.
              </p>

              <CodeBlock className="language-javascript">
                {`const generateRoundedVerticalPath = (from, to) => {
  const deltaX = to.x - from.x
  const absDeltaX = Math.abs(deltaX)

  // Use straight line if nodes are vertically aligned
  if (absDeltaX < 10) {
    return \`M \${from.x},\${from.y} L \${to.x},\${to.y}\`
  }

  const cornerRadius = 12
  const verticalSplit = (from.y + to.y) / 2
  const directionX = deltaX > 0 ? 1 : -1

  // Create path with rounded 90-degree turns
  return \`
    M \${from.x},\${from.y}
    L \${from.x},\${verticalSplit - cornerRadius}
    A \${cornerRadius},\${cornerRadius} 0 0 \${directionX > 0 ? 0 : 1}
      \${from.x + directionX * cornerRadius},\${verticalSplit}
    L \${to.x - directionX * cornerRadius},\${verticalSplit}
    A \${cornerRadius},\${cornerRadius} 0 0 \${directionX > 0 ? 1 : 0}
      \${to.x},\${verticalSplit + cornerRadius}
    L \${to.x},\${to.y}
  \`
}`}
              </CodeBlock>
            </Section>

            <Section exampleNumber={6} onVisible={setActiveExample}>
              <h3>6. Bringing Edges to Life</h3>
              <p>
                Static lines show structure, but they don't convey{' '}
                <strong>state</strong>. Is data flowing? Is a process running?
                Are dependencies being resolved in real-time?
              </p>
              <p>
                Here's a question:{' '}
                <strong>
                  How do you show movement without showing objects moving?
                </strong>
              </p>
              <p>
                By using <code>stroke-dasharray</code> and{' '}
                <code>stroke-dashoffset</code>, we create a "drawing" effect—the
                edge appears to fill from start to finish, like watching data
                propagate through the connection. It's less about individual
                packets and more about the <strong>act of connection</strong>{' '}
                itself.
              </p>

              <CodeBlock className="language-css">
                {`@keyframes dash {
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
}`}
              </CodeBlock>

              <CodeBlock className="language-jsx">
                {`<path
  d={path}
  className="fill-edge"
  stroke="#BBB"
  strokeWidth={1.5}
  style={{ animationDelay: \`\${delay}s\` }}
/>`}
              </CodeBlock>

              <p>
                Why does this matter? Because{' '}
                <strong>motion encodes meaning.</strong> A static diagram tells
                you what's connected. An animated one tells you what's happening
                right now.
              </p>
            </Section>

            <Section exampleNumber={7} onVisible={setActiveExample}>
              <h3>7. Motion Patterns for Status</h3>
              <p>
                Different motion patterns can signal different states. The
                previous example animated the stroke itself. But sometimes you
                want something more literal—actual objects moving along the
                edge.
              </p>
              <p>
                Using SVG's <code>&lt;animateMotion&gt;</code>, we can make
                circles travel along the exact path of the edge. This works for
                showing individual packets, messages, or tasks moving through
                the system.
              </p>

              <CodeBlock className="language-jsx">
                {`<svg>
  <defs>
    {/* Define the path once */}
    <path id="edge-path-1" d={curvedPath} />
  </defs>

  {/* Static edge */}
  <path d={curvedPath} stroke="#333" strokeWidth={1.5} />

  {/* Animated circle following the path */}
  <circle r={3} fill="#BBB">
    <animateMotion dur="5s" begin="0.2s" repeatCount="indefinite">
      <mpath href="#edge-path-1" />
    </animateMotion>
  </circle>
</svg>`}
              </CodeBlock>
            </Section>

            <Section exampleNumber={8} onVisible={setActiveExample}>
              <h3>8. Rich Status Patterns</h3>
              <p>
                Real systems involve states between every two nodes. A
                connection might be idle, actively processing, completed, or
                even failed. Each state carries meaning, and the challenge is
                making that meaning instantly visible without adding clutter.
              </p>
              <p>Can motion replace text labels?</p>
              <p>
                A slow pulse says "waiting, not urgent." A fast pulse says
                "actively processing." A fill animation says "completed."
              </p>

              <CodeBlock className="language-jsx">
                {`const AnimatedEdge = ({ path, status }) => {
  const [localState, setLocalState] = useState(status)

  // IDLE: Slow, subtle pulse
  // PROCESSING: Fast, bright pulse with gradient
  // COMPLETED: Fill animation with success color

  return (
    <AnimatePresence mode="wait">
      {localState === 'IDLE' && (
        <circle r={25} fill="url(#idle-gradient)">
          <animateMotion dur="6s" repeatCount="indefinite">
            <mpath href="#path" />
          </animateMotion>
        </circle>
      )}

      {localState === 'PROCESSING' && (
        <circle r={30} fill="url(#processing-gradient)">
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href="#path" />
          </animateMotion>
        </circle>
      )}

      {localState === 'COMPLETED' && (
        <path d={path} className="edge-completed" />
      )}
    </AnimatePresence>
  )
}`}
              </CodeBlock>
            </Section>

            <Section exampleNumber={9} onVisible={setActiveExample}>
              <h3>9. Scaling with Zoom and Pan</h3>
              <p>
                As diagrams grow, a fixed viewport becomes limiting. You need to
                see the whole picture, but also zoom into specific details.
                Thirty nodes? A hundred? The same principles apply, but now you
                need navigation.
              </p>
              <p>
                This is where diagrams become <strong>zoom/pan-able</strong>.
                You're not just looking at a static map anymore. You're
                navigating through your system, choosing what to focus on,
                discovering patterns at different scales.
              </p>

              <CodeBlock className="language-javascript">
                {`import { select, zoom } from 'd3'

const zoomBehavior = zoom()
  .scaleExtent([0.2, 5]) // Min/max zoom levels
  .on('zoom', (event) => {
    // Apply transform to your SVG groups
    select('#edges-group').attr('transform', event.transform)
    select('#nodes-overlay').style(
      'transform',
      \`translate(\${event.transform.x}px, \${event.transform.y}px) 
       scale(\${event.transform.k})\`
    )
  })

// Attach to container
select(containerRef).call(zoomBehavior)`}
              </CodeBlock>
            </Section>

            <Section exampleNumber={10} onVisible={setActiveExample}>
              <h3>10. When Edges Overlap</h3>
              <p>
                As relationships grow more complex, edges start crossing each
                other. Multiple connections converge on the same nodes. What was
                clear with a few edges becomes a tangled mess with many.
              </p>
              <p>
                The diagram below lets you click on nodes to highlight their
                connections. It doesn't eliminate the overlap, it just makes it
                possible to selectively focus.
              </p>
              <p>
                This reveals a fundamental tension:{' '}
                <strong>some structures are inherently dense</strong>, and no
                amount of clever layout will make every edge perfectly clear at
                once. Sometimes the best approach isn't to eliminate the
                problem, but to give users simple interactions to navigate it
                themselves.
              </p>
            </Section>

            <Section exampleNumber={11} onVisible={setActiveExample}>
              <h3>11. Maybe there's a way toward smart Routing</h3>
              <p>
                We've been using Sugiyama layout, which works well for most
                hierarchical diagrams. For simple cases, it's more than enough.
              </p>
              <p>
                But there's a group of researchers who've spent years digging
                deeper into this problem. The{' '}
                <a href="https://github.com/kieler">KIELER team</a> at Kiel
                University, working within the Eclipse Foundation, built{' '}
                <strong>ELK.js</strong> (Eclipse Layout Kernel)—a library that
                treats graph layout not as a solved problem, but as an active
                research area.
              </p>
              <p>
                The difference? <strong>Smart edge routing.</strong> ELK's edges
                navigate around nodes instead of cutting straight through. The
                algorithm treats routing as a pathfinding problem—edges actively
                avoid obstacles, maintaining clearance you can control with
                options like <code>spacing.edgeNode</code>.
              </p>

              <CodeBlock className="language-javascript">
                {`import ELK from 'elkjs/lib/elk.bundled'

const elk = new ELK()

const elkGraph = {
  id: 'root',
  layoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '40',
    'elk.spacing.edgeNode': '80', // Control edge-to-node spacing
  },
  children: nodes.map((n) => ({
    id: n.id,
    width: 140,
    height: 48,
  })),
  edges: edges.map((e) => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
  })),
}

const layout = await elk.layout(elkGraph)`}
              </CodeBlock>

              <p>
                This is particularly valuable for dense graphs where d3-dag's
                straight connections would slice through unrelated nodes. ELK
                doesn't just minimize crossings; it respects the space nodes
                occupy. Even though the smart routing can sometimes feel
                over-engineered for simple graphs. But when you need it, nothing
                else comes close.
              </p>
            </Section>
          </div>
        }
      />

      <style>{`
        h1 {
          font-size: 4rem;
          font-weight: 400;
          margin-bottom: 2rem;
          line-height: 1.2;
        }

        h3 {
          font-size: 1.75rem;
          font-weight: 500;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        p {
          font-size: 1.125rem;
          line-height: 1.65;
          margin-bottom: 1.5rem;
          color: #374151;
        }

        p code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          color: #1f2937;
        }

        .code-block-wrapper {
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #1e1e1e;
          border-bottom: 1px solid #333;
        }

        .code-block-language {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          font-weight: 500;
        }

        .code-block-copy-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .code-block-copy-btn:hover {
          color: #fff;
        }

        .code-block-copy-btn svg {
          width: 1rem;
          height: 1rem;
        }

        .code-block-content {
          padding: 1rem;
          overflow-x: auto;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        a {
          color: #2563eb;
          text-decoration: underline;
        }

        a:hover {
          color: #1d4ed8;
        }

        .section {
          margin-top: 8rem;
          margin-bottom: 8rem;
        }

        strong {
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </>
  )
}
