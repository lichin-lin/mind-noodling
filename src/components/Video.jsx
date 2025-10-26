/**
 * Video component for MDX
 * Supports both imported video sources and external URLs
 * 
 * Usage in MDX:
 * <Video src={importedVideo} />
 * or
 * <Video src="/path/to/video.mp4" />
 * 
 * Optional props:
 * - autoPlay: boolean (default: false)
 * - loop: boolean (default: false)
 * - muted: boolean (default: false)
 * - controls: boolean (default: true)
 * - caption: string
 */
export function Video({ 
  src, 
  autoPlay = false, 
  loop = false, 
  muted = false, 
  controls = true,
  caption,
  className = "",
  ...props 
}) {
  if (!src) {
    return (
      <div className="component-warning">
        <p>⚠️ Video component requires a src prop</p>
      </div>
    );
  }

  return (
    <figure className={`video-wrapper ${className}`}>
      <div className="video-container">
        <video
          src={src}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline
          {...props}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      {caption && (
        <figcaption>{caption}</figcaption>
      )}
    </figure>
  );
}export default Video;
