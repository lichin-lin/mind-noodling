import { useEffect, ReactNode } from 'react'

interface ScrollytellingLayoutProps {
  demoContent: ReactNode
  articleContent: ReactNode
  activeExample: number
}

export const ScrollytellingLayout = ({
  demoContent,
  articleContent,
  activeExample,
}: ScrollytellingLayoutProps) => {
  return (
    <div className="scrollytelling-container">
      {/* Sticky left demo area */}
      <div className="demo-area">
        <div className="demo-content" key={activeExample}>
          {demoContent}
        </div>
      </div>

      {/* Scrollable right article area */}
      <div className="article-area">{articleContent}</div>

      <style>{`
        .scrollytelling-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          min-height: 100vh;
        }

        .demo-area {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-right: 1px solid #e5e7eb;
        }

        .demo-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .article-area {
          padding: 4rem 3rem;
          background: white;
          overflow-y: auto;
        }

        /* Mobile fallback - single column */
        @media (max-width: 1024px) {
          .scrollytelling-container {
            grid-template-columns: 1fr;
          }

          .demo-area {
            position: relative;
            height: auto;
            min-height: 400px;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }

          .article-area {
            padding: 2rem 1.5rem;
          }

        }
      `}</style>
    </div>
  )
}

interface SectionProps {
  children: ReactNode
  exampleNumber: number
  onVisible: (exampleNumber: number) => void
}

export const Section = ({
  children,
  exampleNumber,
  onVisible,
}: SectionProps) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(exampleNumber)
          }
        })
      },
      {
        // Trigger when section title reaches 25% from top
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    )

    const element = document.getElementById(`section-${exampleNumber}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [exampleNumber, onVisible])

  return (
    <div id={`section-${exampleNumber}`} className="section">
      {children}
      <div style={{ height: '1px', width: '100%', background: '#EEE' }} />
      {/* Spacer for better intersection */}
    </div>
  )
}
