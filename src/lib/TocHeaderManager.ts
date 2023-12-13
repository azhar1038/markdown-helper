import {
  DocumentSymbol,
  Range,
  SymbolKind,
  Uri,
  commands,
  window,
} from "vscode";
import TocConfig from "./TocConfig";
import RegexStrings from "./RegexStrings";

export type Header = {
  title: string;
  depth: number;
  range: Range;
};

export default class TocHeaderManager {
  tocConfig: TocConfig;
  private headers: Header[] = [];

  constructor(tocConfig: TocConfig) {
    this.tocConfig = tocConfig;
  }

  private addHeader = (symbol: DocumentSymbol) => {
    if (symbol.kind === SymbolKind.String) {
      // Headers always have kind 14
      const text = symbol.name;
      const match = text.match(RegexStrings.HEADER);

      if (!match) {
        return;
      }

      const depth = match[1].length;
      const title = match[2];
      if (
        depth >= this.tocConfig.minDepth &&
        depth <= this.tocConfig.maxDepth
      ) {
        this.headers.push({
          title,
          depth,
          range: symbol.range,
        });
      }

      if (depth < this.tocConfig.maxDepth) {
        symbol.children?.forEach((child) => this.addHeader(child));
      }
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

      symbols?.forEach(this.addHeader);
    } catch (err) {
      console.log(err);
      window.showErrorMessage("Failed to load headers");
    }

    return this.headers;
  }
}
