interface PresetFile {
  code: string
}

interface Preset {
  files: Record<string, PresetFile>
}

interface Presets {
  [key: string]: Preset
}

export const presets: Presets = {
  counter: {
    files: {
      '/App.js': {
        code: `import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <h1>Sandpack Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
`,
      },
      '/index.js': {
        code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(<App />);
`,
      },
    },
  },
}
