import { themes } from 'prism-react-renderer'
import { useState } from 'react'
import { CodeBlock as ReactCodeBlock } from 'react-code-block'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  title?: string
  lines?: number[]
  words?: string[]
  showLineNumbers?: boolean
}

export function CodeBlock({
  children,
  className,
  title,
  lines = [],
  words = [],
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace(/language-/, '') || 'text'

  const getCodeText = (node) => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(getCodeText).join('')
    if (node?.props?.children) return getCodeText(node.props.children)
    return ''
  }

  const codeContent = getCodeText(children)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-language">{title || language}</span>
        <button
          onClick={handleCopy}
          className="code-block-copy-btn"
          aria-label="Copy code"
        >
          {copied ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>
      <ReactCodeBlock
        code={codeContent}
        language={language}
        lines={lines}
        words={words}
        theme={themes.github}
      >
        <ReactCodeBlock.Code className="code-block-content">
          {({ isLineHighlighted }) => (
            <div
              className={`table-row ${
                isLineHighlighted ? 'highlight-line' : ''
              }`}
            >
              {showLineNumbers && (
                <ReactCodeBlock.LineNumber className="table-cell code-block-line-number" />
              )}
              <ReactCodeBlock.LineContent className="table-cell code-block-line-content">
                <ReactCodeBlock.Token />
              </ReactCodeBlock.LineContent>
            </div>
          )}
        </ReactCodeBlock.Code>
      </ReactCodeBlock>
    </div>
  )
}
