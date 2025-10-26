import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { ThemeToggle } from "./components/ThemeToggle";
import { ArticleList } from "./components/ArticleList";
import { ArticlePage } from "./components/ArticlePage";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/50 border-b border-[var(--color-bd)]/50">
      <div className="flex items-center justify-between px-4 py-3">
        {!isHomePage && (
          <Link
            to="/"
            className="inline-flex items-center p-2 rounded hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
        )}
        {isHomePage && <div />}
        <ThemeToggle />
      </div>
    </header>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 1, filter: "blur(1px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -1, filter: "blur(1px)" }}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="min-h-screen flex flex-col items-center transition-colors duration-300 pt-16"
      >
        <Routes location={location}>
          <Route path="/" element={<ArticleList />} />
          <Route path="/:slug" element={<ArticlePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter basename="/">
      <Header />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
