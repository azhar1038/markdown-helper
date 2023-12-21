import { Range, window } from "vscode";
import { getNextLineOutsideCodeBlock, isCodeBlockStartOrEnd } from "./utils";
import Constants from "../Constants";

export type Config = {
  minDepth: number;
  maxDepth: number;
  headingText?: string;
  prettier: boolean;
};

export default class ConfigManager {
  private readonly defaultConfig: Config = {
    minDepth: 2,
    maxDepth: 4,
    headingText: undefined,
    prettier: false,
  };

  private parseDepth(value: string) {
    const newVal = parseInt(value);
    if (!newVal || newVal < 1) {
      return 1;
    } else if (newVal > 6) {
      return 6;
    }
    return newVal;
  }

  public parseConfig(tocRange: Range): Config {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage("Failed to get text editor");
      return this.defaultConfig;
    }

    let config = { ...this.defaultConfig };
    let idx = tocRange.start.line;
    while (idx <= tocRange.end.line) {
      if (isCodeBlockStartOrEnd(idx, editor.document)) {
        idx = getNextLineOutsideCodeBlock(idx, editor.document);
      }

      const text = editor.document.lineAt(idx).text;
      const match = text.match(Constants.REG_TOC_CONFIG);
      if (match) {
        const propertyName = match[1];
        const propertyValue = match[2];

        switch (propertyName) {
          case "minDepth":
            config.minDepth = this.parseDepth(propertyValue);
            break;

          case "maxDepth":
            config.maxDepth = this.parseDepth(propertyValue);
            break;

          case "prettier":
            config.prettier = propertyValue === "true";
            break;

          case "headingText":
            config.headingText = propertyValue;
            break;

          default:
            break;
        }
      }

      idx++;
    }

    return config;
  }
}
