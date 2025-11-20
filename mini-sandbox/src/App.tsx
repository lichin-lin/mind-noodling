import KitchenSink from './articles/node-edge-diagram-fundamentals.mdx'
import { SandpackPlayground } from './SandpackPlayground'
import { CodeBlock } from './CodeBlock'

export default function App() {
  const components = {
    pre: (props) => {
      if (props.children?.type === 'code') {
        console.log(props)

        return <CodeBlock {...props.children.props} {...props} />
      }
      return <pre {...props} />
    },
    SandpackPlayground,
  }

  return (
    <main>
      <KitchenSink components={components} />
    </main>
  )
}
