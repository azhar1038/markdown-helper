import Cell from "./Cell";
import Header from "./Header";
import { TableAlignment } from "./enums";

export default class Column {
  width: number = 5; // Min width
  alignment: TableAlignment = TableAlignment.LEFT;
  header: Header = new Header();
  cells: Cell[] = [];

  setHeader(text: string) {
    this.header = new Header(text);
    this.width = Math.max(this.width, this.header.width);
  }

  setAlignment(separator: string) {
    separator = separator.trim();
    const start = separator.startsWith(":");
    const end = separator.endsWith(":");

    if (start && end) {
      this.alignment = TableAlignment.CENTER;
    } else if (end) {
      this.alignment = TableAlignment.RIGHT;
    } else {
      this.alignment = TableAlignment.LEFT;
    }
  }

  insertCell(cell: Cell, index?: number) {
    if (index === undefined) {
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
      this.width = this.header.width;
      this.cells.forEach((cell) => {
        this.width = Math.max(this.width, cell.width);
      });
    }
  }

  getHeaderSeparator(): string {
    const separator = "-".repeat(this.width - 4);
    if ((this.alignment = TableAlignment.CENTER)) {
      return ` :${separator}: `;
    } else if ((this.alignment = TableAlignment.RIGHT)) {
      return ` -${separator}: `;
    } else {
      return ` -${separator}- `;
    }
  }
}
