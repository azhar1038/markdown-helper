import Toc from "./lib/toc/index";

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
