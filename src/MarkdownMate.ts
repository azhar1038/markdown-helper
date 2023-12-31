import MarkdownEditor from "./lib/MarkdownEditor";
import Toc from "./lib/toc/index";

export default class MarkdownMate {
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
    markdownEditor.toggleBold();
  }

  public toggleItalic() {
    const markdownEditor = new MarkdownEditor();
    markdownEditor.toggleItalic();
  }

  public toggleInlineCode() {
    const markdownEditor = new MarkdownEditor();
    markdownEditor.toggleInlineCode();
  }

  public toggleBlockCode() {
    const markdownEditor = new MarkdownEditor();
    markdownEditor.toggleBlockCode();
  }

  public toggleBlockquote() {
    const markdownEditor = new MarkdownEditor();
    markdownEditor.toggleBlockquote();
  }
}
