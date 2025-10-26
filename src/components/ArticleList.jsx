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
    <div className="article-list w-full max-w-3xl px-2 pt-12 pb-20 flex flex-col gap-8">
      {/* Header section with title and description */}
      <header className="flex flex-col gap-3 px-2">
        <div className="article-list-header">
          <h1>Mind Noodling</h1>
          <p>
            A collection of experiments and notes by Lichin, exploring design,
            code, and the small details that make tools feel good to use.
          </p>
          <div className="flex gap-2">
            <a
              href="https://designtips.today"
              target="_blank"
              rel="noopener noreferrer"
            >
              designtips.today
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 2.5H9.5M9.5 2.5V8.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>
      {/* divider */}
      <hr className="border-[var(--color-bd)]/95 mb-4!" />

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            to={`/${article.slug}`}
            className="article-link w-full px-4 py-3 rounded-lg transition-colors duration-150"
          >
            <div className="flex flex-col gap-1 mb:gap-2">
              <h6 className="my-0!">{article.title}</h6>

              <time dateTime={article.publishDate}>
                {formatDate(article.publishDate)}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
