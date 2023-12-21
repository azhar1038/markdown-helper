import {
  DocumentSymbol,
  Range,
  SymbolKind,
  Uri,
  commands,
  window,
} from "vscode";
import { Config } from "./ConfigManager";
import Constants from "../Constants";
import { generateSlug } from "./utils";

export type Header = {
  title: string;
  depth: number;
  range: Range;
  slug: string;
};

export default class HeaderManager {
  config: Config;
  private headers: Header[] = [];
  private headerCounter = new Map<string, number>();

  constructor(config: Config) {
    this.config = config;
  }

  private addHeader = (symbol: DocumentSymbol) => {
    if (symbol.kind === SymbolKind.String) {
      // Headers always have kind 14
      const text = symbol.name;
      const match = text.match(Constants.REG_HEADER);

      if (!match) {
        return;
      }

      const depth = match[1].length;
      let title = match[2];
      const titleCount = this.headerCounter.get(title);
      if (titleCount === undefined) {
        this.headerCounter.set(title, 1);
      } else {
        this.headerCounter.set(title, titleCount + 1);
        title = `${title.trimEnd()}-${titleCount}`;
      }

      if (depth >= this.config.minDepth && depth <= this.config.maxDepth) {
        this.headers.push({
          title,
          depth,
          range: symbol.range,
          slug: generateSlug(title),
        });
      }

      if (depth < this.config.maxDepth) {
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

      symbols.forEach(this.addHeader);
    } catch (err) {
      console.log(err);
      window.showErrorMessage("Failed to load headers");
    }

    return this.headers;
  }

  public getHeaderText(header: Header) {
    return `[${header.title}](#${header.slug})`;
  }
}
