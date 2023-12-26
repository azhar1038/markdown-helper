import { commands, ExtensionContext } from "vscode";
import MarkdownHelper from "./MarkdownHelper";

export function activate(context: ExtensionContext) {
  const markdownHelper = new MarkdownHelper();

  const insertToc = commands.registerCommand("markdown-mate.toc.insert", () => {
    markdownHelper.insertOrUpdateToc();
  });

  const removeToc = commands.registerCommand("markdown-mate.toc.remove", () => {
    markdownHelper.removeToc();
  });

  const toggleBold = commands.registerCommand(
    "markdown-mate.format.toggle.bold",
    () => {
      markdownHelper.toggleBold();
    }
  );

  const toggleItalic = commands.registerCommand(
    "markdown-mate.format.toggle.italic",
    () => {
      markdownHelper.toggleItalic();
    }
  );

  context.subscriptions.push(insertToc);
  context.subscriptions.push(removeToc);
  context.subscriptions.push(toggleBold);
  context.subscriptions.push(toggleItalic);
}

// This method is called when your extension is deactivated
export function deactivate() {}
