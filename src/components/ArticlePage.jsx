import { useParams, Navigate } from "react-router-dom";
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
      <div className="w-full max-w-3xl mx-auto py-20 px-4">
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
