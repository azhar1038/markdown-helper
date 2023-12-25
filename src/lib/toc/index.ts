import { Position, Range, TextEditorEdit, window } from "vscode";
import Constants from "../Constants";
import { getNextLineOutsideCodeBlock, isCodeBlockStartOrEnd } from "./utils";
import ConfigManager, { Config } from "./ConfigManager";
import HeaderManager from "./HeaderManager";
import Header from "./Header";

export default class Toc {
  private tocRange: Range;
  private config: Config;
  private configManager: ConfigManager;
  private headerManager: HeaderManager;

  constructor() {
    this.tocRange = this.getTocRange();
    this.configManager = new ConfigManager();
    this.config = this.configManager.parseConfig(this.tocRange);
    this.headerManager = new HeaderManager(this.config);
  }

  private getTocRange(): Range {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
      window.showErrorMessage("Failed to load TOC config");
      return new Range(0, 0, 0, 0);
    }

    let tocStart: Position | undefined;
    let tocEnd: Position | undefined;
    let idx = 0;
    while (idx < editor.document.lineCount) {
      if (isCodeBlockStartOrEnd(idx, editor.document)) {
        idx = getNextLineOutsideCodeBlock(idx, editor.document);
      }

      const text = editor.document.lineAt(idx).text;
      if (!tocStart) {
        if (text.match(Constants.REG_TOC_START)) {
          tocStart = new Position(idx, 0);
        } else {
          idx++;
          continue;
        }
      }

      if (text.match(Constants.REG_TOC_END)) {
        tocEnd = new Position(idx, text.length);
        break;
      }

      idx++;
    }

    if (!tocStart) {
      tocStart = tocEnd = editor.selection.active;
    } else if (!tocEnd) {
      tocEnd = tocStart;
    }

    return new Range(tocStart, tocEnd);
  }

  private deleteToc(editBuilder: TextEditorEdit) {
    editBuilder.delete(this.tocRange);
  }

  private createToc(editBuilder: TextEditorEdit, headers: Header[]) {
    let minHeaderDepth = 6;
    headers.forEach((header) => {
      minHeaderDepth = Math.min(minHeaderDepth, header.depth);
    });

    let headerText: string[] = [];
    headerText.push(Constants.TOC_START);

    headerText = headerText.concat(
      this.configManager.getModifiedConfig(this.config)
    );

    headerText.push(""); // Extra line

    if (this.config.prettierIgnore) {
      headerText.push("<!-- prettier-ignore -->");
    }

    headers.forEach((header) => {
      headerText.push(
        Constants.TAB.repeat(header.depth - minHeaderDepth) +
          Constants.LIST_SYMBOL +
          " " +
          header.getMarkdownLink()
      );
    });

    headerText.push(""); // Extra line
    headerText.push(Constants.TOC_END);
    editBuilder.insert(this.tocRange.start, headerText.join(Constants.EOL));
  }

  public async insertOrUpdate() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const headers = await this.headerManager.getHeaders();

    editor
      .edit((editBuilder) => {
        this.deleteToc(editBuilder);
        this.createToc(editBuilder, headers);
      })
      .then(async () => {
        await editor.document.save();
      });
  }

  public async removeTocFromDoc() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    editor.edit((editBuilder) => {
      this.deleteToc(editBuilder);
    });
  }
}
