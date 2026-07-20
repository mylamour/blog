# Agentic Article TOC Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the latest bilingual article's sidebar table of contents use a stable font weight and a correct level-one/level-two heading hierarchy.

**Architecture:** Fix the CSS cascade at its source by separating TOC-title typography from the generated TOC list and explicitly declaring the sidebar-link weight. Correct the two bilingual Markdown subsection levels, then protect both behaviors with source-level and generated-output verification.

**Tech Stack:** Hexo 7, EJS, CSS, Markdown, Node.js `node:test`

---

## File Structure

- Modify `test/theme-rendering.test.js`: add regression contracts for TOC CSS and bilingual heading levels.
- Modify `themes/fexo2/source/css/custom.css`: stop the TOC list from inheriting title weight and set sidebar links to a stable weight.
- Modify `themes/fexo2/layout/_partial/head.ejs`: update the `custom.css` revision generated from the changed asset.
- Modify `source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md`: change two Chinese subsection headings from level four to level two.
- Modify `source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md`: make the matching English heading changes.

### Task 1: Add failing TOC regression tests

**Files:**
- Modify: `test/theme-rendering.test.js`

- [ ] **Step 1: Add the CSS cascade regression test**

Append this test after the existing archive-layout test:

```js
test('keeps sidebar TOC links at a stable font weight', () => {
  assert.doesNotMatch(customCss, /\.toc,\s*\.toc-title\s*\{/);
  assert.match(customCss, /\.toc-title\s*\{[^}]*font-weight:\s*700;/);
  assert.match(customCss, /\.toc-article a\s*\{[^}]*font-weight:\s*400;/);
  assert.match(
    customCss,
    /\.toc-article a:hover,\s*\.toc-article a\.toc-link\.active\s*\{[^}]*font-weight:\s*400;/
  );
});
```

- [ ] **Step 2: Add the bilingual heading-hierarchy regression test**

Append this test immediately after the CSS test:

```js
test('uses level-two subsections in both latest article sources', () => {
  const expectedSubsections = new Map([
    [
      'source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md',
      [
        '先审计真实 capability，再相信角色文档',
        'Finding 不是结论，反证决定影响边界'
      ]
    ],
    [
      'source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md',
      [
        'Audit Real Capability Before Trusting Role Documentation',
        'A Finding Is Not a Conclusion; Counterevidence Defines the Impact Boundary'
      ]
    ]
  ]);

  for (const [articlePath, expected] of expectedSubsections) {
    const source = readFileSync(path.join(repositoryRoot, articlePath), 'utf8');
    const headings = Array.from(
      source.matchAll(/^(#{1,6})\s+(.+)$/gm),
      (match) => ({ level: match[1].length, text: match[2] })
    );
    const levels = headings.map(({ level }) => level);

    assert.deepEqual(
      headings.filter(({ level }) => level === 2).map(({ text }) => text),
      expected,
      articlePath
    );
    assert.equal(levels.every((level) => level <= 2), true, articlePath);
    for (let index = 1; index < levels.length; index += 1) {
      assert.ok(levels[index] <= levels[index - 1] + 1, articlePath);
    }
  }
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
node --test test/theme-rendering.test.js
```

Expected: 2 new tests fail. The CSS test reports that `.toc, .toc-title` still matches or that the default sidebar link lacks `font-weight: 400`; the heading test reports that no level-two subsections were found.

### Task 2: Apply the minimal CSS and bilingual content fix

**Files:**
- Modify: `themes/fexo2/source/css/custom.css:234-241`
- Modify: `themes/fexo2/source/css/custom.css:969-984`
- Modify: `source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md:262,610`
- Modify: `source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md:261,610`

- [ ] **Step 1: Restrict the broad typography rule to the TOC title**

Replace:

```css
.toc,
.toc-title {
  font-weight: 700;
  font-size: 1.1em;
  color: var(--reading-accent);
  margin-bottom: 1em;
}
```

with:

```css
.toc-title {
  font-weight: 700;
  font-size: 1.1em;
  color: var(--reading-accent);
  margin-bottom: 1em;
}
```

- [ ] **Step 2: Declare the default sidebar-link weight explicitly**

Add the weight inside the existing `.toc-article a` rule:

```css
.toc-article a {
  display: block;
  padding: 3px 0;
  color: #8b817a;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.55;
  text-decoration: none;
  overflow-wrap: anywhere;
  word-break: break-word;
}
```

Keep the existing hover and active rule at `font-weight: 400` so interactive state changes only the color.

- [ ] **Step 3: Correct the Chinese subsection levels**

Replace the two headings with:

```markdown
## 先审计真实 capability，再相信角色文档
```

and:

```markdown
## Finding 不是结论，反证决定影响边界
```

- [ ] **Step 4: Correct the matching English subsection levels**

Replace the two headings with:

```markdown
## Audit Real Capability Before Trusting Role Documentation
```

and:

```markdown
## A Finding Is Not a Conclusion; Counterevidence Defines the Impact Boundary
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
node --test test/theme-rendering.test.js
```

Expected: all tests in `test/theme-rendering.test.js` pass with zero failures.

- [ ] **Step 6: Update the CSS revision reference**

Run:

```bash
node themes/fexo2/rev.js
```

Expected: exit code 0; output lists `styles.css`, `custom.css`, and `bundle.js` revisions, and only the `custom.css?v=` value changes in `themes/fexo2/layout/_partial/head.ejs`.

- [ ] **Step 7: Commit the tested implementation**

```bash
git add test/theme-rendering.test.js \
  themes/fexo2/source/css/custom.css \
  themes/fexo2/layout/_partial/head.ejs \
  source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md \
  source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md
git commit -m "fix: normalize article table of contents"
```

### Task 3: Verify theme and generated bilingual output

**Files:**
- Verify: `themes/fexo2/source/css/custom.css`
- Verify: `themes/fexo2/layout/_partial/head.ejs`
- Verify: `public/agentic-software-engineering-real-sdlc/index.html`

- [ ] **Step 1: Run the full unit suite**

Run:

```bash
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Verify generated theme assets**

Run:

```bash
npm run check:theme
```

Expected: exit code 0 and no generated theme-asset diff.

- [ ] **Step 3: Verify Chinese generation and TOC levels**

Run:

```bash
npm run verify:zh
node -e "const h=require('fs').readFileSync('public/agentic-software-engineering-real-sdlc/index.html','utf8'); if ((h.match(/toc-level-2/g)||[]).length !== 2 || h.includes('toc-level-4')) process.exit(1)"
```

Expected: Chinese generation and audit exit 0; the generated article contains exactly two `toc-level-2` entries and no `toc-level-4` entries.

- [ ] **Step 4: Verify English generation and TOC levels**

Run:

```bash
npm run verify:en
node -e "const h=require('fs').readFileSync('public/agentic-software-engineering-real-sdlc/index.html','utf8'); if ((h.match(/toc-level-2/g)||[]).length !== 2 || h.includes('toc-level-4')) process.exit(1)"
```

Expected: English generation and audit exit 0; the generated article contains exactly two `toc-level-2` entries and no `toc-level-4` entries.

- [ ] **Step 5: Run repository hygiene checks**

Run:

```bash
npm run check:pre-commit
git diff --check
git status --short --branch
```

Expected: pre-commit and whitespace checks exit 0; status shows only the user's pre-existing untracked `source/_posts/2026-03-13-Meet-Yourself.md` plus any deliberate unpushed commits.
