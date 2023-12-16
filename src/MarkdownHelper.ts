import Toc from "./lib/Toc";

export default class MarkdownHelper {
  public async insertOrUpdateToc() {
    const toc = new Toc();
    await toc.insertOrUpdate();
  }

  public async removeToc() {
    const toc = new Toc();
    await toc.removeTocFromDoc();
  }
}
