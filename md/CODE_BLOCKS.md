# Code Block Features

Your MDX articles now support enhanced code blocks with **titles**, **line numbers**, and **line highlighting** using `rehype-prism-plus` and `rehype-code-titles`.

## Features

✅ **Code Block Titles** - Add filenames to your code blocks  
✅ **Line Numbers** - Show line numbers for easier reference  
✅ **Line Highlighting** - Highlight specific lines  
✅ **Syntax Highlighting** - Beautiful Prism-based syntax highlighting  
✅ **Copy Button** - One-click copy to clipboard  
✅ **Dark Mode** - Full theme support  
✅ **Diff Support** - Show added/removed lines  

## Usage Examples

### 1. Basic Code Block

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

### 2. Code Block with Title

Add `:filename` after the language:

\`\`\`javascript:src/App.jsx
const hello = "world";
console.log(hello);
\`\`\`

### 3. Code Block with Line Numbers

Add `showLineNumbers` at the end:

\`\`\`javascript showLineNumbers
const hello = "world";
console.log(hello);
\`\`\`

### 4. Code Block with Line Highlighting

Add `{line-numbers}` after the language:

#### Highlight a single line:
\`\`\`javascript {2}
const hello = "world";
console.log(hello); // This line is highlighted
const goodbye = "world";
\`\`\`

#### Highlight multiple lines:
\`\`\`javascript {1,3,5}
const a = 1; // highlighted
const b = 2;
const c = 3; // highlighted
const d = 4;
const e = 5; // highlighted
\`\`\`

#### Highlight a range:
\`\`\`javascript {2-4}
const a = 1;
const b = 2; // highlighted
const c = 3; // highlighted
const d = 4; // highlighted
const e = 5;
\`\`\`

#### Mix single lines and ranges:
\`\`\`javascript {1,3-5,7}
const a = 1; // highlighted
const b = 2;
const c = 3; // highlighted
const d = 4; // highlighted
const e = 5; // highlighted
const f = 6;
const g = 7; // highlighted
\`\`\`

### 5. All Features Combined

\`\`\`javascript:index.jsx {2,4-5} showLineNumbers
const greeting = "Hello";
const name = "World"; // highlighted
const separator = " ";
const message = greeting + separator + name; // highlighted
console.log(message); // highlighted
\`\`\`

### 6. File Diffs

Use the `diff` language and prefix lines with `+` or `-`:

\`\`\`diff
- const oldCode = "remove this";
+ const newCode = "add this";
  const unchanged = "stays the same";
\`\`\`

## Syntax Reference

### Code Fence Format

\`\`\`[language]:[title] {highlight-lines} showLineNumbers
// your code here
\`\`\`

### Parts (all optional):

- **`[language]`** - The syntax highlighting language (javascript, python, css, etc.)
- **`:title`** - Filename or title to display (e.g., `:src/App.jsx`)
- **`{lines}`** - Lines to highlight (e.g., `{1}`, `{1,3-5}`, `{2-4}`)
- **`showLineNumbers`** - Enable line numbers

## Styling

The code blocks use your existing theme variables and automatically adapt to light/dark mode:

- Background: `var(--color-code-bg)`
- Text: `var(--color-fg)`
- Borders: `var(--color-bd)`
- Muted text: `var(--color-text-muted)`
- Title accent: Indigo (#6366f1)
- Highlight accent: Amber (#fbbf24)

## Technologies

- **rehype-prism-plus** - Syntax highlighting with line numbers and highlighting support
- **rehype-code-titles** - Code block titles
- **Prism.js** - Underlying syntax highlighting engine

## Tips

1. **Don't use line numbers everywhere** - They can be noisy. Use them when you need to reference specific lines.
2. **Combine features wisely** - Title + highlighting is usually enough. Add line numbers only when needed.
3. **Use meaningful titles** - Show the file path to give context (e.g., `src/components/Button.jsx`)
4. **Highlight sparingly** - Only highlight the lines you're discussing to keep focus.
