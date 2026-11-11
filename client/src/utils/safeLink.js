/**
 * Return the link only when it is a plain http(s) URL, otherwise null.
 * Security: stops `javascript:` and `data:` links (saved before the server cleaned them,
 * or from an old public deck) from running code when someone clicks "Learn more".
 */
export function safeHref(link) {
  if (!link || typeof link !== 'string') return null;
  try {
    const url = new URL(link.trim(), window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
