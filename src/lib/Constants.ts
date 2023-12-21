export default abstract class Constants {
  static readonly REG_CODE_BLOCK = /^\s*```/;
  static readonly REG_HEADER = /^(#{1,6})\s+(.+)/;
  static readonly REG_TOC_CONFIG =
    /^<!-- TocConfig ([a-zA-Z]+)=([a-zA-Z0-9]+) -->/;
  static readonly REG_TOC_END = /^<!-- \/Toc -->/;
  static readonly REG_TOC_START = /^<!-- Toc -->/;
}
