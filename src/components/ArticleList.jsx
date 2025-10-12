import { Link } from "react-router-dom";
import { articles } from "../articles";

export function ArticleList() {
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
      <div className="space-y-8">
        {articles.map((article) => (
          <Link
            key={article.slug}
            to={`/${article.slug}`}
            className="block group"
          >
            <article
              className="p-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--color-code-bg)",
                border: "1px solid var(--color-bd)",
              }}
            >
              <h2
                className="text-2xl font-semibold mb-2 group-hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-fg)" }}
              >
                {article.title}
              </h2>

              <time
                className="text-sm mb-3 block"
                style={{ color: "var(--color-text-muted)" }}
                dateTime={article.publishDate}
              >
                {formatDate(article.publishDate)}
              </time>

              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: "var(--color-text-muted-fg)" }}
              >
                {article.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
