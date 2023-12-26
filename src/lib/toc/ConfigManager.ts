import { Range, window, workspace } from "vscode";
import { getNextLineOutsideCodeBlock, isCodeBlockStartOrEnd } from "./utils";
import Constants from "../Constants";

export type Config = {
  minDepth: number;
  maxDepth: number;
  prettierIgnore: boolean;
};

export default class ConfigManager {
  private readonly defaultConfig: Config = {
    minDepth: 2,
    maxDepth: 4,
    prettierIgnore: false,
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

          case "prettierIgnore":
            config.prettierIgnore = propertyValue === "true";
            break;

          default:
            break;
        }
      }

      idx++;
    }

    return config;
  }

  public getModifiedConfig(config: Config): string[] {
    const changes: string[] = [];
    if (config.minDepth !== this.defaultConfig.minDepth) {
      changes.push(`<!-- minDepth=${config.minDepth} -->`);
    }

    if (config.maxDepth !== this.defaultConfig.maxDepth) {
      changes.push(`<!-- maxDepth=${config.maxDepth} -->`);
    }

    if (config.prettierIgnore !== this.defaultConfig.prettierIgnore) {
      changes.push(`<!-- prettierIgnore=${config.prettierIgnore} -->`);
    }

    return changes;
  }
}
