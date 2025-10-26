import { Tweet as ReactTweet } from "react-tweet";

/**
 * Custom Tweet component wrapper for MDX
 * Accepts tweet ID as prop and renders using react-tweet
 * 
 * Usage in MDX:
 * <Tweet id="1185574433026494464" />
 */
export function Tweet({ id }) {
  if (!id) {
    return (
      <div className="component-warning">
        <p>⚠️ Tweet component requires an id prop</p>
      </div>
    );
  }

  return (
    <div className="tweet-wrapper">
      <div className="tweet-container">
        <ReactTweet id={id} />
      </div>
    </div>
  );
}

export default Tweet;
