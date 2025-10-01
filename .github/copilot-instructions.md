This is a React + Vite application for demonstrating SVG path data experiments.

## Project Overview
- Framework: React with Vite
- Key Libraries: react-markdown, Sandpack (CodeSandbox)
- Purpose: Interactive SVG path learning platform

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure
- `/src/App.jsx` - Main component with experiments array
- `/src/App.css` - Application styles
- `/src/index.css` - Global styles

## Adding New Experiments
Add to the `experiments` array in `App.jsx` with:
- id: unique number
- title: experiment name
- description: markdown explanation
- code: React component code for Sandpack
