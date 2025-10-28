import { useState } from "react";
import { CodeBlock as ReactCodeBlock } from "react-code-block";
import "./CodeBlock.css";

export function CodeBlock({
  children,
  className,
  title,
  lines = [],
  words = [],
  showLineNumbers = false,
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace(/language-/, "") || "text";
  console.log({ lines });

  // Extract plain text for copy functionality
  const getCodeText = (node) => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getCodeText).join("");
    if (node?.props?.children) return getCodeText(node.props.children);
    return "";
  };

  const codeContent = getCodeText(children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
      >
        <ReactCodeBlock.Code
          className={`code-block-content ${
            lines.length > 0 ? "with-highlight" : ""
          }`}
        >
          {({ isLineHighlighted }) => (
            <div
              className={`table-row ${
                isLineHighlighted ? "highlight-line" : ""
              }`}
            >
              {showLineNumbers && (
                <ReactCodeBlock.LineNumber className="code-block-line-number table-cell pl-6 pr-4 text-sm text-right select-none text-gray-500" />
              )}
              <ReactCodeBlock.LineContent className="code-block-line-content table-cell">
                <ReactCodeBlock.Token />
              </ReactCodeBlock.LineContent>
            </div>
          )}
        </ReactCodeBlock.Code>
      </ReactCodeBlock>
    </div>
  );
}
