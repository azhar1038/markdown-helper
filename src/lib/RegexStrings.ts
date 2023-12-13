export default class RegexStrings {
  static TOC_START =
    /^\s*<!--\s+MarkdownHelperToc\s+(?:(minDepth=\d+)\s+)?(?:(maxDepth=\d+)\s+)?(?:(minDepth=\d+)\s+)?-->/;
  static TOC_END = /^\s*<!--\s+\/MarkdownHelperToc\s+-->/;
  static HEADER = /^(#{1,6})\s+(.*)/;
  static CODE_BLOCK = /^\s?```/;
}
