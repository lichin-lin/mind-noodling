import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react'
import { presets } from './sandpack/presets'
// import { githubLight } from '@codesandbox/sandpack-themes'

export function SandpackPlayground({ preset = 'counter' }) {
  const config = presets[preset]

  if (!config) {
    return null
  }

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <SandpackProvider
        template="react"
        files={config.files}
        // theme={githubLight}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers={true}
            showInlineErrors
          />
          <SandpackPreview showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
