import Cell from "./Cell";
import { TableColumnAlignment } from "./enums";

export default class Column {
  private _header: Cell = new Cell();
  private _alignment: TableColumnAlignment = TableColumnAlignment.LEFT;
  width: number = 5; // Min width
  cells: Cell[] = [];

  get header(): Cell {
    return this._header;
  }

  setHeader(text: string) {
    this._header = new Cell(text);
    this.width = Math.max(this.width, this._header.width);
  }

  get alignment(): TableColumnAlignment {
    return this._alignment;
  }

  setAlignment(separator: string) {
    separator = separator.trim();
    const start = separator.startsWith(":");
    const end = separator.endsWith(":");

    if (start && end) {
      this._alignment = TableColumnAlignment.CENTER;
    } else if (end) {
      this._alignment = TableColumnAlignment.RIGHT;
    } else {
      this._alignment = TableColumnAlignment.LEFT;
    }
  }

  insertCell(cell: Cell, index?: number) {
    if (index === undefined || index === this.cells.length) {
      this.cells.push(cell);
    } else if (index >= 0 && index < this.cells.length) {
      this.cells.splice(index, 0, cell);
    } else {
      throw new RangeError("Index out of range");
    }
    this.width = Math.max(this.width, cell.width);
  }

  removeCell(index: number) {
    let cellWidth = 0;
    if (index >= 0 && index < this.cells.length) {
      cellWidth = this.cells[index].width;
      this.cells.splice(index, 1);
    } else {
      throw new RangeError("Index out of range");
    }

    if (cellWidth === this.width) {
      // Width may change
      this.width = this._header.width;
      this.cells.forEach((cell) => {
        this.width = Math.max(this.width, cell.width);
      });
    }
  }

  getHeaderSeparator(): string {
    const separator = "-".repeat(this.width - 4);
    if (this._alignment === TableColumnAlignment.CENTER) {
      return ` :${separator}: `;
    } else if (this._alignment === TableColumnAlignment.RIGHT) {
      return ` -${separator}: `;
    } else {
      return ` -${separator}- `;
    }
  }
}
