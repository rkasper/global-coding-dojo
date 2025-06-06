import {assert, assertEquals, assertNotEquals, assertThrows,} from "@std/assert";
import {getOriginalUrl, shorten} from "./main.ts";

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
  const longUrl = getOriginalUrl(actualShortenedUrl);
  assertEquals(longUrl, originalUrl);

  const bogusOriginalUrl = "https://poop.com/";
  assertThrows(
    () => getOriginalUrl(bogusOriginalUrl),
    Error,
    "Short URL not found: The provided URL has not been shortened by this service or does not exist",
  );
});

Deno.test(function handleBasicErrorCasesTest() {
  const invalidUrl = "poop";
  assertThrows(
    () => shorten(invalidUrl),
    Error,
    "Invalid URL format: The provided string is not a valid URL",
  );
});
