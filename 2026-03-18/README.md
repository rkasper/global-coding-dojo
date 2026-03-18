# PDF Bank Statement Reorderer

A web app that reverses the order of bank statements in a scanned PDF. Statements are detected by "Page X of Y" markers, grouped, reversed, and reassembled into a new PDF.

## Quick Start

```bash
deno task dev    # Start server at http://localhost:8000
deno task test   # Run all tests
```

## How It Works

1. Upload a PDF containing multiple bank statements (most recent first)
2. The app detects statement boundaries using "Page X of Y" regex patterns
3. Statement groups are reversed so the oldest appears first
4. Download the reordered PDF

## Custom Patterns

The default pattern is `Page\s+(\d+)\s+of\s+(\d+)` (case-insensitive). Capture group 1 must be the page number within the statement — a new statement starts when it equals "1".

## Docker

```bash
docker build -t pdf-reorder .
docker run -p 8000:8000 pdf-reorder
```
