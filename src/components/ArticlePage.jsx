import { useParams, Navigate } from "react-router-dom";
import { articles } from "../articles";
import { CodeBlock } from "./CodeBlock";
import { Tweet } from "./Tweet";
import { Video } from "./Video";

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
    Video,
  };
  return (
    <>
      <div className="w-full max-w-3xl mx-auto py-12 px-4">
        <div className="prose w-full">
          <ArticleComponent components={components} />
        </div>
      </div>
    </>
  );
}
