import { window } from "vscode";
import RegexStrings from "./RegexStrings";

export default class TocConfig {
  minDepth = 2;
  maxDepth = 6;

  constructor() {
    this.updateConfigFromFile();
  }

  private extractconfigValue(config: string): string {
    const [_, value] = config.split("=");
    return value;
  }

  public updateConfigFromFile() {
    const editor = window.activeTextEditor;
    if (editor === undefined) {
      return window.showErrorMessage("Failed to load TOC config");
    }

    for (let line = 0; line < editor.document.lineCount; line++) {
      const text = editor.document.lineAt(line).text;
      const match = text.match(RegexStrings.TOC_START);
      if (match) {
        if (match[3] !== undefined) {
          this.minDepth = parseInt(this.extractconfigValue(match[3]));
        } else if (match[1] !== undefined) {
          this.minDepth = parseInt(this.extractconfigValue(match[1]));
        }

        if (match[2] !== undefined) {
          this.maxDepth = parseInt(this.extractconfigValue(match[2]));
        }

        if (this.minDepth < 1 || this.minDepth > 6) {
          this.minDepth = 2;
        }

        if (this.maxDepth < 1 || this.maxDepth > 6) {
          this.maxDepth = 6;
        }

        if (this.minDepth > this.maxDepth) {
          window.showErrorMessage("minDepth cannot be greater than maxdepth");
        }

        break;
      }
    }
  }
}
