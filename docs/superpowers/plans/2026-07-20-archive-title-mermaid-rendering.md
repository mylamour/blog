# Archive Title and Mermaid Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Chinese desktop archive show the complete latest-post title and render all Mermaid diagrams that begin with Mermaid directives or comments.

**Architecture:** Promote the existing English desktop archive-width override into a shared bilingual CSS rule while leaving the base mobile rules untouched. Keep Mermaid as a client-side, on-demand enhancement, but isolate source recognition in a pure function that skips leading Mermaid directives/comments before checking the diagram declaration.

**Tech Stack:** Hexo 7, EJS, browser JavaScript, CSS/Sass, Node.js built-in test runner, Netlify build pipeline

---

### Task 1: Recognize Mermaid directives before diagram declarations

**Files:**
- Create: `test/theme-rendering.test.js`
- Modify: `themes/fexo2/layout/_partial/load-script.ejs:28-105`

- [ ] **Step 1: Write the failing Mermaid recognition tests**

Create `test/theme-rendering.test.js` with the production-template extractor and behavior cases:

```js
'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repositoryRoot = path.resolve(__dirname, '..');
const loadScriptTemplate = readFileSync(
  path.join(repositoryRoot, 'themes/fexo2/layout/_partial/load-script.ejs'),
  'utf8'
);

function loadIsMermaidSource() {
  const match = /(function isMermaidSource\(source\) \{[\s\S]*?\n  \})\n\n  function loadScript/.exec(loadScriptTemplate);
  assert.ok(match, 'load-script.ejs must define isMermaidSource immediately before loadScript');
  return vm.runInNewContext(`(${match[1]})`);
}

test('recognizes Mermaid after directives and comments', () => {
  const isMermaidSource = loadIsMermaidSource();
  const examples = [
    `%%{init: {'theme':'base'}}%%\nflowchart TB\n  A --> B`,
    `%% explain the diagram\nsequenceDiagram\n  A->>B: hello`,
    `graph LR\n  A --> B`
  ];

  for (const source of examples) {
    assert.equal(isMermaidSource(source), true, source);
  }
});

test('does not treat ordinary plaintext as Mermaid', () => {
  const isMermaidSource = loadIsMermaidSource();
  const examples = [
    'echo flowchart TB',
    '{"graph":"LR"}',
    '%% a comment without a diagram\nplain text',
    'flowcharting is not a Mermaid declaration'
  ];

  for (const source of examples) {
    assert.equal(isMermaidSource(source), false, source);
  }
});

test('recognizes all Mermaid blocks in both latest article sources', () => {
  const isMermaidSource = loadIsMermaidSource();
  const articlePaths = [
    'source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md',
    'source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md'
  ];

  for (const articlePath of articlePaths) {
    const source = readFileSync(path.join(repositoryRoot, articlePath), 'utf8');
    const blocks = Array.from(source.matchAll(/```mermaid\n([\s\S]*?)```/g), (match) => match[1]);
    assert.equal(blocks.length, 14, articlePath);
    assert.equal(blocks.every(isMermaidSource), true, articlePath);
  }
});
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run:

```bash
node --test test/theme-rendering.test.js
```

Expected: all three tests fail with `load-script.ejs must define isMermaidSource immediately before loadScript` because the production helper does not exist yet.

- [ ] **Step 3: Add the minimal production recognition helper**

In `themes/fexo2/layout/_partial/load-script.ejs`, insert this function immediately before `loadScript`:

```js
  function isMermaidSource(source) {
    var remaining = String(source || '').trim();

    while (remaining) {
      var next = remaining
        .replace(/^%%\{[\s\S]*?\}%%\s*/, '')
        .replace(/^%%(?!\{)[^\r\n]*(?:\r?\n|$)\s*/, '');

      if (next === remaining) break;
      remaining = next;
    }

    return /^(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|flowchart|journey)\b/.test(remaining);
  }
```

Replace the existing direct regular-expression condition with an explicit-language/content condition:

```js
        var shouldRenderMermaid = lang === 'mermaid'
          ? codeContent.trim().length > 0
          : isMermaidSource(codeContent);

        if (shouldRenderMermaid) {
          var mermaidDiv = document.createElement('div');
          mermaidDiv.className = 'mermaid';
          mermaidDiv.textContent = codeContent;
          figure.parentNode.replaceChild(mermaidDiv, figure);
          hasMermaid = true;
        }
```

Keep extraction limited to the existing `lang === 'mermaid' || lang === 'plaintext'` branch so other highlighted languages cannot be converted.

- [ ] **Step 4: Run the targeted tests and verify GREEN**

Run:

```bash
node --test test/theme-rendering.test.js
```

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Commit the Mermaid fix**

```bash
git add -- test/theme-rendering.test.js themes/fexo2/layout/_partial/load-script.ejs
git commit -m "fix: recognize Mermaid directives before diagrams"
```

### Task 2: Share the complete desktop archive-title layout

**Files:**
- Modify: `test/theme-rendering.test.js`
- Modify: `themes/fexo2/source/css/custom.css:1527-1551`
- Modify after cache revision: `themes/fexo2/layout/_partial/head.ejs`

- [ ] **Step 1: Add the failing bilingual archive-layout contract test**

Add these fixtures after `loadScriptTemplate` in `test/theme-rendering.test.js`:

```js
const customCss = readFileSync(
  path.join(repositoryRoot, 'themes/fexo2/source/css/custom.css'),
  'utf8'
);
const itemPostSass = readFileSync(
  path.join(repositoryRoot, 'themes/fexo2/source/sass/component/_item-post.scss'),
  'utf8'
);
```

Append this test:

```js
test('shares the wide desktop archive layout without changing mobile limits', () => {
  assert.match(
    customCss,
    /@media screen and \(min-width: 768px\) \{[\s\S]{0,500}\.content\.content-archive[\s\S]{0,200}width: min\(860px, calc\(100vw - 48px\)\);[\s\S]{0,300}\.item-post \.post-title[\s\S]{0,100}max-width: 100%;/
  );
  assert.doesNotMatch(customCss, /html\[lang="en"\] \.content\.content-archive/);
  assert.doesNotMatch(customCss, /html\[lang="en"\] \.item-post \.post-title/);
  assert.match(itemPostSass, /min-width: 400px\) and \(max-width: 500px\)[\s\S]*?max-width: 330px;/);
  assert.match(itemPostSass, /min-width: 320px\) and \(max-width: 399px\)[\s\S]*?max-width: 250px;/);
});
```

- [ ] **Step 2: Run the targeted tests and verify RED**

Run:

```bash
node --test test/theme-rendering.test.js
```

Expected: the three Mermaid tests pass; `shares the wide desktop archive layout without changing mobile limits` fails because the width rules are still scoped to `html[lang="en"]` and are not in one shared desktop block.

- [ ] **Step 3: Replace the English-only archive overrides with a shared desktop block**

In `themes/fexo2/source/css/custom.css`, remove these English-only rules:

```css
html[lang="en"] .item-post .post-title {
  max-width: 100%;
}

@media screen and (min-width: 768px) {
  html[lang="en"] .content.content-archive {
    width: min(860px, calc(100vw - 48px));
  }
}
```

Insert the shared desktop rule before the English date-width rule:

```css
/* 中英文桌面归档共享宽标题布局；移动端继续使用主题基础断点。 */
@media screen and (min-width: 768px) {
  .content.content-archive {
    width: min(860px, calc(100vw - 48px));
  }

  .item-post .post-title {
    max-width: 100%;
  }
}
```

Do not change `_item-post.scss`; its 330px, 250px, and 200px mobile limits remain the source of truth below 768px.

- [ ] **Step 4: Refresh the custom CSS cache key**

Run:

```bash
node themes/fexo2/rev.js
```

Expected: output includes a new `custom.css ?v=` value followed by exactly eight hexadecimal characters, and only the `custom.css` reference in `themes/fexo2/layout/_partial/head.ejs` changes.

- [ ] **Step 5: Run the targeted tests and verify GREEN**

Run:

```bash
node --test test/theme-rendering.test.js
```

Expected: 4 tests pass, 0 fail.

- [ ] **Step 6: Commit the archive-layout fix**

```bash
git add -- test/theme-rendering.test.js themes/fexo2/source/css/custom.css themes/fexo2/layout/_partial/head.ejs
git commit -m "fix: show complete archive titles in both languages"
```

### Task 3: Verify generated bilingual behavior and repository integrity

**Files:**
- Verify only; no source changes expected

- [ ] **Step 1: Run the complete unit and content checks**

Run:

```bash
npm test
npm run check:pre-commit
```

Expected: all tests pass; content and translation checks exit 0. The approved historical `kerywords` baseline warning may remain.

- [ ] **Step 2: Verify generated theme assets are committed**

Run:

```bash
npm run check:theme
```

Expected: exit 0 and no diff in generated theme assets, EJS cache references, or the inline loader.

- [ ] **Step 3: Build and audit the Chinese site**

Run:

```bash
npm run verify:zh
```

Expected: Hexo generates `/blog/` and `/agentic-software-engineering-real-sdlc/`; generated audit exits 0. The approved historical Chinese missing-link baseline warning may remain.

- [ ] **Step 4: Inspect the Chinese generated contracts**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs');
const article = fs.readFileSync('public/agentic-software-engineering-real-sdlc/index.html', 'utf8');
const archive = fs.readFileSync('public/blog/index.html', 'utf8');
if ((article.match(/<figure class="highlight plaintext">/g) || []).length !== 14) process.exit(1);
if (!article.includes('function isMermaidSource')) process.exit(1);
if (!archive.includes('Agentic Assurance Engineering：让 AI Coding 进入真实工程')) process.exit(1);
console.log('Chinese generated contracts verified');
NODE
```

Expected: `Chinese generated contracts verified`.

- [ ] **Step 5: Build and audit the English site**

Run:

```bash
npm run verify:en
```

Expected: Hexo generates the English article and archive; generated audit exits 0. The approved historical English missing-link baseline warning may remain.

- [ ] **Step 6: Inspect the English generated contracts**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs');
const article = fs.readFileSync('public/agentic-software-engineering-real-sdlc/index.html', 'utf8');
const archive = fs.readFileSync('public/blog/index.html', 'utf8');
if ((article.match(/<figure class="highlight plaintext">/g) || []).length !== 14) process.exit(1);
if (!article.includes('function isMermaidSource')) process.exit(1);
if (!archive.includes('Agentic Assurance Engineering: Bringing AI Coding into Real-World Engineering')) process.exit(1);
console.log('English generated contracts verified');
NODE
```

Expected: `English generated contracts verified`.

- [ ] **Step 7: Confirm the final worktree contains only the preserved user file**

Run:

```bash
git status --short --branch
```

Expected: the branch is ahead of `origin/withexo`; the only untracked path is `source/_posts/2026-03-13-Meet-Yourself.md`.

### Task 4: Merge the isolated feature and confirm the published revision

**Files:**
- No file changes

- [ ] **Step 1: Refresh the remote branch and verify there is no divergence**

Run:

```bash
git fetch origin --prune
git rev-list --left-right --count HEAD...origin/withexo
```

Expected after the worktree-plan correction and two implementation commits: `5 0`; the feature branch contains the two approved design/plan commits plus three feature-branch commits, and the remote is not ahead.

- [ ] **Step 2: Resolve and verify the primary checkout**

Run:

```bash
main_root=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
test "$(git -C "$main_root" branch --show-current)" = "withexo"
git -C "$main_root" status --short --branch
```

Expected: the primary checkout is on `withexo`; its only untracked path is `source/_posts/2026-03-13-Meet-Yourself.md`.

- [ ] **Step 3: Fast-forward the verified feature into `withexo`**

Run:

```bash
git -C "$main_root" merge --ff-only fix/archive-title-mermaid-rendering
```

Expected: `withexo` advances to the feature HEAD without a merge commit or conflict; the preserved untracked article remains untouched.

- [ ] **Step 4: Re-run tests on the integrated branch**

Run:

```bash
npm --prefix "$main_root" test
```

Expected: all tests pass on the integrated `withexo` branch.

- [ ] **Step 5: Push the verified integrated branch**

Run:

```bash
git -C "$main_root" push origin withexo
```

Expected: `withexo -> withexo` without force-push.

- [ ] **Step 6: Compare local and remote commit identities**

Run:

```bash
local_sha=$(git -C "$main_root" rev-parse HEAD)
remote_sha=$(git ls-remote --heads origin refs/heads/withexo | cut -f1)
test "$local_sha" = "$remote_sha"
printf 'published_sha=%s\n' "$local_sha"
```

Expected: exit 0 and one `published_sha=` line followed by the 40-character commit SHA.

- [ ] **Step 7: Check repository CI for the published SHA**

Run:

```bash
gh api -H 'Accept: application/vnd.github+json' "repos/mylamour/blog/commits/$(git -C "$main_root" rev-parse HEAD)/check-runs" --jq '{total_count, runs: [.check_runs[] | {name, status, conclusion, details_url}]}'
```

Expected: the repository verification jobs appear. If they are still queued or running, wait for completion before claiming the published revision is verified.

- [ ] **Step 8: Confirm the live article routes after deployment**

Run:

```bash
curl -L -sS -o /dev/null -w 'zh_status=%{http_code}\n' https://fz.cool/agentic-software-engineering-real-sdlc/
curl -L -sS -o /dev/null -w 'en_status=%{http_code}\n' https://iami.xyz/agentic-software-engineering-real-sdlc/
```

Expected after deployment: both statuses are 200. Do not claim the style and Mermaid fix is live while the deployment still serves the previous asset revision.
