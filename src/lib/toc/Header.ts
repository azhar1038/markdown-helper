import { DocumentSymbol, Position, Range, SymbolKind } from "vscode";
import Constants from "../Constants";
import { generateSlug } from "./utils";

export default class Header {
  title: string = "";
  depth: number = 1;
  slug: string = "";
  range: Range = new Range(0, 0, 0, 0);
  private _repeatCount: number | undefined;

  public set repeatCount(count: number | undefined) {
    this._repeatCount = count;
    this.slug = `${this.slug}-${this._repeatCount}`;
  }

  public initializeFromSymbol(symbol: DocumentSymbol): Header | undefined {
    if (symbol.kind !== SymbolKind.String) {
      return;
    }

    const text = symbol.name;
    let match = text.match(Constants.REG_HEADER);

    if (!match) {
      return;
    }

    const depth = match[1].length;
    let title = match[2];

    match = title.match(Constants.REG_LINK);
    if (match) {
      // If header contains link, extract the text
      title = match[1];
    }

    this.depth = depth;
    this.title = title;
    this.slug = generateSlug(title);
    this.range = new Range(
      symbol.range.start,
      new Position(symbol.range.start.line, symbol.name.length)
    );

    return this;
  }

  public getMarkdownLink(): string {
    let text = `[${this.title}](#${this.slug})`;
    return text;
  }
}
