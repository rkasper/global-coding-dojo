# URL Shortener Kata

Goal: Create a URL shortening service similar to bit.ly

## Level 1: Basic Shortening (In-Memory)
Create a basic URL shortener with in-memory storage.
- Generate a unique short code for a URL
- Store the mapping between short code and original URL
- Retrieve the original URL using the short code
- Handle basic error cases (invalid URLs, non-existent codes)

## Level 2: Enhanced Shortening
Make the shortening algorithm and features more robust.
- **Shorter, More User-Friendly URLs**: Instead of seeing incremental numbers that grow longer over time (like `soepi.co/0`, `soepi.co/1`, `soepi.co/2`), users would receive compact, alphanumeric codes (like `soepi.co/a7X9c`) that look more professional and are harder to guess sequentially.
- **Custom URL Aliases**: Users could request a specific word or phrase for their shortened URL:

```
// Sample API usage
shorten("https://example.com/very-long-path", {alias: "my-event"})
// Returns: "https://soepi.co/my-event"
```
If the requested alias is already taken, they'd receive an appropriate error message.
- **Basic Link Information**: When retrieving information about a shortened URL, users would see when it was created and when it expires:
```
// Sample API usage
getUrlInfo("https://soepi.co/a7X9c")
// Returns:
{originalUrl: "https://example.com",
 created: "2025-03-12T14:30:00Z",
 expires: "2025-03-19T14:30:00Z"
}
```
- **Better Error Handling**:
  - More Specific Error Messages: Users receive detailed, context-aware error messages that clearly explain what went wrong and how to fix it.
  Example: Instead of a generic `"Invalid URL"` message, they might see `"The URL 'example' is missing a protocol (http:// or https://)."`
  - Differentiated Error Types: The system returns different error types that clients can programmatically distinguish between.
  Example: A client application can tell the difference between a `"URL Not Found"` error versus an `"Invalid URL Format"` error, allowing for appropriate response handling.
  - Helpful Suggestions: Error messages include suggestions for how to correct the issue.
  Example: `"The alias 'my-event' is already taken. Try 'my-event-2025' or 'march-my-event' instead."`
  - Consistent Error Format: All errors follow a consistent structure, making it easier for client applications to parse and handle them.
  Example: All errors return a JSON object with fields for error code, message, and suggestions.

## Level 3: Persistence & Basic Services
Users would primarily notice the improved reliability and additional ways to interact with the service.
- **Persistent Links**: Your shortened URLs continue to work even after system maintenance or server restarts. Links you created yesterday, last week, or last month remain functional without interruption.

- **Web API Access**: Access the URL shortener through simple HTTP endpoints:
  - Create shortened URLs by sending a request to `POST https://soepi.co/api/shorten` with your long URL
  - Retrieve original URLs by visiting your shortened link or querying `GET https://soepi.co/api/info/[code]`
  - Error responses include clear status codes and helpful messages

- **Command Line Tool**: Interact with the service directly from your terminal:
  ```
  $ soepi shorten https://example.com/very-long-path
  Created: https://soepi.co/a7X9c
  
  $ soepi info a7X9c
  Original URL: https://example.com/very-long-path
  Created: March 12, 2025
  ```

- **Service Status Awareness**: The service clearly communicates its status:
  - During startup: "Restoring previous URLs... 1,243 URLs recovered"
  - During maintenance: "Service temporarily in read-only mode"

Here are the external perspectives for Levels 4-6:

## Level 4: Advanced Features

- **Limited-Time Links**: Create links that automatically expire after a set period. When someone tries to use an expired link, they see "This link has expired" instead of being redirected.
  ```
  $ soepi shorten https://example.com --expires 7d
  Created: https://soepi.co/b8Z3d (expires in 7 days)
  ```

- **Usage Tracking**: See how popular your links are:
  ```
  $ soepi info b8Z3d
  Original URL: https://example.com
  Created: March 12, 2025
  Clicks: 127
  Last accessed: 14 minutes ago
  ```

- **Basic Performance Insights**: Get simple charts showing when your links are being used:
  ```
  $ soepi stats b8Z3d
  Most active day: Tuesday (43 clicks)
  Peak usage time: 2-4 PM
  [Simple ASCII chart showing daily clicks]
  ```

- **Link Status Alerts**: Receive notifications for important events:
  - "Your link soepi.co/b8Z3d has reached 100 clicks"
  - "Your link soepi.co/a7X9c will expire in 24 hours"

## Level 5: Cloud Deployment & Multi-User

- **Anywhere Access**: Access the service from any device with an internet connection through the web interface at soepi.co

- **Personal Accounts**: Create your own account to manage all your links:
  - "Welcome back! You currently have 17 active links."
  - "Your most popular link has 843 clicks this month."

- **Link Dashboard**: View and manage all your shortened URLs in one place:
  - Sort links by creation date, popularity, or expiration date
  - Search through your links with a search box
  - Bulk operations like "Extend expiration for all selected links"

- **Usage Limits**: Clear feedback on service usage:
  - "You've used 80% of your free tier (40/50 links)"
  - "Rate limit reached: Please wait 5 minutes before creating more links"

## Level 6: Enterprise Features
These features progressively transform the service from a simple utility into a comprehensive, enterprise-ready platform that meets diverse user needs.

- **Team Workspaces**: Share and collaborate on link collections:
  - "Shared with Marketing Team (8 members)"
  - "New link created by Alex in the 'Spring Campaign' collection"

- **Rich Analytics**: Gain detailed insights about link usage:
  - Interactive maps showing geographic distribution of clicks
  - Charts breaking down usage by device type, browser, and referrer
  - Comparison tools: "This link performs 34% better on weekends"

- **Organized Link Management**: Structure links into meaningful groups:
  - Create folders like "Q1 Marketing," "Product Launch," or "Internal Documents"
  - Apply tags like #newsletter, #social, or #temporary
  - Filter view: "Show all links tagged #newsletter created in the last 30 days"

- **Brand Customization**: Control the user experience:
  - Use your own domain: "links.yourcompany.com" instead of "soepi.co"
  - Customize redirect pages with your logo and branding
  - Set up link warnings: "Warning: This link will take you to an external site"
  - Track conversions: "15% of visitors completed the purchase after clicking this link"
