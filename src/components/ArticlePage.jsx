import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
  const siteUrl = "https://mind-noodling.vercel.app";
  const articleUrl = `${siteUrl}/${article.slug}`;
  const imageUrl = article.coverImage
    ? `${siteUrl}${article.coverImage}`
    : `${siteUrl}/og-default.png`;

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{article.title} - Mind noodling</title>
        <meta name="title" content={article.title} />
        <meta name="description" content={article.description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:site_name" content="Mind noodling" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={articleUrl} />
        <meta property="twitter:title" content={article.title} />
        <meta property="twitter:description" content={article.description} />
        <meta property="twitter:image" content={imageUrl} />
      </Helmet>
      <div className="w-full max-w-3xl mx-auto py-12 px-4">
        <div className="prose w-full">
          <ArticleComponent components={components} />
        </div>
      </div>
    </>
  );
}
