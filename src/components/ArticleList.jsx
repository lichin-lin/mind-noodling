import { Link } from 'react-router-dom'
import { articles } from '../articles'
import { ExternalLink } from './ExternalLink'

export function ArticleList() {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col w-full max-w-3xl gap-8 px-2 pt-12 pb-20 article-list">
      {/* Header section with title and description */}
      <header className="flex flex-col gap-3 px-2">
        <div className="article-list-header">
          <h1>Mind Noodling</h1>
          <p>
            A collection of experiments and notes by{' '}
            <ExternalLink
              href="https://x.com/lichinlin"
              size={10}
              showArrow={false}
            >
              Lichin
            </ExternalLink>
            , exploring design, code, and the small details that make tools feel
            good to use.
          </p>
          <div className="flex gap-2">
            <ExternalLink href="https://designtips.today" size={10}>
              designtips.today
            </ExternalLink>
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
            className="w-full px-4 py-3 transition-colors duration-150 rounded-lg article-link"
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
  )
}
