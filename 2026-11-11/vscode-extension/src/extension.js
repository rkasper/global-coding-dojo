// Dot Vote VS Code extension.
//
// "Dot Vote: Count Votes" opens the voting machine beside the editor and
// counts the votes in the current file. The tally follows as you type.
// The counting logic is ../vote.ts, bundled into out/vote.js by the build.

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { countVotes } = require("./vote.js");

let panel; // the voting machine webview, while it is open
let doc; // the document being counted
let pending;

function activate(context) {
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  status.text = "$(checklist) Count votes";
  status.tooltip = "Dot Vote: count the X votes in this file";
  status.command = "dotVote.count";
  context.subscriptions.push(status);

  const updateStatus = (editor) =>
    editor?.document.languageId === "markdown" ? status.show() : status.hide();
  updateStatus(vscode.window.activeTextEditor);

  context.subscriptions.push(
    vscode.commands.registerCommand("dotVote.count", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("Dot Vote: open a vote file first.");
        return;
      }
      doc = editor.document;
      if (panel) {
        panel.reveal(vscode.ViewColumn.Beside, true);
        send(true);
      } else {
        panel = createPanel(context);
      }
    }),

    // Live tally: recount (without the animation) while the file is edited.
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (!panel || e.document !== doc) return;
      clearTimeout(pending);
      pending = setTimeout(() => send(false), 250);
    }),

    // Follow the active Markdown file.
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      updateStatus(editor);
      if (panel && editor?.document.languageId === "markdown" && editor.document !== doc) {
        doc = editor.document;
        send(true);
      }
    }),
  );
}

function createPanel(context) {
  const p = vscode.window.createWebviewPanel(
    "dotVote",
    "Dot Vote 🗳️",
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: true, localResourceRoots: [] },
  );
  p.webview.html = pageHtml(context, p.webview);

  p.webview.onDidReceiveMessage((msg) => {
    if (msg.type === "ready" || msg.type === "recount") send(true);
  });
  p.onDidDispose(() => (panel = undefined));
  return p;
}

function send(animate) {
  if (!panel || !doc) return;
  panel.webview.postMessage({
    type: "results",
    file: path.basename(doc.fileName),
    animate,
    data: countVotes(doc.getText()),
  });
}

// The same page the Deno server serves, plus a Content-Security-Policy that
// only lets our own inline script (marked with a nonce) run.
function pageHtml(context, webview) {
  const nonce = Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");
  const csp = [
    "default-src 'none'",
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`,
  ].join("; ");
  const html = fs.readFileSync(path.join(context.extensionPath, "out", "index.html"), "utf8");
  return html
    .replace("<head>", `<head>\n<meta http-equiv="Content-Security-Policy" content="${csp}">`)
    .replace("<script>", `<script nonce="${nonce}">`);
}

function deactivate() {}

module.exports = { activate, deactivate };
