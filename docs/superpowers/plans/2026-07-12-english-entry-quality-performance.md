# English Entry, Quality, Performance, and Dependency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve English entry content, early translations, publishing feedback, local asset delivery, and dependency safety without changing deployment.

**Architecture:** English pages live in `source-en`; fexo2 owns shared templates and assets; inventory checks remain the source of truth. The optional local wrapper invokes existing checks and never installs hooks.

**Tech Stack:** Hexo 7, Node 22, EJS, Sass, Node test runner, npm audit, cwebp.

---

### Task 1: English entry content

**Files:** `source-en/about/index.md`, `source-en/story/index.md`, `source-en/404.html`, `test/generated-audit.test.js`.

- [ ] Add a failing test asserting About links to `/story/`, Story is English and links to About, and the 404 page contains `The path ends here` plus Home, All posts, and Search links. Run `node --test test/generated-audit.test.js` and confirm it fails.
- [ ] Add a short first-person About introduction and a “Where to begin” list pointing to security architecture, blog, life writing, and Story. Move the full current career narrative to a new `layout: page`, `comments: false` Story page. Replace the 404 heading and remove the Chinese-site fallback. Re-run the focused test, `npm run verify:en`, and `npm run verify:zh`.
- [ ] Commit: `feat: improve English entry pages`.

### Task 2: Optional local translation check

**Files:** `tools/pre-commit-check.js`, `package.json`, `Readme.md`, `test/content-audit.test.js`.

- [ ] Add a failing CLI test that invokes the missing wrapper: warning-only unpaired new Chinese content must exit zero, while an invalid reciprocal `translated: true` pair must exit non-zero. Run `node --test test/content-audit.test.js` and confirm RED.
- [ ] Implement a Node wrapper that runs `check:content` and `check:translations`, forwards output, and preserves non-zero exit status. Add `check:pre-commit` to `package.json`; document the optional `ln -sf ../../tools/pre-commit-check.js .git/hooks/pre-commit` command without auto-installing hooks. Run the focused tests and `npm run check:pre-commit`.
- [ ] Commit: `feat: add pre-commit translation reminder`.

### Task 3: 2016–2018 English editorial pass

**Files:** all 32 tracked `source-en/_posts/2017-*.md` and `source-en/_posts/2018-*.md` English translations.

- [ ] Record each file’s filename, YAML front matter, links, and fenced code before editing. These are immutable for this task.
- [ ] Compare every same-basename English/Chinese pair chronologically. Polish titles, excerpts, lead paragraphs, literal phrasing, grammar, and security terminology; preserve authorial voice. Do not modify code fences, code comments, URLs, dates, filename, or front matter.
- [ ] After each batch run `npm run check:content`, `npm run check:translations`, and finally `npm run verify:en`. Commit: `docs: polish early English translations`.

### Task 4: Local image and font loading

**Files:** `themes/fexo2/source/images/avatar.webp`, `themes/fexo2/layout/_partial/home.ejs`, `themes/fexo2/layout/_partial/component/page-header.ejs`, `themes/fexo2/source/sass/_fontello.scss`, generated `themes/fexo2/source/css/styles.css`, `test/generated-audit.test.js`.

- [ ] Add a failing template test requiring both avatar templates to include `<picture>`, `/images/avatar.webp`, and the original configurable `<img src="<%= theme.avatar %>">` fallback. Run the focused test and confirm RED.
- [ ] Generate `avatar.webp` with `cwebp -q 82`; wrap the two avatar images in a WebP-first picture element; add `font-display: swap` to fontello. Regenerate CSS with the theme build, never hand-edit generated CSS. Run `npm run check:theme` and `npm run verify`.
- [ ] Commit: `perf: serve a WebP avatar with PNG fallback`.

### Task 5: Conservative dependency remediation

**Files:** `package-lock.json`, and `package.json` only if a direct compatible range changes; `Readme.md` only for a documented deferral.

- [ ] Save the audit baseline. Confirm it includes direct `js-yaml` and transitive `brace-expansion`, `dompurify`, `form-data`, `minimatch`, `morgan`, `picomatch`, and `ws` advisories.
- [ ] Run `npm audit fix` without `--force`; retain only patch/minor lockfile updates compatible with Hexo 7 and Node 22, including the proposed `js-yaml` 4.3.0, `ws` 8.21.0, and `picomatch` 2.3.2. Do not take any major upgrade.
- [ ] Run `npm ci`, `npm audit --omit=dev`, `npm run verify`, `npm run check:theme`, and `git diff --check`; document any unavoidable deferred advisory. Commit: `chore: remediate npm audit findings`.

### Task 6: Final documentation and regression

**Files:** `Readme.md`.

- [ ] Add a dated entry for Story, the optional local check, the editorial pass, WebP fallback, and the final audit result. State clearly that `img.iami.xyz` conversion needs separate CDN/storage work.
- [ ] Run `npm ci`, `npm run verify`, `npm --prefix themes/fexo2 ci`, `npm run check:theme`, and `git diff --check`. Confirm the user’s untracked `source/_posts/2026-03-13-Meet-Yourself.md` is neither staged nor tracked.
- [ ] Commit: `docs: record English site quality improvements`.
