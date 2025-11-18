import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react'
import { presets } from './sandpack/presets'

export function SandpackPlayground({ preset = 'counter' }) {
  const config = presets[preset]

  if (!config) {
    return null
  }

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <SandpackProvider template="react" files={config.files}>
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers={true}
            showInlineErrors
          />
          <SandpackPreview />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
