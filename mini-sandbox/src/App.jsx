import KitchenSink from './articles/kitchen-sink.mdx'
import { SandpackPlayground } from './SandpackPlayground.jsx'
import { CodeBlock } from './CodeBlock.jsx'

export default function App() {
  return (
    <main>
      <KitchenSink components={{ SandpackPlayground, code: CodeBlock }} />
    </main>
  )
}
