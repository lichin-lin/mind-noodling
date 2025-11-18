import { useState } from 'react'
import { CodeBlock as ReactCodeBlock } from 'react-code-block'

export function CodeBlock({
  children,
  className,
  title,
  lines = [],
  words = [],
  showLineNumbers = false,
}) {
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
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <ReactCodeBlock
        code={codeContent}
        language={language}
        lines={lines}
        words={words}
      >
        <ReactCodeBlock.Code className="code-block-content">
          {({ isLineHighlighted }) => (
            <div
              className={`table-row ${
                isLineHighlighted ? 'highlight-line' : ''
              }`}
            >
              {showLineNumbers && (
                <ReactCodeBlock.LineNumber className="code-block-line-number table-cell" />
              )}
              <ReactCodeBlock.LineContent className="code-block-line-content table-cell">
                <ReactCodeBlock.Token />
              </ReactCodeBlock.LineContent>
            </div>
          )}
        </ReactCodeBlock.Code>
      </ReactCodeBlock>
    </div>
  )
}
