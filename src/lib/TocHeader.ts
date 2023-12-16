import { Range } from "vscode";
import RegexStrings from "./RegexStrings";

export default class TocHeader {
  title: string;
  depth: number;
  range: Range;
  slug: string;

  constructor(
    title: string,
    depth: number,
    range: Range,
    repeatCount: number = 0
  ) {
    this.title = title;
    this.depth = depth;
    this.range = range;
    this.slug = this.generateSlug(repeatCount);
  }

  private generateSlug(repeatCount: number) {
    let slug = this.title
      .replace(/^\s+|\s+$/g, "") // trim leading/trailing white space
      .toLowerCase() // convert string to lowercase
      .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters
      .replace(/\s+/g, "-"); // replace spaces with hyphens

    if (repeatCount > 1) {
      slug = `${slug}-${repeatCount - 1}`;
    }
    return slug;
  }

  public generateHeaderText() {
    return `[${this.title}](#${this.slug})`;
  }
}
