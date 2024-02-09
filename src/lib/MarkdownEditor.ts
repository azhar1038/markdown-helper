import {
  DocumentSymbol,
  Position,
  Range,
  Selection,
  TextEditor,
  TextEditorEdit,
  commands,
  window,
} from "vscode";
import Constants from "./Constants";

export default class MarkdownEditor {
  editor: TextEditor;

  constructor() {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
      throw new Error("No editor found");
    }

    this.editor = editor;
  }

  private isSymbolAtPosition(symbol: string, position: Position): boolean {
    const range = new Range(
      position,
      new Position(position.line, position.character + symbol.length)
    );

    return this.editor.document.getText(range) === symbol;
  }

  private getSelectedRange(): Range {
    return new Range(this.editor.selection.start, this.editor.selection.end);
  }

  private setSelectedRange(range: Range) {
    this.editor.selection = new Selection(range.start, range.end);
  }

  private getSelectedRangeWithSymbol(symbol: string): Range {
    const editor = this.editor;
    const document = editor.document;

    let start = this.editor.selection.start;
    let end = this.editor.selection.end;

    if (start.character >= symbol.length) {
      const preRange = new Range(
        start.line,
        start.character - symbol.length,
        start.line,
        start.character
      );

      if (document.getText(preRange) === symbol) {
        start = preRange.start;
      }
    }

    const postRange = new Range(
      end.line,
      end.character,
      end.line,
      end.character + symbol.length
    );

    if (document.getText(postRange) === symbol) {
      end = postRange.end;
    }

    return new Range(start, end);
  }

  private async removeSymbol(symbol: string, startPositions: Position[]) {
    this.editor
      .edit((editBuilder) => {
        for (const position of startPositions) {
          const range = new Range(
            position,
            new Position(position.line, position.character + symbol.length)
          );

          if (this.editor.document.getText(range) === symbol) {
            editBuilder.delete(range);
          }
        }
      })
      .then(async (success) => {
        if (success) {
          await this.editor.document.save();
        }
      });
  }

  private async addSymbol(
    symbols: string | string[],
    startPositions: Position[]
  ) {
    if (Array.isArray(symbols)) {
      if (symbols.length !== startPositions.length) {
        throw Error("Length of symbols and startPositions must be same");
      }
    } else {
      symbols = new Array(startPositions.length).fill(symbols);
    }

    this.editor
      .edit((editBuilder) => {
        for (let i = 0; i < symbols.length; i++) {
          editBuilder.insert(startPositions[i], symbols[i]);
        }
      })
      .then(async (success) => {
        if (success) {
          await this.editor.document.save();
        }
      });
  }

  private toggleSymbolInRange(symbol: string, range: Range) {
    const document = this.editor.document;
    const startRange = new Range(
      range.start,
      new Position(range.start.line, range.start.character + symbol.length)
    );

    const endRange = new Range(
      new Position(range.end.line, range.end.character - symbol.length),
      range.end
    );

    const hasSymbolAtStart = document.getText(startRange) === symbol;
    const hasSymbolAtEnd = document.getText(endRange) === symbol;

    if (hasSymbolAtStart && hasSymbolAtEnd) {
      this.removeSymbol(symbol, [startRange.start, endRange.start]);
    } else {
      this.addSymbol(symbol, [startRange.start, endRange.end]);
      this.setSelectedRange(
        new Range(
          new Position(range.start.line, range.start.character + symbol.length),
          new Position(
            range.end.line,
            range.end.character + (range.isSingleLine ? symbol.length : 0)
          )
        )
      );
    }
  }

  toggleBold() {
    const symbol = "**";
    const range = this.getSelectedRangeWithSymbol(symbol);
    this.toggleSymbolInRange(symbol, range);
  }

  toggleItalic() {
    const symbol = "_";
    const range = this.getSelectedRangeWithSymbol(symbol);
    this.toggleSymbolInRange(symbol, range);
  }

  toggleInlineCode() {
    const symbol = "`";
    const range = this.getSelectedRangeWithSymbol(symbol);
    this.toggleSymbolInRange(symbol, range);
  }

  toggleBlockCode() {
    const symbol = "```";
    const range = this.getSelectedRange();

    const symbolExists =
      this.isSymbolAtPosition(symbol, new Position(range.start.line, 0)) &&
      this.isSymbolAtPosition(symbol, new Position(range.end.line, 0));

    if (symbolExists) {
      this.removeSymbol("```", [
        new Position(range.start.line, 0),
        new Position(range.end.line, 0),
      ]);
    } else {
      this.addSymbol(
        ["```\n", "\n```"],
        [
          new Position(range.start.line, 0),
          new Position(
            range.end.line,
            this.editor.document.lineAt(range.end.line).text.length
          ),
        ]
      );
    }
  }

  toggleBlockquote() {
    const symbol = "> ";
    const range = this.getSelectedRange();

    const symbolExists = this.isSymbolAtPosition(
      symbol,
      new Position(range.start.line, 0)
    );

    const positions: Position[] = [];
    for (let line = range.start.line; line <= range.end.line; line++) {
      positions.push(new Position(line, 0));
    }

    if (symbolExists) {
      this.removeSymbol(symbol, positions);
    } else {
      this.addSymbol(symbol, positions);
    }
  }

  async toggleTocHeaderIgnore() {
    const range = this.getSelectedRange();
    const line = range.start.line;
    const text = this.editor.document.lineAt(line).text;

    if (!Constants.REG_HEADER.test(text)) {
      return;
    }

    if (text.endsWith(Constants.TOC_HEADER_IGNORE)) {
      this.removeSymbol(Constants.TOC_HEADER_IGNORE, [
        new Position(line, text.length - Constants.TOC_HEADER_IGNORE.length),
      ]);
    } else {
      this.addSymbol(Constants.TOC_HEADER_IGNORE, [
        new Position(line, text.length),
      ]);
    }
  }
}
