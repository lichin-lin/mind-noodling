import MdxContent from "./data/markdown.mdx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <main className="article">
        <div className="content-block">
          <MdxContent />
        </div>
      </main>
    </div>
  );
}

export default App;
