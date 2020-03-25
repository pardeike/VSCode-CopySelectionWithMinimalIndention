import * as vscode from "vscode";
import { EndOfLine, TextLine } from "vscode";

function processLines(lines: TextLine[], eol: string): string {
  const idx1 = lines.findIndex(line => !line.isEmptyOrWhitespace);
  const idx2 = lines.map(line => line.isEmptyOrWhitespace).lastIndexOf(false);
  if (idx1 < 0 || idx2 < idx1) {
    return "";
  }
  let croppedLines = lines.slice(idx1, idx2 + 1).map(line => line.text);
  while (croppedLines[0].length > 0) {
    const c = croppedLines[0][0];
    if (croppedLines.filter(line => !line.startsWith(c)).length > 0) {
      break;
    }
    croppedLines = croppedLines.map(line => line.substring(1));
  }
  return croppedLines.join(eol);
}

function createAction(useContext: boolean): () => void {
  return () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const lines: TextLine[] = [];
    editor.selections.forEach(selection => {
      const startLine = selection.start.line;
      const endLine = selection.end.line;
      for (let i = startLine; i <= endLine; i++) {
        lines.push(editor.document.lineAt(i));
      }
    });
    if (lines.length > 0) {
      const eol = editor.document.eol === EndOfLine.CRLF ? "\r\n" : "\n";
      let text = processLines(lines, eol);
      if (useContext) {
        text = `\`\`\`${editor.document.languageId}${eol}${text}${eol}\`\`\``;
      }
      vscode.env.clipboard.writeText(text);
      const lineCount = lines.length;
      const s = lineCount === 1 ? "" : "s";
      vscode.window.setStatusBarMessage(`${lineCount} line${s} copied`, 1500);
    }
  };
}

export function activate(context: vscode.ExtensionContext) {
  const disposable1 = vscode.commands.registerCommand(
    "extension.copyselectionwithminimalindention1",
    createAction(false)
  );
  const disposable2 = vscode.commands.registerCommand(
    "extension.copyselectionwithminimalindention2",
    createAction(true)
  );
  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);
}
export function deactivate() {}
