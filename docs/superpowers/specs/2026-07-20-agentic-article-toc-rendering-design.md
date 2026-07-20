# Agentic Article TOC Rendering Design

## Problem

The table of contents for the Chinese and English Agentic Assurance Engineering article renders with inconsistent font weight and irregular subsection indentation.

The font-weight inconsistency comes from two competing rules in `themes/fexo2/source/css/custom.css`:

- `.toc` assigns `font-weight: 700` to the entire generated ordered list, so every link inherits bold text.
- `.toc-article a:hover` and `.toc-article a.toc-link.active` assign `font-weight: 400`, so the hovered or active entry becomes lighter than the other entries.

The indentation problem comes from two subsection headings in each translation using `####` directly below `#` sections. Hexo therefore generates `toc-level-4` entries nested under level-one sections, skipping levels two and three.

## Scope

The change will:

1. Remove the generic TOC list from the title-only typography rule.
2. Give sidebar TOC links an explicit, consistent weight of `400` in their default, hover, and active states.
3. Change the two affected subsection headings from level four to level two in both article translations.
4. Add regression tests for the CSS contract and bilingual heading hierarchy.

The change will not alter article wording, other heading text, mobile visibility rules, TOC positioning, colors, or scroll-spy behavior.

## Implementation Design

### Theme CSS

The broad `.toc, .toc-title` selector will become a title-only selector. The generated `.toc` list must not establish typography inherited by every entry. `.toc-article a` will explicitly set `font-weight: 400`; the existing hover and active rule will retain the same weight while changing only color.

This fixes the source of the cascade conflict instead of adding another higher-specificity override.

### Article hierarchy

The following paired headings will use `##` in both Chinese and English:

- “先审计真实 capability，再相信角色文档” / “Audit Real Capability Before Trusting Role Documentation”
- “Finding 不是结论，反证决定影响边界” / “A Finding Is Not a Conclusion; Counterevidence Defines the Impact Boundary”

The generated TOC will then contain level-one chapters with level-two children and no level-four jump for this article.

### Tests

Tests in `test/theme-rendering.test.js` will verify:

- the generic `.toc` list is not grouped into the bold TOC-title rule;
- sidebar links explicitly use the same weight in default and interactive states;
- both article sources use only level-one chapters and level-two subsections, with no skipped heading levels;
- the expected two subsections exist in both translations.

The test must fail against the current implementation before production files are changed. After the minimal fix, the focused test, full unit suite, theme asset check, and Chinese and English generated-site verification must pass.

## Success Criteria

- All sidebar TOC entries have a stable font weight while scrolling or hovering.
- The two subsection entries are indented as level-two children rather than level-four descendants.
- Chinese and English output retain matching heading structure.
- Existing theme and generated-site checks remain green.
