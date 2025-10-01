# SVG Path 101

An interactive learning platform for understanding SVG path data through hands-on experiments. Built with React, Vite, react-markdown, and Sandpack.

## Features

- 🎨 **Interactive SVG Demonstrations**: Learn SVG path commands through live, editable examples
- 📝 **Markdown Documentation**: Each experiment includes clear explanations with markdown formatting
- 🔧 **Live Code Editor**: Powered by Sandpack - edit code and see results instantly
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Experiments Included

1. **Basic Path - Line**: Learn the `M` (move) and `L` (line) commands
2. **Multiple Lines**: Create shapes with multiple connected lines
3. **Quadratic Bezier Curves**: Master the `Q` command with one control point
4. **Cubic Bezier Curves**: Advanced curves with the `C` command and two control points
5. **Arc Command**: Create elliptical arcs with the `A` command

## Technologies Used

- [React](https://react.dev/) - UI framework
- [Vite](https://vite.dev/) - Build tool and dev server
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
- [Sandpack](https://sandpack.codesandbox.io/) - Live code editor by CodeSandbox

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173` to view the app.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
svg-path-101/
├── src/
│   ├── App.jsx                      # Main application component
│   ├── App.css                      # Application styles
│   ├── main.jsx                     # Entry point
│   ├── index.css                    # Global styles
│   ├── data/
│   │   └── experiments.js           # Experiment content and metadata
│   └── experiments/                 # Individual experiment code files
│       ├── 01-basic-line.js
│       ├── 02-multiple-lines.js
│       ├── 03-quadratic-bezier.js
│       ├── 04-cubic-bezier.js
│       └── 05-arc.js
├── public/                          # Static assets
├── index.html                       # HTML template
└── package.json                     # Dependencies and scripts
```

## Adding More Experiments

### 1. Create a new code file in `src/experiments/`:

```javascript
// src/experiments/06-your-experiment.js
export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Experiment</h2>
      {/* Your SVG code here */}
    </div>
  );
}
```

### 2. Add the experiment to `src/data/experiments.js`:

```javascript
// Import the new code file
import yourExperimentCode from './experiments/06-your-experiment.js?raw';

// Add to the experiments array
{
  id: 6,
  title: 'Experiment 6: Your Title',
  description: `
## Your Experiment Title

Your markdown description here...

**Syntax:**
- Details about the SVG commands
  `,
  code: yourExperimentCode,
}
```

## License

MIT
