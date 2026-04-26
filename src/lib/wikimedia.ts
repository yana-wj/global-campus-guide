// Many alumni photos point to Wikipedia thumbnail URLs of the form
//   https://upload.wikimedia.org/wikipedia/commons/thumb/X/Y/file.jpg/440px-file.jpg
// These return HTTP 400 when the size segment is malformed or stale.
// Convert them to the original file URL which is always stable:
//   https://upload.wikimedia.org/wikipedia/commons/X/Y/file.jpg
export function fixWikimediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const m = url.match(
      /^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/thumb\/([^/]+\/[^/]+\/[^/]+)\/[^/]+$/,
    );
    if (m) return `${m[1]}/${m[2]}`;
    return url;
  } catch {
    return url;
  }
}
