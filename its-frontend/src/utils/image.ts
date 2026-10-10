/**
 * Checks in the browser whether a URL can be loaded as an image.
 *
 * @param url       image URL to try
 * @param timeoutMs give up (and report false) after this many milliseconds
 * @returns a promise that resolves to true if the image loaded
 */
export function checkImageLoads(url: string, timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    const timer = window.setTimeout(() => finish(false), timeoutMs);

    /** Resolves once and cleans up the handlers. */
    function finish(loaded: boolean) {
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(loaded);
    }

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = url;
  });
}
