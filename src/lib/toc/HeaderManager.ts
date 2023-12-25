import { DocumentSymbol, TextEditor, Uri, commands, window } from "vscode";
import { Config } from "./ConfigManager";
import Header from "./Header";
import Constants from "../Constants";

export default class HeaderManager {
  config: Config;
  private headers: Header[] = [];
  private headerCounter = new Map<string, number>();

  constructor(config: Config) {
    this.config = config;
  }

  private addHeader = (editor: TextEditor, symbol: DocumentSymbol) => {
    const header = new Header().initializeFromSymbol(symbol);
    if (!header) {
      return;
    }

    const titleCount = this.headerCounter.get(header.title);
    if (titleCount === undefined) {
      this.headerCounter.set(header.title, 1);
    } else {
      this.headerCounter.set(header.title, titleCount + 1);
      header.repeatCount = titleCount;
    }

    if (
      header.depth >= this.config.minDepth &&
      header.depth <= this.config.maxDepth
    ) {
      this.headers.push(header);
    }

    if (header.depth < this.config.maxDepth) {
      symbol.children.forEach((child) => this.addHeader(editor, child));
    }
  };

  public async getHeaders(): Promise<Header[]> {
    const editor = window.activeTextEditor;
    if (!editor) {
      return [];
    }

    const fileUri = Uri.file(editor.document.fileName);
    try {
      const symbols = await commands.executeCommand<DocumentSymbol[]>(
        "vscode.executeDocumentSymbolProvider",
        fileUri
      );

      symbols?.forEach((symbol) => this.addHeader(editor, symbol));
    } catch (err) {
      console.log(err);
      window.showErrorMessage("Failed to load headers");
    }

    return this.headers;
  }
}
