import { useParams, Navigate } from "react-router-dom";
import { articles } from "../articles";
import { CodeBlock } from "./CodeBlock";
import { Tweet } from "./Tweet";

export function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const ArticleComponent = article.Component;

  // Custom components for MDX
  const components = {
    pre: (props) => {
      if (props.children?.type === "code") {
        return <CodeBlock {...props.children.props} {...props} />;
      }
      return <pre {...props} />;
    },
    Tweet,
  };

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
      <div className="w-full max-w-3xl mx-auto py-12 px-4">
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
          <ArticleComponent components={components} />
        </div>
      </div>
    </>
  );
}
