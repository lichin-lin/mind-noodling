import KitchenSink from './articles/kitchen-sink.mdx'
import { SandpackPlayground } from './SandpackPlayground.jsx'
import { CodeBlock } from './CodeBlock.jsx'

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
