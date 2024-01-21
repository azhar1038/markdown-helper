import { commands, ExtensionContext } from "vscode";
import MarkdownMate from "./MarkdownMate";

export function activate(context: ExtensionContext) {
  const markdownMate = new MarkdownMate();

  const insertToc = commands.registerCommand("markdown-mate.toc.insert", () => {
    markdownMate.insertOrUpdateToc();
  });

  const removeToc = commands.registerCommand("markdown-mate.toc.remove", () => {
    markdownMate.removeToc();
  });

  const toggleBold = commands.registerCommand(
    "markdown-mate.format.toggle.bold",
    () => {
      markdownMate.toggleBold();
    }
  );

  const toggleItalic = commands.registerCommand(
    "markdown-mate.format.toggle.italic",
    () => {
      markdownMate.toggleItalic();
    }
  );

  const toggleInlineCode = commands.registerCommand(
    "markdown-mate.format.toggle.inlinecode",
    () => {
      markdownMate.toggleInlineCode();
    }
  );

  const toggleBlockCode = commands.registerCommand(
    "markdown-mate.format.toggle.blockcode",
    () => {
      markdownMate.toggleBlockCode();
    }
  );

  const toggleBlockquote = commands.registerCommand(
    "markdown-mate.format.toggle.blockquote",
    () => {
      markdownMate.toggleBlockquote();
    }
  );

  const insertTable = commands.registerCommand(
    "markdown-mate.table.insert",
    () => {
      markdownMate.insertTable();
    }
  );

  const formatTable = commands.registerCommand(
    "markdown-mate.table.format",
    () => {
      markdownMate.formatTable();
    }
  );

  context.subscriptions.push(insertToc);
  context.subscriptions.push(removeToc);
  context.subscriptions.push(toggleBold);
  context.subscriptions.push(toggleItalic);
  context.subscriptions.push(toggleInlineCode);
  context.subscriptions.push(toggleBlockquote);
  context.subscriptions.push(insertTable);
  context.subscriptions.push(formatTable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
