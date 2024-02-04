import { Position, Range, TextEditor, window } from "vscode";
import Constants from "../Constants";
import Column from "./Column";
import Cell from "./Cell";

export default class Table {
  startLine: number;
  endLine: number;
  columns: Column[];
  editor: TextEditor;

  constructor() {
    const editor = window.activeTextEditor;
    if (!editor) {
      const errorMsg = "No editor found";
      window.showErrorMessage(errorMsg);
      throw new Error(errorMsg);
    }

    this.editor = editor;
    const document = editor.document;
    const curPos = editor.selection.active;
    const curLine = curPos.line;

    let startLine = curLine;
    let endLine = curLine;

    let found = false; // Found | in current line
    while (startLine >= 0) {
      const line = document.lineAt(startLine).text;
      if (Constants.REG_TABLE_COLUMN_SEPARATOR.test(line)) {
        found = true;
        startLine--;
      } else {
        break;
      }
    }

    if (found) {
      startLine++;
    }

    found = false;
    while (endLine < document.lineCount) {
      const line = document.lineAt(endLine).text;
      if (Constants.REG_TABLE_COLUMN_SEPARATOR.test(line)) {
        found = true;
        endLine++;
      } else {
        break;
      }
    }

    if (found) {
      endLine--;
    }

    this.startLine = startLine;
    this.endLine = endLine;
    this.columns = [];

    if (this.startLine === this.endLine) {
      // No table exists
      return;
    }

    // Verify if it is actually a table
    // Line after header must be separators

    // Create columns and headers
    let line = document.lineAt(startLine).text;
    let contents = this.splitLineToColumns(line);
    for (let col = 0; col < contents.length; col++) {
      const column = new Column();
      column.setHeader(contents[col]);
      this.columns.push(column);
    }

    // Header separators
    line = document.lineAt(startLine + 1).text;
    contents = this.splitLineToColumns(line);
    if (contents.length !== this.columns.length) {
      this.columns = [];
      this.endLine = this.startLine;
      return;
    }

    for (let col = 0; col < contents.length; col++) {
      if (!Constants.REG_TABLE_HEADER_SEPARATOR.test(contents[col])) {
        this.columns = [];
        this.endLine = this.startLine;
        return;
      }
      this.columns[col].setAlignment(contents[col]);
    }

    for (let idx = startLine + 2; idx <= endLine; idx++) {
      const line = document.lineAt(idx).text;
      const contents = this.splitLineToColumns(line);
      if (contents.length > this.columns.length) {
        const mergedCell = contents.splice(contents.length - 1).join("\\|");
        contents.push(mergedCell);
      }

      for (let col = 0; col < contents.length; col++) {
        const cell =
          contents.length > col ? new Cell(contents[col]) : new Cell();
        this.columns[col].insertCell(cell);
      }
    }
  }

  private splitLineToColumns(line: string) {
    const contents = line.split(Constants.REG_TABLE_COLUMN_SEPARATOR);
    if (line.endsWith("|")) {
      contents.pop();
    }

    if (line.startsWith("|")) {
      contents.splice(0, 1);
    }

    return contents;
  }

  public format() {
    const tableLines = [];
    const headerLine = [];
    const headerSeparatorLine = [];
    for (let col = 0; col < this.columns.length; col++) {
      headerLine.push(
        this.columns[col].header.formattedContent(this.columns[col].width)
      );
      headerSeparatorLine.push(this.columns[col].getHeaderSeparator());
    }

    tableLines.push(headerLine.join("|"));
    tableLines.push(headerSeparatorLine.join("|"));

    for (let cellIdx = 0; cellIdx < this.columns[0].cells.length; cellIdx++) {
      const currLine = [];
      for (let col = 0; col < this.columns.length; col++) {
        const currCol = this.columns[col];
        currLine.push(currCol.cells[cellIdx].formattedContent(currCol.width));
      }
      tableLines.push(currLine.join("|"));
    }

    let tableStr = "";
    tableLines.forEach((line) => {
      tableStr += `|${line}|${Constants.EOL}`;
    });

    this.editor
      .edit((editBuilder) => {
        editBuilder.replace(
          new Range(this.startLine, 0, this.endLine + 1, 0),
          tableStr
        );
      })
      .then((success) => {
        if (success) {
          this.editor.document.save();
        }
      });
  }

  public async insert(): Promise<void> {
    if (this.startLine !== this.endLine) {
      window.showInformationMessage("Cannot insert table inside another table");
      return;
    }

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

    for (let col = 0; col < cols; col++) {
      const column = new Column();
      column.setHeader(`Header ${col + 1}`);
      this.columns.push(column);
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.columns[col].cells.push(new Cell());
      }
    }

    this.format();
  }

  private getCurrentRow() {
    const curPos = this.editor.selection.active;
    const currLine = curPos.line;
    return currLine - this.startLine - 2;
  }

  private insertRow(rowNumber: number) {
    if (rowNumber < 0 || rowNumber > this.columns[0].cells.length + 1) {
      return;
    }

    this.columns.forEach((column) => column.insertCell(new Cell(), rowNumber));
    this.format();
  }

  public insertRowBeforeCurrentRow() {
    const currRow = this.getCurrentRow();
    this.insertRow(currRow);
  }

  public insertRowAfterCurrentRow() {
    const curRow = this.getCurrentRow();
    this.insertRow(curRow + 1);
  }

  private insertCol(columnNumber: number) {
    if (columnNumber < 0 || columnNumber > this.columns.length) {
      return;
    }

    const rowCount = this.columns[0].cells.length;
    const column = new Column();
    column.setHeader("Header");
    for (let idx = 0; idx < rowCount; idx++) {
      column.cells.push(new Cell());
    }

    this.columns.splice(columnNumber, 0, column);
    this.format();
  }

  private getCurrentColumn() {
    const curPos = this.editor.selection.active;
    const line = this.editor.document.lineAt(curPos.line).text;
    let start = 0;
    let end = line.length;
    if (line.startsWith("|")) {
      start++;
    }
    if (line.endsWith("|")) {
      end--;
    }

    const sepIdxGen = line.matchAll(
      new RegExp(Constants.REG_TABLE_COLUMN_SEPARATOR, "g")
    );

    let column = 0;
    let idx = start;
    while (idx < end) {
      const match: RegExpMatchArray | undefined = sepIdxGen.next().value;
      if (!match) {
        break;
      }

      const nextIdx = match.index;
      if (nextIdx === undefined || nextIdx >= curPos.character) {
        break;
      }

      column++;
      idx = nextIdx;
    }

    return column;
  }

  public insertColumnBeforeCurrentColumn() {
    const column = this.getCurrentColumn();
    this.insertCol(column - 1);
  }

  public insertColumnAfterCurrentColumn() {
    const column = this.getCurrentColumn();
    this.insertCol(column);
  }
}
