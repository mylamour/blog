# Bilingual Site Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the English site consistently lowercase, repair bilingual SEO/404 routing, and add automated guards that keep both Hexo builds structurally correct.

**Architecture:** Pure CommonJS modules under `lib/` own URL policy, tracked-content inventory, redirect generation, and generated-site validation. Thin Hexo registrations under `scripts/` and CLI adapters under `tools/` consume those modules; templates never construct cross-site URLs independently. Node’s built-in test runner drives the implementation, and GitHub Actions plus Netlify enforce the same checks.

**Tech Stack:** Hexo 7.3, Node 22, CommonJS, `node:test`, `hexo-front-matter`, `hexo-util`, `js-yaml`, `jsdom`, `hexo-generator-sitemap`, Netlify redirects, GitHub Actions

---

## File and Responsibility Map

- `.nvmrc` — local Node major version.
- `lib/site-policy.js` — site origins/languages, pairing keys, route normalization, alternate URL resolution, collision keys.
- `lib/diagnostics.js` — deterministic diagnostics, formatting, and exit-code calculation.
- `lib/content-inventory.js` — tracked-file discovery, CRLF-safe front matter parsing, bilingual inventory, Git diff loading.
- `lib/content-audit.js` — schema, filename, translation, legacy-keyword, and taxonomy-collision rules.
- `lib/english-redirects.js` — pure explicit redirect generation and redirect validation.
- `lib/generated-audit.js` — generated route index, HTML/XML metadata validation, local-link validation.
- `scripts/bilingual.js` — Hexo helper registration only.
- `scripts/english-redirects.js` — English-only Hexo `_redirects` generator registration.
- `tools/check-content.js` — content and structural translation CLI.
- `tools/check-translations.js` — change-aware translation reminder CLI.
- `tools/check-generated.js` — built-site validation CLI.
- `tools/check-external-links.js` — scheduled, non-blocking external URL audit.
- `config/content-baseline.json` — compact baseline for 242 tracked `kerywords` files.
- `config/link-baseline.json` — exact, justified historical missing-link tuples.
- `test/*.test.js` — pure unit and fixture tests.
- `themes/fexo2/layout/_partial/component/language-switch.ejs` — shared visible alternate link.
- `.github/workflows/verify.yml` — required PR/push checks.
- `.github/workflows/external-links.yml` — weekly network-dependent audit.

### Task 1: Pin Node and Implement the Shared Site Policy

**Files:**
- Create: `.nvmrc`
- Create: `lib/site-policy.js`
- Create: `test/site-policy.test.js`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Write failing URL-policy tests**

Create `test/site-policy.test.js` with these cases:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  EQUIVALENT_PATHS,
  pairingKeyFromSourcePath,
  postPath,
  normalizePagePath,
  resolveBilingualUrls,
  findPathCollisions
} = require('../lib/site-policy');

test('derives the exact pairing key from a dated source filename', () => {
  assert.equal(
    pairingKeyFromSourcePath('_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md'),
    '2025-04-05-Deep-Dive-Into-Clearing-Network.md'
  );
});

test('English post paths are lowercase and Chinese paths preserve case', () => {
  const key = '2025-04-05-Deep-Dive-Into-Clearing-Network.md';
  assert.equal(postPath('en', key), '/deep-dive-into-clearing-network/');
  assert.equal(postPath('zh', key), '/Deep-Dive-Into-Clearing-Network/');
});

test('Unicode post paths are encoded once', () => {
  const key = '2018-02-13-ELK小记.md';
  assert.equal(postPath('en', key), '/elk%E5%B0%8F%E8%AE%B0/');
  assert.equal(postPath('zh', key), '/ELK%E5%B0%8F%E8%AE%B0/');
});

test('translated Chinese post resolves to a lowercase English alternate', () => {
  const urls = resolveBilingualUrls({
    siteId: 'zh',
    canonicalUrl: 'https://fz.cool/Deep-Dive-Into-Clearing-Network/',
    pagePath: 'Deep-Dive-Into-Clearing-Network/index.html',
    source: '_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md',
    layout: 'post',
    translated: true
  });
  assert.equal(urls.alternateUrl, 'https://iami.xyz/deep-dive-into-clearing-network/');
  assert.equal(urls.alternateLanguage, 'en');
  assert.equal(urls.xDefaultUrl, urls.alternateUrl);
});

test('translated English post resolves to case-preserving Chinese alternate', () => {
  const urls = resolveBilingualUrls({
    siteId: 'en',
    canonicalUrl: 'https://iami.xyz/deep-dive-into-clearing-network/',
    pagePath: 'deep-dive-into-clearing-network/index.html',
    source: '_posts/2025-04-05-Deep-Dive-Into-Clearing-Network.md',
    layout: 'post',
    translated: true
  });
  assert.equal(urls.alternateUrl, 'https://fz.cool/Deep-Dive-Into-Clearing-Network/');
  assert.equal(urls.alternateLanguage, 'zh-CN');
  assert.equal(urls.xDefaultUrl, urls.canonicalUrl);
});

test('only explicit landing pages receive automatic alternates', () => {
  assert.equal(EQUIVALENT_PATHS.has('/about/'), true);
  assert.equal(EQUIVALENT_PATHS.has('/tags/security/'), false);

  const landing = resolveBilingualUrls({
    siteId: 'en',
    canonicalUrl: 'https://iami.xyz/about/',
    pagePath: 'about/index.html',
    layout: 'page'
  });
  assert.equal(landing.alternateUrl, 'https://fz.cool/about/');

  const detail = resolveBilingualUrls({
    siteId: 'en',
    canonicalUrl: 'https://iami.xyz/tags/security/',
    pagePath: 'tags/security/index.html',
    layout: 'tag'
  });
  assert.equal(detail.alternateUrl, null);
});

test('normalizes index routes and reports lowercase collisions', () => {
  assert.equal(normalizePagePath('blog/index.html'), '/blog/');
  assert.equal(normalizePagePath('index.html'), '/');
  assert.deepEqual(findPathCollisions([
    { id: 'a', path: '/Security-Architecture/' },
    { id: 'b', path: '/security-architecture/' }
  ], 'en'), [{ key: '/security-architecture/', ids: ['a', 'b'] }]);
});
```

- [ ] **Step 2: Run the tests and confirm the module is missing**

Run: `node --test test/site-policy.test.js`

Expected: FAIL with `Cannot find module '../lib/site-policy'`.

- [ ] **Step 3: Add the runtime/test dependencies and Node pin**

Use `apply_patch` to add this to `package.json` while preserving the existing metadata:

```json
"engines": {
  "node": "22.x"
},
"scripts": {
  "test": "node --test",
  "build:en": "hexo clean && hexo generate --bail --config _config.yml,_config.en.yml",
  "server:en": "hexo clean && hexo server --config _config.yml,_config.en.yml -p 4124"
}
```

Run:

```bash
npm install --save-dev hexo-front-matter@4.2.1 hexo-util@2.7.0 jsdom@25.0.1 js-yaml@4.1.1
```

Create `.nvmrc` containing exactly:

```text
22
```

- [ ] **Step 4: Implement `lib/site-policy.js`**

Implement these exact exports:

```js
'use strict';

const path = require('node:path');
const { slugize } = require('hexo-util');

const SITES = Object.freeze({
  zh: Object.freeze({ id: 'zh', origin: 'https://fz.cool', language: 'zh-CN', locale: 'zh_CN' }),
  en: Object.freeze({ id: 'en', origin: 'https://iami.xyz', language: 'en', locale: 'en_US' })
});

const EQUIVALENT_PATHS = new Set([
  '/', '/blog/', '/about/', '/search/', '/category/', '/tag/', '/project/'
]);

function siteFor(siteId) {
  const site = SITES[siteId];
  if (!site) throw new TypeError(`Unknown site: ${siteId}`);
  return site;
}

function pairingKeyFromSourcePath(sourcePath) {
  return path.basename(String(sourcePath || ''));
}

function slugFromPairingKey(pairingKey, transform) {
  const raw = pairingKeyFromSourcePath(pairingKey)
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return slugize(raw, { transform });
}

function postPath(siteId, pairingKey) {
  const transform = siteId === 'en' ? 1 : 0;
  return encodeURI(`/${slugFromPairingKey(pairingKey, transform)}/`);
}

function normalizePagePath(value) {
  let pathname = String(value || '').split(/[?#]/, 1)[0].replace(/^\/+/, '');
  pathname = pathname.replace(/index\.html$/i, '');
  if (!pathname) return '/';
  return `/${pathname.replace(/\/+$/, '')}/`;
}

function canonicalUrl(siteId, publicPath) {
  return new URL(normalizePagePath(publicPath), `${siteFor(siteId).origin}/`).href;
}

function resolveBilingualUrls(input) {
  const site = siteFor(input.siteId);
  const alternateSite = siteFor(input.siteId === 'en' ? 'zh' : 'en');
  const canonical = String(input.canonicalUrl).replace(/\/index\.html$/, '/');
  const publicPath = normalizePagePath(input.pagePath);
  let alternatePath = null;

  if (input.layout === 'post' && input.translated === true) {
    alternatePath = postPath(alternateSite.id, pairingKeyFromSourcePath(input.source));
  } else if (EQUIVALENT_PATHS.has(publicPath)) {
    alternatePath = publicPath;
  }

  const alternateUrl = alternatePath
    ? new URL(alternatePath, `${alternateSite.origin}/`).href
    : null;

  return {
    canonicalUrl: canonical,
    language: site.language,
    locale: site.locale,
    alternateUrl,
    alternateLanguage: alternateUrl ? alternateSite.language : null,
    alternateLocale: alternateUrl ? alternateSite.locale : null,
    xDefaultUrl: alternateUrl ? (site.id === 'en' ? canonical : alternateUrl) : null
  };
}

function findPathCollisions(entries, siteId) {
  const groups = new Map();
  for (const entry of entries) {
    const key = siteId === 'en' ? entry.path.toLowerCase() : entry.path;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry.id);
  }
  return [...groups.entries()]
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([key, ids]) => ({ key, ids: [...new Set(ids)].sort() }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

module.exports = {
  SITES,
  EQUIVALENT_PATHS,
  siteFor,
  pairingKeyFromSourcePath,
  slugFromPairingKey,
  postPath,
  normalizePagePath,
  canonicalUrl,
  resolveBilingualUrls,
  findPathCollisions
};
```

- [ ] **Step 5: Run the focused and full unit tests**

Run: `node --test test/site-policy.test.js`

Expected: 7 tests PASS.

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add .nvmrc package.json package-lock.json lib/site-policy.js test/site-policy.test.js
git commit -m "test: define bilingual URL policy"
```

### Task 2: Build CRLF-Safe Tracked Content Inventory

**Files:**
- Create: `lib/diagnostics.js`
- Create: `lib/content-inventory.js`
- Create: `test/content-inventory.test.js`

- [ ] **Step 1: Write failing inventory tests**

Create tests that assert:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeSource,
  parsePostSource,
  buildInventory,
  parseNameStatus
} = require('../lib/content-inventory');

const crlf = [
  '---',
  'layout: post',
  'title: Example',
  'categories: Security',
  'tags: Test',
  'kerywords: legacy',
  'translated: true',
  '---',
  'Body'
].join('\r\n');

test('normalizes BOM and CRLF before parsing front matter', () => {
  const post = parsePostSource({
    file: 'source/_posts/2024-02-29-Example.md',
    side: 'zh',
    source: `\uFEFF${crlf}`
  });
  assert.equal(normalizeSource(crlf).includes('\r'), false);
  assert.equal(post.data.layout, 'post');
  assert.equal(post.keyLines.get('kerywords'), 6);
  assert.equal(post.pairingKey, '2024-02-29-Example.md');
});

test('builds exact bilingual maps without scanning the filesystem', () => {
  const zh = parsePostSource({ file: 'source/_posts/2024-02-29-Example.md', side: 'zh', source: crlf });
  const en = parsePostSource({ file: 'source-en/_posts/2024-02-29-Example.md', side: 'en', source: crlf });
  const inventory = buildInventory([zh, en]);
  assert.equal(inventory.zhByKey.get(zh.pairingKey), zh);
  assert.equal(inventory.enByKey.get(en.pairingKey), en);
});

test('parses NUL-delimited Git name-status output', () => {
  assert.deepEqual(parseNameStatus('A\0source/_posts/a.md\0M\0source-en/_posts/b.md\0'), [
    { status: 'A', path: 'source/_posts/a.md' },
    { status: 'M', path: 'source-en/_posts/b.md' }
  ]);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test test/content-inventory.test.js`

Expected: FAIL with missing `lib/content-inventory.js`.

- [ ] **Step 3: Implement deterministic diagnostics**

`lib/diagnostics.js` must export:

```js
createDiagnostic(severity, code, message, location)
sortDiagnostics(diagnostics)
formatDiagnostic(diagnostic, cwd)
printDiagnostics(diagnostics, streams)
exitCodeFor(diagnostics)
```

Use the stable output form:

```text
source/file.md:5:1: error CONTENT_NEW_KERYWORDS: use "keywords"
```

Business-rule functions return diagnostics instead of throwing. Infrastructure failures such as an unreadable repository or missing `public` directory throw and are translated by the CLI into exit code 2. Hard errors produce exit code 1; warnings alone produce 0.

- [ ] **Step 4: Implement tracked inventory and Git diff loading**

`lib/content-inventory.js` must:

- Normalize with `source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')` before calling `hexo-front-matter.parse`.
- Record top-level front matter key line numbers.
- Derive `side` from `source/` versus `source-en/` and the exact basename as `pairingKey`.
- Use `execFile('git', ['ls-files', '-z', '--', 'source/_posts', 'source-en/_posts'])`, filter `.md`, and never scan untracked files.
- Load change-aware reminders only when `VERIFY_BASE_SHA` is supplied, using `git diff --name-status -z BASE...HEAD -- source/_posts source-en/_posts`.
- Export `normalizeSource`, `frontMatterKeyLines`, `parsePostSource`, `listTrackedPostPaths`, `loadTrackedPosts`, `buildInventory`, `loadTrackedInventory`, `parseNameStatus`, and `listGitChanges`.

- [ ] **Step 5: Run tests and verify the real tracked counts**

Run: `node --test test/content-inventory.test.js`

Expected: 3 tests PASS.

Run this read-only check through the new module:

```bash
node -e "require('./lib/content-inventory').loadTrackedInventory(process.cwd()).then(i => console.log(i.zhByKey.size, i.enByKey.size))"
```

Expected: `181 117`. The untracked `Meet-Yourself.md` must not be counted.

- [ ] **Step 6: Commit Task 2**

```bash
git add lib/diagnostics.js lib/content-inventory.js test/content-inventory.test.js
git commit -m "feat: inventory tracked bilingual content"
```

### Task 3: Enforce Content, Translation, Collision, and Scaffold Rules

**Files:**
- Create: `lib/content-audit.js`
- Create: `tools/check-content.js`
- Create: `tools/check-translations.js`
- Create: `config/content-baseline.json`
- Create: `test/content-audit.test.js`
- Create: `test/scaffold.test.js`
- Modify: `package.json`
- Modify: `_config.yml:48-50`
- Modify: `scaffolds/post.md`
- Modify: 13 English posts listed below

- [ ] **Step 1: Write failing content-rule tests**

Cover all of these exact behaviors in `test/content-audit.test.js`:

- `2023-02-29` emits `CONTENT_INVALID_DATE`; `2024-02-29` does not.
- Missing/incorrect `layout`, title, categories, or tags emit schema errors with key lines.
- An English orphan emits `TRANS_EN_ORPHAN`.
- Either side marked `translated: true` without a reciprocal true counterpart emits `TRANS_RECIPROCAL_MISSING`.
- A newly added Chinese-only post emits warning `TRANS_NEW_ZH_UNPAIRED`, never an error.
- A translated Chinese post changed without its English peer emits warning `TRANS_SOURCE_CHANGED_ONLY`.
- `Security Architecture` and `security architecture` collide under the English route policy.
- The legacy-keyword baseline accepts exactly count `242` and SHA-256 `277a56a4d490e2dafe2a47d651649b396038f1134ed299d18486cbb43bc6c80c`; any different tracked file set emits `CONTENT_KERYWORDS_BASELINE_CHANGED`.

Create `test/scaffold.test.js` to parse `_config.yml` with `js-yaml` and assert `default_layout === 'post'`, then assert `scaffolds/post.md` contains `layout`, `categories`, `tags`, `keywords`, and `translated: false`.

- [ ] **Step 2: Run tests and observe the intended failures**

Run: `node --test test/content-audit.test.js test/scaffold.test.js`

Expected: FAIL because `lib/content-audit.js` is missing and `default_layout` is currently `posts`.

- [ ] **Step 3: Implement the audit and CLI adapters**

`lib/content-audit.js` must export:

```js
validatePostSchema(posts)
validateFilenameDates(posts)
validateTranslationStructure(inventory)
validateTranslationDiff(inventory, changes)
validateTaxonomyCollisions(inventory)
validateKerywordsBaseline(posts, baseline)
validateContent(inventory, options)
```

Use `slugize(value, { transform: 1 })` for English category/tag collision keys. Require all English records to declare `translated: true`. `tools/check-content.js` runs the all-file structural rules; `tools/check-translations.js` always runs reciprocal structure rules and only runs diff reminders when `VERIFY_BASE_SHA` exists. Both print sorted diagnostics and set `process.exitCode`, without calling `process.exit()`.

Create `config/content-baseline.json` exactly as:

```json
{
  "kerywords": {
    "count": 242,
    "sha256": "277a56a4d490e2dafe2a47d651649b396038f1134ed299d18486cbb43bc6c80c"
  }
}
```

The SHA-256 input is the sorted list of tracked relative paths containing a top-level `kerywords` key, joined by `\n` with one final trailing newline. This makes additions, removals, and moves detectable without committing a 242-line allowlist.

- [ ] **Step 4: Run the real checker and confirm seven collision groups**

Run: `node tools/check-content.js`

Expected: non-zero with seven English taxonomy collision keys: `tools`, `ai-and-machine-learning-learning-data-mining`, `intrusion-detection-and-anti-intrusion-security-operations`, `security-operations-security-architecture`, `security-architecture`, `security-operations`, and `security-dev`.

- [ ] **Step 5: Normalize only the 13 colliding front matter values**

Use `apply_patch` and make these exact replacements:

- `source-en/_posts/2018-02-13-MITM.md`: `tools` → `Tools`
- `source-en/_posts/2017-09-14-Machine-learning-training-for-nothing.md`: tag → `AI and Machine Learning Learning Data Mining`
- `source-en/_posts/2018-03-30-Text-Summarization-GF.md`: tag → `AI and Machine Learning Learning Data Mining`
- `source-en/_posts/2018-08-26-AliSEC3.md`: tag → `AI and Machine Learning Learning Data Mining`
- `source-en/_posts/2019-05-09-Massive-Security.md`: tag → `Intrusion Detection and Anti-Intrusion Security Operations`
- `source-en/_posts/2020-07-05-OpenSource-VS-Business.md`: tag → `Security Operations Security Architecture`
- `source-en/_posts/2022-03-16-Enterprise-Security-Architecture-02.md`: tag → `Security Architecture`
- `source-en/_posts/2022-11-03-Security-Shift-To-Left.md`: tag → `Security Architecture`
- `source-en/_posts/2023-01-15-Process-Design-And-Optimization.md`: tag → `Security Architecture`
- `source-en/_posts/2023-08-15-Data-Security-Law-And-ALL-CyberSecurity-Related-Law-In-China.md`: tag → `Security Architecture`
- `source-en/_posts/2024-01-05-Secuirty-By-Default.md`: tag → `Security Architecture`
- `source-en/_posts/2024-05-24-Security-Operation-Design-For-Failure.md`: tag → `Security Operations`
- `source-en/_posts/2025-09-04-Python-FullStack-In-Action-And-Issues.md`: tag → `Security Dev`

- [ ] **Step 6: Correct the new-post schema**

Change `_config.yml` to `default_layout: post`. Replace `scaffolds/post.md` with:

```yaml
---
layout: post
title: {{ title }}
date: {{ date }}
categories:
tags:
keywords:
translated: false
---
```

- [ ] **Step 7: Add scripts and run all content checks**

Add to `package.json`:

```json
"check:content": "node tools/check-content.js",
"check:translations": "node tools/check-translations.js"
```

Run:

```bash
npm test
npm run check:content
npm run check:translations
```

Expected: tests PASS; content/translation checks exit 0. One aggregate warning about 242 historical `kerywords` files is allowed.

- [ ] **Step 8: Commit Task 3 with explicit paths**

Stage the modules, tests, config/scaffold, `package.json`, and exactly the 13 listed English posts. Do not stage `source/_posts/2026-03-13-Meet-Yourself.md`.

```bash
git commit -m "feat: validate bilingual content invariants"
```

### Task 4: Integrate Lowercase English URLs and Shared Alternates

**Files:**
- Create: `scripts/bilingual.js`
- Create: `themes/fexo2/layout/_partial/component/language-switch.ejs`
- Create: `test/bilingual-registration.test.js`
- Modify: `_config.en.yml`
- Modify: `themes/fexo2/layout/_partial/head.ejs:29-67`
- Modify: `themes/fexo2/layout/_partial/article.ejs:20-24`
- Modify: `themes/fexo2/layout/_partial/home.ejs`
- Modify: `themes/fexo2/layout/_partial/component/page-header.ejs`
- Modify: `themes/fexo2/languages/default.yml`
- Modify: `themes/fexo2/languages/zh-CN.yml`
- Modify: `themes/fexo2/languages/zh-TW.yml`
- Modify: `themes/fexo2/languages/en.yml`
- Modify: `themes/fexo2/source/css/custom.css`

- [ ] **Step 1: Write a failing Hexo-registration test**

Mock `hexo.extend.helper.register`, call exported `register(mockHexo)`, capture `bilingual_urls`, and invoke it with a helper context containing `full_url_for`. Assert a Chinese translated post resolves to the lowercase English URL and `/about/` resolves without a `translated` flag.

Run: `node --test test/bilingual-registration.test.js`

Expected: FAIL because `scripts/bilingual.js` is missing.

- [ ] **Step 2: Register one shared helper**

Implement `scripts/bilingual.js` with this public shape:

```js
'use strict';

const { resolveBilingualUrls } = require('../lib/site-policy');

function register(hexoInstance) {
  hexoInstance.extend.helper.register('bilingual_urls', function (targetPage) {
    const page = targetPage || this.page;
    const canonical = (page.permalink || this.full_url_for(page.canonical_path || page.path || ''))
      .replace(/\/index\.html$/, '/');
    return resolveBilingualUrls({
      siteId: this.config.language === 'en' ? 'en' : 'zh',
      canonicalUrl: canonical,
      pagePath: page.canonical_path || page.path || '',
      source: page.source || '',
      layout: page.layout,
      translated: page.translated
    });
  });
}

if (typeof hexo !== 'undefined') register(hexo);
module.exports = { register };
```

- [ ] **Step 3: Make English route generation lowercase**

Add `filename_case: 1` to `_config.en.yml`. Do not change `_config.yml` so Chinese paths remain case-preserving.

- [ ] **Step 4: Replace duplicate template URL construction**

In `head.ejs`, compute `var bilingual = bilingual_urls(page); var canonicalUrl = bilingual.canonicalUrl;`. Emit reciprocal/self alternate links only when `bilingual.alternateUrl` exists, and emit:

```ejs
<meta property="og:locale:alternate" content="<%= bilingual.alternateLocale %>">
```

after `open_graph`. Preserve `x-default` from `bilingual.xDefaultUrl`.

Create the shared partial:

```ejs
<% var links = bilingual_urls(targetPage || page); %>
<% if (links.alternateUrl) { %>
  <span class="lang-switch">
    <a href="<%= links.alternateUrl %>"
       rel="alternate"
       hreflang="<%= links.alternateLanguage %>"
       lang="<%= links.alternateLanguage %>"
       aria-label="<%= __('switch_language') %>"><%= links.alternateLanguage === 'en' ? 'EN' : '中文' %></a>
  </span>
<% } %>
```

Replace the inline switch block in `article.ejs` with this partial. Include the partial in `home.ejs` and `page-header.ejs`, passing the current page.

- [ ] **Step 5: Add localized accessible labels and minimal shared styling**

Add `switch_language` to all four locale files:

- default/zh-CN: `切换到英文站`
- zh-TW: `切換到英文站`
- en: `Switch to the Chinese site`

Generalize the existing `.article-meta .lang-switch a` rule so page-header/home instances receive the same border, color, focus-visible outline, and spacing. Do not perform the Phase 2 touch-target or layout redesign here.

- [ ] **Step 6: Refresh the custom CSS revision**

Run: `node themes/fexo2/rev.js`

Expected: the custom CSS hash in `head.ejs` changes; styles and bundle hashes remain unchanged.

- [ ] **Step 7: Build English and inspect representative outputs**

Run:

```bash
npm run build:en
test -f public/deep-dive-into-clearing-network/index.html
rg 'canonical|hreflang|og:locale:alternate' public/deep-dive-into-clearing-network/index.html
rg 'hreflang' public/about/index.html public/blog/index.html public/index.html
```

Expected: the lowercase post file exists; canonical is lowercase; English points to case-preserving Chinese; About/Blog/Home have reciprocal alternates.

- [ ] **Step 8: Run tests and commit Task 4**

Run: `npm test`

Stage only the listed config, script, test, template, locale, CSS, and revised `head.ejs` files.

```bash
git commit -m "feat: unify bilingual URL generation"
```

### Task 5: Generate Explicit Chinese-Only Redirects and Restore English 404

**Files:**
- Create: `lib/english-redirects.js`
- Create: `scripts/english-redirects.js`
- Create: `test/english-redirects.test.js`
- Delete: `source-en/_redirects`
- Modify: `_config.en.yml:10-14`

- [ ] **Step 1: Write failing redirect tests**

Test `buildEnglishRedirects` with one translated pair, one Chinese-only ASCII post, and one Chinese-only Unicode post. Assert translated posts are omitted; source routes are lowercase; Chinese targets preserve case; the final rule is `/* /404.html 404`; normalized source collisions throw.

Also load the real tracked inventory and assert it produces 64 explicit article redirects plus one 404 rule. The untracked draft must not appear.

Run: `node --test test/english-redirects.test.js`

Expected: FAIL because the module is missing.

- [ ] **Step 2: Implement pure redirect generation**

`lib/english-redirects.js` exports:

```js
buildEnglishRedirects(inventory)
parseNetlifyRedirects(text)
validateEnglishRedirects({ rules, inventory })
```

Sort Chinese-only pairing keys, render `${postPath('en', key)} ${SITES.zh.origin}${postPath('zh', key)} 301`, then append `/* /404.html 404`. Return one final trailing newline so line counts and Netlify parsing are deterministic. Reject duplicate sources, an English-backed key in the fallback set, or a cross-domain wildcard.

- [ ] **Step 3: Register the English-only Hexo generator**

`scripts/english-redirects.js` loads tracked inventory and returns:

```js
{ path: '_redirects', data: buildEnglishRedirects(inventory) }
```

for `config.language === 'en'`, and returns `[]` for Chinese builds. Export `register` for unit testing and auto-register when Hexo loads the file.

- [ ] **Step 4: Remove the static catch-all**

Delete `source-en/_redirects` and remove `_redirects` from `_config.en.yml`’s `include` array. Keep `_headers`.

- [ ] **Step 5: Build and verify generated redirect behavior**

Run:

```bash
npm run build:en
wc -l public/_redirects
tail -n 1 public/_redirects
rg '^/deep-dive-into-clearing-network/' public/_redirects
rg 'https://fz.cool/:splat' public/_redirects
```

Expected: 65 lines; final line is `/* /404.html 404`; translated post search and wildcard search have no output.

- [ ] **Step 6: Commit Task 5**

```bash
git add lib/english-redirects.js scripts/english-redirects.js test/english-redirects.test.js _config.en.yml
git rm source-en/_redirects
git commit -m "fix: keep unknown English routes on English 404"
```

### Task 6: Replace Sitemap Generator and Validate Generated Sites

**Files:**
- Create: `lib/generated-audit.js`
- Create: `tools/check-generated.js`
- Create: `test/generated-audit.test.js`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `_config.yml:4-7`

- [ ] **Step 1: Write failing generated-output tests**

Using temporary directories and `jsdom`, cover:

- Route mapping: `/foo/` maps only to `foo/index.html`; `/foo` is not treated as direct.
- A sitemap URL containing `%25E5` emits `GEN_SITEMAP_DOUBLE_ENCODED` and a missing route emits `GEN_SITEMAP_MISSING_ROUTE`.
- English sitemap/Atom uppercase paths emit `GEN_ENGLISH_PATH_NOT_LOWERCASE`.
- Atom self URL is `/atom.xml`, feed ID is the home URL, and each entry link equals its ID.
- Post HTML canonical, OG URL, JSON-LD URL, reciprocal `hreflang`, `html[lang]`, and visible switch target must agree.
- The seven landing pages require alternates; taxonomy detail pages do not.
- English `_redirects` ends in the 404 rule and `404.html` has `lang="en"`.

Run: `node --test test/generated-audit.test.js`

Expected: FAIL because `lib/generated-audit.js` is missing.

- [ ] **Step 2: Implement generated route, HTML, XML, and redirect checks**

`lib/generated-audit.js` must export:

```js
routeForOutputFile(relativeFile)
buildRouteIndex(publicDir)
resolveLocalReference({ reference, fromRoute, siteId })
validateHtmlPage(input)
validateSitemap(input)
validateAtom(input)
validateGeneratedSite(input)
```

Parse HTML and XML with `jsdom`. Decode URL paths once, normalize Unicode to NFC, preserve filesystem case, reject `%25[0-9A-Fa-f]{2}`, strip query/fragment only for file existence, and skip `mailto:`, `tel:`, `data:`, and `javascript:`. Build expected translated pages from the tracked inventory and `site-policy`, not from page titles.

`tools/check-generated.js` accepts only `--site zh|en --dir PATH`, loads tracked inventory, runs the audit, prints sorted diagnostics, and uses exit codes 0/1/2.

- [ ] **Step 3: Prove the old Chinese sitemap fails**

Before replacing the plugin, run:

```bash
npm run build:zh
node tools/check-generated.js --site zh --dir public
```

Expected: non-zero with `GEN_SITEMAP_DOUBLE_ENCODED` for Chinese category URLs.

- [ ] **Step 4: Replace the sitemap package**

Run:

```bash
npm uninstall hexo-generator-seo-friendly-sitemap
npm install --save hexo-generator-sitemap@3.0.1
```

Configure `_config.yml`:

```yaml
sitemap:
  path: sitemap.xml
  tags: true
  categories: true
```

- [ ] **Step 5: Add build and generated-check scripts**

Add or replace these scripts in `package.json`:

```json
"build:zh": "hexo clean && hexo generate --bail --config _config.yml",
"build:en": "hexo clean && hexo generate --bail --config _config.yml,_config.en.yml",
"check:generated:zh": "node tools/check-generated.js --site zh --dir public",
"check:generated:en": "node tools/check-generated.js --site en --dir public",
"verify:zh": "npm run build:zh && npm run check:generated:zh",
"verify:en": "npm run build:en && npm run check:generated:en"
```

- [ ] **Step 6: Run both generated-site checks**

Run:

```bash
npm run verify:zh
npm run verify:en
```

Expected: both exit 0; no double encoding; English sitemap, Atom, and page URLs are lowercase and direct.

- [ ] **Step 7: Commit Task 6**

```bash
git add lib/generated-audit.js tools/check-generated.js test/generated-audit.test.js package.json package-lock.json _config.yml
git commit -m "fix: validate final sitemap and feed URLs"
```

### Task 7: Repair Deterministic Links and Baseline Irrecoverable History

**Files:**
- Create: `config/link-baseline.json`
- Modify: `lib/generated-audit.js`
- Modify: `test/generated-audit.test.js`
- Modify: 5 Chinese source files listed below
- Modify: 16 English source files plus `source-en/about/index.md`

- [ ] **Step 1: Extend link tests before editing content**

Add tests that local links are case-sensitive and direct, exact baseline tuples suppress only the named source→target pair, and a baseline entry becomes `GEN_LINK_BASELINE_STALE` when the reference disappears or target begins to exist.

Run: `node --test test/generated-audit.test.js`

Expected: FAIL until baseline-aware link validation is implemented.

- [ ] **Step 2: Add the exact historical-debt baseline**

Create `config/link-baseline.json` with seven entries:

```json
{
  "zh": [
    { "source": "/Recent-Time-II/", "target": "/CrossGFW", "reason": "original article was deleted" },
    { "source": "/Text-Summarization-GF/", "target": "/image/NLP/n-gram-example.png", "reason": "historical image is unavailable" },
    { "source": "/Text-Summarization-GF/", "target": "/image/NLP/cbo_vs_skipgram.png", "reason": "historical image is unavailable" },
    { "source": "/Text-Summarization-GF/", "target": "/image/NLP/pg-note.jpg", "reason": "historical image is unavailable" }
  ],
  "en": [
    { "source": "/text-summarization-gf/", "target": "/image/NLP/n-gram-example.png", "reason": "historical image is unavailable" },
    { "source": "/text-summarization-gf/", "target": "/image/NLP/cbo_vs_skipgram.png", "reason": "historical image is unavailable" },
    { "source": "/text-summarization-gf/", "target": "/image/NLP/pg-note.jpg", "reason": "historical image is unavailable" }
  ]
}
```

- [ ] **Step 3: Implement baseline-aware local reference checks**

Inspect `a[href]`, `link[href]`, `script[src]`, `img[src|srcset|data-src]`, `source[src|srcset]`, and `video[poster]`. Resolve root-relative and page-relative references against the route index. For an internal HTML target with a fragment, decode the fragment once and require a matching target `id`; a missing target emits `GEN_FRAGMENT_MISSING`. External origins are excluded from PR checks. Missing unbaselined targets are hard errors; used baseline entries are aggregate warnings; unused/stale entries are errors.

- [ ] **Step 4: Fix eight deterministic Chinese references**

Use `apply_patch` for these exact changes:

- `source/_posts/2021-03-24-Recent-Time-II.md`: `/Little-Problem-solved`→`/Something5/`, `/cafeeinstall`→`/cafee-install-jeston-tk1/`, `/backup-when-learn-web`→`/Something4/`, `/feipin-info`→`/Crawl-From-Little-IV/`.
- `source/_posts/2023-06-19-Data-Security-And-Archtecture-Selected.md`: `/build-your-data-security-architecture/`→`/Build-Your-Data-Security-Architecture/`.
- `source/_posts/2023-07-11-When-I-Think-Manager-and-Do.md`: `/summary-of-pmo-experience/`→`/Summary-OF-PMO-Experience/`.
- `source/_posts/2026-05-09-Multi-Agent-Git-Workflow.md`: `/2026/03/09/vibe-coding-complete-guide/`→`/vibe-coding-complete-guide/`.
- `source/_posts/2023-07-19-Insight-Of-Security-Operation-Center-And-Collective-Intelligence.md`: remove the trailing `/` after the encoded fragment target.

- [ ] **Step 5: Lowercase the 36 English internal article links**

Apply the exact replacements recorded in the design audit to these files:

```text
source-en/_posts/2018-04-09-Text-Classification-With-Keras-And-CNN.md
source-en/_posts/2019-11-20-Security-Architecture-Review.md
source-en/_posts/2020-05-04-Security-Architecture-Review-II.md
source-en/_posts/2020-06-22-Talk-about-data-security.md
source-en/_posts/2020-12-28-Security-Architecture-Review-III.md
source-en/_posts/2021-09-27-Applied-Cryptography-And-Crypto-Infrastructure.md
source-en/_posts/2022-03-16-Enterprise-Security-Architecture-02.md
source-en/_posts/2022-06-13-Privacy-Computing-And-Data-Security.md
source-en/_posts/2022-10-23-Modern-SDLC-and-Security-Architecture-Review.md
source-en/_posts/2022-11-03-Security-Shift-To-Left.md
source-en/_posts/2022-11-06-Modern-Sceurity-Product.md
source-en/_posts/2022-11-16-Build-Your-Security-Specifications.md
source-en/_posts/2023-01-15-Process-Design-And-Optimization.md
source-en/_posts/2023-06-19-Data-Security-And-Archtecture-Selected.md
source-en/_posts/2023-07-19-Insight-Of-Security-Operation-Center-And-Collective-Intelligence.md
source-en/_posts/2026-05-09-Multi-Agent-Git-Workflow.md
source-en/about/index.md
```

All root-relative `iami.xyz` article targets become lowercase. Preserve absolute `https://fz.cool/...` target casing. Correct the date-style Vibe Coding URL and the Data-Driven SOC fragment as specified in the audit.

Apply this self-contained replacement map:

- `2018-04-09-Text-Classification-With-Keras-And-CNN.md`: `/Text-Summarization-GF/`→`/text-summarization-gf/`; `/Review-NN-Note/`→`/review-nn-note/`.
- `2019-11-20-Security-Architecture-Review.md`: `/Security-Architecture-Review-II/`→`/security-architecture-review-ii/`.
- `2020-05-04-Security-Architecture-Review-II.md`: `/Security-Architecture-Review/`→`/security-architecture-review/`.
- `2020-06-22-Talk-about-data-security.md`: every `/Anti-Spider/`→`/anti-spider/`; every `/What-Hells-In-CA-And-RA/`→`/what-hells-in-ca-and-ra/`; every `/What-Hells-In-HSM/`→`/what-hells-in-hsm/`; `/DSMM-Date-Security/`→`/dsmm-date-security/`; `/What-Hells-In-JumpServer/`→`/what-hells-in-jumpserver/`.
- `2020-12-28-Security-Architecture-Review-III.md`: `/Talk-about-data-security/`→`/talk-about-data-security/`; `/Security-Architecture-Review/`→`/security-architecture-review/`; `/Security-Architecture-Review-II/`→`/security-architecture-review-ii/`; `/Security-Architecture-Review-III/`→`/security-architecture-review-iii/`.
- `2021-09-27-Applied-Cryptography-And-Crypto-Infrastructure.md`: `/What-Hells-In-CA-And-RA/`→`/what-hells-in-ca-and-ra/`; `/What-Hells-In-HSM/`→`/what-hells-in-hsm/`.
- `2022-03-16-Enterprise-Security-Architecture-02.md`: both `/Security-Architecture-Review/` references→`/security-architecture-review/`.
- `2022-06-13-Privacy-Computing-And-Data-Security.md`: `/Applied-Cryptography-And-Crypto-Infrastructure/`→`/applied-cryptography-and-crypto-infrastructure/`; `/Talk-about-data-security/`→`/talk-about-data-security/`.
- `2022-10-23-Modern-SDLC-and-Security-Architecture-Review.md`: `/Security-Architecture-Review/`→`/security-architecture-review/`.
- `2022-11-03-Security-Shift-To-Left.md`: `/Modern-SDLC-and-Security-Architecture-Review/`→`/modern-sdlc-and-security-architecture-review/`.
- `2022-11-06-Modern-Sceurity-Product.md`: `/End-User-Computer-Control-And-DLP/`→`/end-user-computer-control-and-dlp/`.
- `2022-11-16-Build-Your-Security-Specifications.md`: `/MY-Enterprise-Cyber-Security-Architecture/`→`/my-enterprise-cyber-security-architecture/`.
- `2023-01-15-Process-Design-And-Optimization.md`: `/End-User-Computer-Control-And-DLP/`→`/end-user-computer-control-and-dlp/`.
- `2023-06-19-Data-Security-And-Archtecture-Selected.md`: `/End-User-Computer-Control-And-DLP/`→`/end-user-computer-control-and-dlp/`; `/Applied-Cryptography-And-Crypto-Infrastructure/`→`/applied-cryptography-and-crypto-infrastructure/`.
- `2023-07-19-Insight-Of-Security-Operation-Center-And-Collective-Intelligence.md`: the Data Security link→`/data-security-and-archtecture-selected/#0x03-Data-Driven-SOC-Security-Architecture`; `/MeiTuanMachineLearning-FeatureEnginne-Note/`→`/meituanmachinelearning-featureenginne-note/`.
- `2026-05-09-Multi-Agent-Git-Workflow.md`: `/2026/03/09/vibe-coding-complete-guide/`→`/vibe-coding-complete-guide/`; replace the absolute Chinese AI Software Engineering link with `/ai-software-engineing-with-project-agentic-soc-design-and-implement/`.
- `source-en/about/index.md`: `/Deep-Dive-Into-Clearing-Network/`→`/deep-dive-into-clearing-network/`; `/Generative-AI-Security-Guideline/`→`/generative-ai-security-guideline/`; `/Applied-Cryptography-Operation-Must-Knowns/`→`/applied-cryptography-operation-must-knowns/`.

- [ ] **Step 6: Run both full route/link checks**

Run:

```bash
npm run verify:zh
npm run verify:en
```

Expected: exit 0 with only the exact historical baseline warnings.

- [ ] **Step 7: Commit Task 7 using explicit file paths**

Stage `config/link-baseline.json`, audit/tests, and only the listed content files. Confirm the user draft is still untracked before committing.

```bash
git commit -m "fix: repair bilingual internal links"
```

### Task 8: Add CI, Netlify Guarding, and Scheduled External Checks

**Files:**
- Create: `.github/workflows/verify.yml`
- Create: `.github/workflows/external-links.yml`
- Create: `tools/check-external-links.js`
- Create: `test/external-links.test.js`
- Modify: `package.json`
- Modify: `netlify.toml`

- [ ] **Step 1: Write failing external-link classification tests**

Test that the scanner deduplicates URLs, skips `mailto:`, treats 2xx/3xx/401/403/405 as reachable, retries transient network errors once, emits warnings for final failures, and never turns network warnings into a required-check exit code.

Run: `node --test test/external-links.test.js`

Expected: FAIL because the tool is missing.

- [ ] **Step 2: Implement the scheduled external checker**

`tools/check-external-links.js` reads generated HTML, extracts external `href`/`src` URLs, checks with concurrency 8 and a 15-second timeout, retries once, prints deterministic warnings, and exits 0 unless arguments/public directory are invalid.

- [ ] **Step 3: Finalize package scripts**

The complete scripts section must include:

```json
"test": "node --test",
"check:content": "node tools/check-content.js",
"check:translations": "node tools/check-translations.js",
"check:generated:zh": "node tools/check-generated.js --site zh --dir public",
"check:generated:en": "node tools/check-generated.js --site en --dir public",
"build:zh": "hexo clean && hexo generate --bail --config _config.yml",
"build:en": "hexo clean && hexo generate --bail --config _config.yml,_config.en.yml",
"verify:zh": "npm run build:zh && npm run check:generated:zh",
"verify:en": "npm run build:en && npm run check:generated:en",
"verify": "npm test && npm run check:content && npm run check:translations && npm run verify:zh && npm run verify:en",
"check:prebuild": "npm test && npm run check:content && npm run check:translations",
"build:theme": "npm run build --prefix themes/fexo2",
"check:theme": "npm run build:theme && git diff --exit-code -- themes/fexo2/source/css/styles.css themes/fexo2/source/js/bundle.js themes/fexo2/layout/_partial/style.ejs themes/fexo2/layout/_partial/head.ejs themes/fexo2/layout/_partial/load-script.ejs",
"netlify:build": "npm run check:prebuild && node themes/fexo2/rev.js && hexo generate --bail --config ${HEXO_CONFIG:-_config.yml}"
```

- [ ] **Step 4: Add required GitHub Actions jobs**

`.github/workflows/verify.yml` uses `actions/checkout@v4`, `actions/setup-node@v4`, Node 22, and `npm ci`. Define:

- `unit-and-content` with `fetch-depth: 0`, `npm test`, `check:content`, and `check:translations`; pass `VERIFY_BASE_SHA: ${{ github.event.pull_request.base.sha }}` only for pull requests.
- `generated` matrix `site: [zh, en]` running `build:${{ matrix.site }}` and `check:generated:${{ matrix.site }}`.
- `theme-assets` installing `themes/fexo2/package-lock.json`, running `npm run check:theme`, and failing on generated-asset drift.

Trigger on pull requests and pushes to `withexo`.

- [ ] **Step 5: Add the weekly non-required workflow**

`.github/workflows/external-links.yml` runs weekly and by manual dispatch. Build each site in a matrix and run `node tools/check-external-links.js --dir public`. Do not add this job as a dependency of `verify.yml`.

- [ ] **Step 6: Guard Netlify with the shared prebuild command**

Change `netlify.toml` build command to:

```toml
command = "npm run netlify:build"
```

Keep the existing publish directory and processing configuration.

- [ ] **Step 7: Run CI-equivalent commands locally**

Run:

```bash
npm test
npm run check:content
npm run check:translations
npm run verify:zh
npm run verify:en
npm --prefix themes/fexo2 ci
npm run check:theme
```

Expected: all required checks exit 0; external network checks are not part of this gate.

- [ ] **Step 8: Commit Task 8**

```bash
git add .github/workflows/verify.yml .github/workflows/external-links.yml tools/check-external-links.js test/external-links.test.js package.json package-lock.json netlify.toml
git commit -m "ci: verify both bilingual site builds"
```

### Task 9: Final Regression, Documentation, and Draft-Safety Check

**Files:**
- Modify: `Readme.md`

- [ ] **Step 1: Run the complete clean verification**

Run:

```bash
npm ci
npm run verify
npm --prefix themes/fexo2 ci
npm run check:theme
git diff --check
```

Expected: every command exits 0. Record the total test count, Chinese/English generated route counts, redirect count, and allowed historical warnings for the handoff.

- [ ] **Step 2: Verify critical generated artifacts directly**

After the English build, assert:

```bash
test -f public/deep-dive-into-clearing-network/index.html
rg 'https://iami.xyz/deep-dive-into-clearing-network/' public/deep-dive-into-clearing-network/index.html public/sitemap.xml public/atom.xml
rg 'https://fz.cool/Deep-Dive-Into-Clearing-Network/' public/deep-dive-into-clearing-network/index.html
tail -n 1 public/_redirects
```

After the Chinese build, assert:

```bash
npm run build:zh
rg '%25[0-9A-Fa-f]{2}' public/sitemap.xml
```

Expected: first four checks succeed; the final `rg` has no output and exits 1 because no double encoding exists.

- [ ] **Step 3: Prove the user draft remains untouched and untracked**

In the isolated implementation worktree, run:

```bash
git ls-files --error-unmatch -- source/_posts/2026-03-13-Meet-Yourself.md
```

Expected: `git ls-files --error-unmatch` exits non-zero. After the verified feature branch is integrated, run `git status --short --untracked-files=all` in `/Users/mour/Documents/blog`; it must still show `?? source/_posts/2026-03-13-Meet-Yourself.md`.

- [ ] **Step 4: Update the changelog**

Add a concise `2026/07/10` entry to `Readme.md` covering lowercase English canonical URLs, repaired sitemap/404 routing, site-level alternates, and automated bilingual verification.

- [ ] **Step 5: Commit the documentation-only handoff**

```bash
git add Readme.md
git commit -m "docs: record bilingual correctness safeguards"
```

- [ ] **Step 6: Perform final code review and production-ready audit**

Review the complete diff against `docs/superpowers/specs/2026-07-10-bilingual-site-correctness-design.md`. Confirm every acceptance criterion is either locally verified or explicitly marked as requiring deployment. Do not push or mutate Netlify/Search Console without separate user authorization.

Post-deployment verification commands, to run only after an authorized deployment, are:

```bash
curl -sS -I https://iami.xyz/Deep-Dive-Into-Clearing-Network/
curl -sS -I https://iami.xyz/deep-dive-into-clearing-network/
curl -sS -I https://iami.xyz/definitely-missing-bilingual-audit/
curl -sS -L https://iami.xyz/sitemap.xml
curl -sS -L https://fz.cool/sitemap.xml
```

Expected after deployment: old mixed-case English URL redirects once to lowercase; lowercase returns 200 with matching canonical; unknown English URL stays on `iami.xyz` and returns 404; both sitemap URLs are valid.
