import { assert , assertEquals, assertNotEquals} from "@std/assert";
import { shorten, getOriginalUrl } from "./main.ts";

Deno.test(function shortenAndUniqueTest() {
  const originalUrl = "https://example.com/";

  const expectedUrlPrefix = "https://soepi.co/";

  const actualShortenedUrl = shorten(originalUrl);
  const actualShortenedUrl2 = shorten(originalUrl);
  const actualShortenedUrl3 = shorten(originalUrl);

  console.log(actualShortenedUrl);
  console.log(actualShortenedUrl2);
  console.log(actualShortenedUrl3);

  assert(actualShortenedUrl.startsWith(expectedUrlPrefix));
  assert(actualShortenedUrl2.startsWith(expectedUrlPrefix));
  assert(actualShortenedUrl3.startsWith(expectedUrlPrefix));

  assertNotEquals(actualShortenedUrl, actualShortenedUrl2);
  assertNotEquals(actualShortenedUrl, actualShortenedUrl3);
  assertNotEquals(actualShortenedUrl2, actualShortenedUrl3);
});

Deno.test(function storeAndRetrieveTest() {
  const originalUrl = "https://example.com/";
  const actualShortenedUrl = shorten(originalUrl);
  const longUrl= getOriginalUrl(actualShortenedUrl);
  assertEquals(longUrl, originalUrl);
});
