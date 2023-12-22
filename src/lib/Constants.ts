export default abstract class Constants {
  static readonly REG_CODE_BLOCK = /^\s*(?:```|~~~)/;
  static readonly REG_HEADER = /^(#{1,6})\s+(.+)/;
  static readonly REG_LINK = /\[([^\[\]]+)]\(([^)]+)\)/;
  static readonly REG_TOC_CONFIG = /^<!-- ([a-zA-Z]+)=([a-zA-Z0-9]+) -->/;
  static readonly REG_TOC_START = /^<!-- TOC -->/;
  static readonly REG_TOC_END = /^<!-- \/TOC -->/;

  static readonly TOC_START = "<!-- TOC -->";
  static readonly TOC_END = "<!-- /TOC -->";
  static readonly NEW_LINE = "\n";
}
