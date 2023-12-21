import { Position, Range, TextEditorEdit, window } from "vscode";
import Constants from "../Constants";
import { getNextLineOutsideCodeBlock, isCodeBlockStartOrEnd } from "./utils";
import ConfigManager, { Config } from "./ConfigManager";
import HeaderManager, { Header } from "./HeaderManager";

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
    let tocEnd = new Position(0, 0);
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

    const headerText: string[] = [];
    headers.forEach((header) => {
      headerText.push(
        "\t".repeat(header.depth - minHeaderDepth) +
          "- " +
          this.headerManager.getHeaderText(header)
      );
    });

    editBuilder.insert(
      this.tocRange.start,
      `<!-- Toc -->\n<!-- prettier-ignore -->\n${headerText.join(
        "\n"
      )}\n<!-- /Toc -->`
    );
  }

  public async insertOrUpdate() {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const configManager = new ConfigManager();
    const config = configManager.parseConfig(this.tocRange);
    const headerManager = new HeaderManager(config);
    const headers = await headerManager.getHeaders();

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
