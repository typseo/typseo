export function absoluteHttpUrl(value: string | URL, field: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError(`${field} must be an absolute HTTP(S) URL.`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError(`${field} must be an absolute HTTP(S) URL.`);
  }
  return url.href;
}
