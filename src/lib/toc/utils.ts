import { TextDocument } from "vscode";
import Constants from "../Constants";

export function isCodeBlockStartOrEnd(
  lineNumber: number,
  doc: TextDocument
): boolean {
  const lineText = doc.lineAt(lineNumber).text;
  return lineText.match(Constants.REG_CODE_BLOCK) !== null;
}

export function getNextLineOutsideCodeBlock(
  lineNumber: number,
  doc: TextDocument
): number {
  for (let i = lineNumber + 1; i < doc.lineCount; i++) {
    if (isCodeBlockStartOrEnd(i, doc)) {
      return i + 1;
    }
  }

  return doc.lineCount - 1;
}

export function generateSlug(text: string): string {
  return text
    .replace(/^\s+|\s+$/g, "") // trim leading/trailing white space
    .toLowerCase() // convert string to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters
    .replace(/\s+/g, "-"); // replace spaces with hyphens
}
