import { Range, window } from "vscode";
import Constants from "../Constants";

export default class Table {
  public format() {
    //TODO: Check if header present or not
    //TODO: Don't consider length for header ---

    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;

    const curPos = editor.selection.active;
    const curLine = curPos.line;

    let startLine = curLine;
    let endLine = curLine;

    while (startLine >= 0) {
      const line = document.lineAt(startLine).text;
      if (line.length < 2) {
        break;
      }
      const firstChar = line[0];
      const lastChar = line[line.length - 1];
      if (firstChar === "|" && lastChar === "|") {
        startLine--;
      } else {
        break;
      }
    }

    startLine++;

    while (endLine < document.lineCount) {
      const line = document.lineAt(endLine).text;
      if (line.length < 2) {
        break;
      }
      const firstChar = line[0];
      const lastChar = line[line.length - 1];
      if (firstChar === "|" && lastChar === "|") {
        endLine++;
      } else {
        break;
      }
    }

    endLine--;

    // return;
    const colWidth: number[] = [];

    for (let idx = startLine; idx <= endLine; idx++) {
      const line = document.lineAt(idx).text;
      const columns: string[] = line.split(/(?<!\\)\|/);
      // Ignore first and last string, which should be empty
      for (let c = 1; c < columns.length - 1; c++) {
        if (c > colWidth.length) {
          colWidth.push(columns[c].trim().length);
        } else {
          colWidth[c - 1] = Math.max(colWidth[c - 1], columns[c].trim().length);
        }
      }
    }

    console.log(colWidth);

    let tableStr = "";

    const columns: string[] = document
      .lineAt(startLine)
      .text.split(/(?<!\\)\|/);

    for (let c = 1; c < columns.length - 1; c++) {
      tableStr += `| ${columns[c].trim()}`.padEnd(colWidth[c - 1] + 2) + " ";
    }
    tableStr += "|" + Constants.EOL;

    for (let c = 1; c < columns.length - 1; c++) {
      tableStr += "| ".padEnd(colWidth[c - 1] + 2, "-") + " ";
    }
    tableStr += "|" + Constants.EOL;

    for (let idx = startLine + 2; idx <= endLine; idx++) {
      const line = document.lineAt(idx).text;
      const columns: string[] = line.split(/(?<!\\)\|/);
      // Ignore first and last string, which should be empty
      for (let c = 1; c < columns.length - 1; c++) {
        tableStr += `| ${columns[c].trim()}`.padEnd(colWidth[c - 1] + 2) + " ";
      }
      tableStr += "|" + Constants.EOL;
    }

    editor
      .edit((editBuilder) => {
        editBuilder.replace(new Range(startLine, 0, endLine + 1, 0), tableStr);
      })
      .then((success) => {
        if (success) {
          editor.document.save();
        }
      });
  }

  public async insert(): Promise<void> {
    const rowsInput = await window.showInputBox({
      prompt: "How many rows needed?",
    });

    const colsInput = await window.showInputBox({
      prompt: "How many columns needed?",
    });

    let rows = parseInt(rowsInput ?? "");
    let cols = parseInt(colsInput ?? "");

    if (isNaN(rows)) {
      rows = 1;
    }

    if (isNaN(cols)) {
      cols = 1;
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    let tablestr = "";
    const curPos = editor.selection.active;
    if (curPos.character > 0) {
      tablestr = Constants.EOL;
    }

    for (let c = 0; c < cols; c++) {
      tablestr += `| Heading ${c + 1} `;
    }

    tablestr += "|" + Constants.EOL;

    for (let c = 0; c < cols; c++) {
      tablestr += "| --- ";
    }

    tablestr += "|" + Constants.EOL;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tablestr += "|     ";
      }

      tablestr += "|";
      if (r < rows - 1) {
        tablestr += Constants.EOL;
      }
    }

    editor
      .edit((editBuilder) => {
        editBuilder.insert(curPos, tablestr);
      })
      .then((success) => {
        if (success) {
          this.format();
        }
      });
  }
}
