import { commands, ExtensionContext, window } from "vscode";
import MarkdownHelper from "./MarkdownHelper";

export function activate(context: ExtensionContext) {
  const markdownHelper = new MarkdownHelper();

  let insertToc = commands.registerCommand(
    "markdown-mate.insertToc",
    async () => {
      await markdownHelper.insertOrUpdateToc();
    }
  );

  let removeToc = commands.registerCommand(
    "markdown-mate.removeToc",
    async () => {
      await markdownHelper.removeToc();
    }
  );

  context.subscriptions.push(insertToc);
  context.subscriptions.push(removeToc);
}

// This method is called when your extension is deactivated
export function deactivate() {}
