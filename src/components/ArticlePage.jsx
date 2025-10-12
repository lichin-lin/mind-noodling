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
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center mb-8 hover:opacity-70 transition-opacity"
        style={{ color: "var(--color-lnk)" }}
      >
        <svg
          className="w-4 h-4 mr-2"
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
        Back to articles
      </Link>

      <header className="mb-8">
        <time
          className="text-sm block mb-4"
          style={{ color: "var(--color-text-muted)" }}
          dateTime={article.publishDate}
        >
          {formatDate(article.publishDate)}
        </time>
      </header>

      <div className="prose max-w-none">
        <ArticleComponent />
      </div>
    </div>
  );
}
