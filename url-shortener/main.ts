let serialNumber = 0;

export function shorten(originalUrl: string): string {

  const serviceURL = "https://soepi.co/";

  return serviceURL + serialNumber++;
}

// TODO
export function getOriginalUrl(shortUrl:string): string {
  return "poop";
}
