import { Position, Range, Selection, window } from "vscode";
import { escapeRegExp } from "./toc/utils";

export default class MarkdownEditor {
  getSelectedRange(): Range {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
      throw new Error("No editor found");
    }

    return new Range(editor.selection.start, editor.selection.end);
  }

  private wrapWithSymbol(range: Range, symbol: string) {
    const start = range.start;
    const end = range.end;

    const editor = window.activeTextEditor;
    if (editor === undefined) {
      throw new Error("No editor found");
    }

    editor
      .edit((editBuilder) => {
        editBuilder.insert(start, symbol);
        editBuilder.insert(end, symbol);
      })
      .then(async (success) => {
        if (success) {
          editor.selection = new Selection(
            start.line,
            start.character + symbol.length,
            end.line,
            end.character + symbol.length
          );
          if (!start.isEqual(end)) {
            // Save only if there was some text between the range
            await editor.document.save();
          }
        }
      });
  }

  private removeWrapSymbol(range: Range, symbol: string) {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
      throw new Error("No editor found");
    }

    const start = range.start;
    const end = range.end;

    const regSymbol = escapeRegExp(symbol);
    const regExp = new RegExp(`^${regSymbol}(.*)${regSymbol}$`);

    const text = editor.document.getText(range);
    const match = text.match(regExp);

    if (!match) {
      return;
    }

    editor
      .edit((editBuilder) => {
        editBuilder.replace(range, match[1]);
      })
      .then(async (success) => {
        if (success) {
          editor.selection = new Selection(
            start.line,
            start.character,
            end.line,
            end.character - 2 * symbol.length
          );
          await editor.document.save();
        }
      });
  }

  private toggleSymbol(range: Range, symbol: string) {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
      throw new Error("No editor found");
    }

    const regSymbol = escapeRegExp(symbol);
    const regExp = new RegExp(`^${regSymbol}(.*)${regSymbol}$`);

    let text = editor.document.getText(range);
    let match = text.match(regExp);

    if (match) {
      this.removeWrapSymbol(range, symbol);
    }

    if (range.start.character >= symbol.length) {
      const start = new Position(
        range.start.line,
        range.start.character - symbol.length
      );

      const end = new Position(
        range.end.line,
        range.end.character + symbol.length
      );

      const extendedRange = new Range(start, end);
      text = editor.document.getText(extendedRange);
      match = text.match(regExp);

      if (match) {
        this.removeWrapSymbol(extendedRange, symbol);
      }
    }

    this.wrapWithSymbol(range, symbol);
  }

  toggleBold(range: Range) {
    this.toggleSymbol(range, "**");
  }

  toggleItalic(range: Range) {
    this.toggleSymbol(range, "_");
  }
}
