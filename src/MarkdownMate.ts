import MarkdownEditor from "./lib/MarkdownEditor";
import Table from "./lib/table";
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

  public async toggleTocHeaderIgnore() {
    const markdownEditor = new MarkdownEditor();
    markdownEditor.toggleTocHeaderIgnore();
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

  public insertTable() {
    const table = new Table();
    table.insert();
  }

  public formatTable() {
    const table = new Table();
    table.format();
  }

  public insertRowBefore() {
    const table = new Table();
    table.insertRowBeforeCurrentRow();
  }

  public insertRowAfter() {
    const table = new Table();
    table.insertRowAfterCurrentRow();
  }

  public insertColumnBefore() {
    const table = new Table();
    table.insertColumnBeforeCurrentColumn();
  }

  public insertColumnAfter() {
    const table = new Table();
    table.insertColumnAfterCurrentColumn();
  }

  public deleteCurrentColumn() {
    const table = new Table();
    table.deleteCurrentColumn();
  }

  public deleteCurrentRow() {
    const table = new Table();
    table.deleteCurrentRow();
  }

  public changeColumnAlignment() {
    const table = new Table();
    table.changeColumnAlignment();
  }
}
