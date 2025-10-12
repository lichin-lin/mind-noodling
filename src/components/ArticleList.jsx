import { Link } from "react-router-dom";
import { articles } from "../articles";

export function ArticleList() {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-2xl px-2 pt-24 pb-20 flex flex-col gap-16">
      {/* Header section with title and description */}
      <header className="flex flex-col gap-3 px-3">
        <h1
          className="text-4xl font-semibold"
          style={{ color: "var(--color-fg)" }}
        >
          Mind noodling
        </h1>
        <p
          className="text-base text-balance"
          style={{ color: "var(--color-text-muted)" }}
        >
          Thoughts on building interfaces, crafting interactions, and making
          tools that don't suck.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            to={`/${article.slug}`}
            className="article-link w-fit px-4 py-2 rounded-lg transition-colors duration-150"
          >
            <div className="flex flex-col gap-0.5">
              <h2
                className="text-base font-normal"
                style={{ color: "var(--color-fg)" }}
              >
                {article.title}
              </h2>

              <time
                className="text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
                dateTime={article.publishDate}
              >
                {formatDate(article.publishDate)}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
