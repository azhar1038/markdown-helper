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
import TocHeader from "./TocHeader";

export default class TocHeaderManager {
  tocConfig: TocConfig;
  private headers: TocHeader[] = [];
  private headerCounter = new Map<string, number>();

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
      this.headerCounter.set(title, (this.headerCounter.get(title) ?? 0) + 1);

      if (
        depth >= this.tocConfig.minDepth &&
        depth <= this.tocConfig.maxDepth
      ) {
        this.headers.push(
          new TocHeader(
            title,
            depth,
            symbol.range,
            this.headerCounter.get(title)
          )
        );
      }

      if (depth < this.tocConfig.maxDepth) {
        symbol.children?.forEach((child) => this.addHeader(child));
      }
    }
  };

  public async getHeaders(): Promise<TocHeader[]> {
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
