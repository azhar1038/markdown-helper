export default class Cell {
  content: string;
  width: number;

  constructor(content: string = "") {
    this.content = content.trim();
    this.width = this.content.length + 2;
  }
}
