# Dot Vote: VS Code extension

Counts the votes in the Markdown file you have open, using the voting
machine from the web UI.

- **Dot votes**: lines like `- my idea XXX`
- **Ranked ballots**: lines like `Name: 1st choice > 2nd choice`

## Try it

From the `2026-11-11` folder:

```bash
deno task extension      # build: bundles ../vote.ts and copies the page into out/
deno task extension:run  # opens a VS Code window with the extension loaded
```

In that window, open `sample-votes.md` or `ranked-votes.md` and run
**Dot Vote: Count Votes**. You can start it from the ☑ button in the
editor title bar, the **Count votes** item in the status bar, or the
Command Palette. Edit the X's and the tally updates as you type. Click the
lever to recount with the animation.

## How it fits together

- `../vote.ts` holds the logic. `deno bundle` turns it into `out/vote.js`
  (CommonJS), so the extension and the web app count the same way.
- `../static/index.html` is the page. The build copies it to
  `out/index.html`. In a browser it asks the Deno server; in VS Code it
  gets results from the extension through `postMessage`.
- `src/extension.js` is the extension: it registers the command, opens the
  webview, and sends a new count whenever the file changes.

`out/` is generated, so rebuild after changing `vote.ts` or the page.
