import KitchenSink from './articles/kitchen-sink.mdx'
import { SandpackPlayground } from './SandpackPlayground.jsx'

export default function App() {
  return (
    <main>
      <KitchenSink components={{ SandpackPlayground }} />
    </main>
  )
}
