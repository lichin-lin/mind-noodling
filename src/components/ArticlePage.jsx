import { useParams, Link, Navigate } from "react-router-dom";
import { articles } from "../articles";

export function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const ArticleComponent = article.Component;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 inline-flex items-center p-2 rounded hover:opacity-70 transition-opacity"
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

      <div className="w-full max-w-2xl mx-auto py-20">
        <header className="mb-12">
          <time
            className="text-sm block mb-2"
            style={{ color: "var(--color-text-muted)" }}
            dateTime={article.publishDate}
          >
            {formatDate(article.publishDate)}
          </time>
        </header>

        <div className="prose w-full">
          <ArticleComponent />
        </div>
      </div>
    </>
  );
}
