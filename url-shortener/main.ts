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
  // TODO Add a test for this case, improve the error message
  if (!originalUrl) {
    throw new Error('poop');
  }
  return originalUrl;
}
