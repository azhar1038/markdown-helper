import MarkdownEditor from "./lib/MarkdownEditor";
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

  public toggleBold() {
    const markdownEditor = new MarkdownEditor();
    const range = markdownEditor.getSelectedRange();
    markdownEditor.toggleBold(range);
  }

  public toggleItalic() {
    const markdownEditor = new MarkdownEditor();
    const range = markdownEditor.getSelectedRange();
    markdownEditor.toggleItalic(range);
  }
}
