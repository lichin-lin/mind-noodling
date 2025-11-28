import { useState, useEffect } from 'react'
import MdxArticle from './articles/node-edge-diagram-fundamentals.mdx'
import { CodeBlock } from './CodeBlock'

export default function App() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const components = {
    pre: (props: any) => {
      if (props.children?.type === 'code') {
        return <CodeBlock {...props.children.props} {...props} />
      }
      return <pre {...props} />
    },
  }

  return (
    <main>
      <div className="flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-[720px] mt-16">
          <MdxArticle components={components} />
        </div>
      </div>
    </main>
  )
}
