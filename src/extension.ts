import { commands, ExtensionContext, window } from "vscode";
import MarkdownHelper from "./MarkdownHelper";

export function activate(context: ExtensionContext) {
  const markdownHelper = new MarkdownHelper();

  console.log("Active");
  let disposable = commands.registerCommand(
    "markdown-helper.helloWorld",
    async () => {
      await markdownHelper.insertOrUpdateToc();
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
