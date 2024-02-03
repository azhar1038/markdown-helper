export default class Cell {
  private _content: string;
  width: number;

  constructor(content: string = "") {
    this._content = content.trim();
    this.width = this._content.length + 2;
  }

  formattedContent(width: number) {
    return ` ${this._content} `.padEnd(width);
  }
}
