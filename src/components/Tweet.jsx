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
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-700">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Tweet component requires an id prop
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-6 overflow-x-auto">
      <div className="w-full max-w-[550px]">
        <ReactTweet id={id} />
      </div>
    </div>
  );
}

export default Tweet;
