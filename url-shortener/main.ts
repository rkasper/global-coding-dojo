const serviceURL = "https://soepi.co/";
let serialNumber = 0;
const originalUrls = new Map<string, string>();

export function shorten(originalUrl: string): string {
  const shortUrl = serviceURL + serialNumber++;
  originalUrls.set(shortUrl, originalUrl);
  return shortUrl;
}

export function getOriginalUrl(shortUrl:string): string {
  const originalUrl = originalUrls.get(shortUrl);
  if (!originalUrl) {
    throw new Error('Short URL not found: The provided URL has not been shortened by this service or does not exist');
  }
  return originalUrl;
}
