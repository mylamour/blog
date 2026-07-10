# Bilingual Site Correctness and Guardrails Design

**Date:** 2026-07-10

**Status:** Approved in conversation

**Scope:** Phase 1 — internationalization correctness, routing, sitemap integrity, and automated regression protection

## 1. Context

The repository builds two Hexo sites from one codebase:

- Chinese: `source/` + `_config.yml` → `https://fz.cool`
- English: `source-en/` + `_config.yml,_config.en.yml` → `https://iami.xyz`

The bilingual content inventory is structurally healthy: all 117 English posts have same-named Chinese source files, and both sides of every translated pair declare `translated: true`. Sixty-five Chinese posts currently have no English counterpart. A new Chinese post without a translation is an accepted publishing state.

Several items from the earlier optimization list are already implemented and should not be rebuilt: translated posts emit reciprocal `hreflang`, both sites generate their own sitemap and Atom feed, English About and 404 source files exist, Open Graph emits `zh_CN`/`en_US`, and the configured fonts use `font-display: swap`.

The audit instead found these higher-priority correctness gaps:

1. Most English sitemap post URLs use mixed case, while production redirects them to lowercase. The final page then declares the mixed-case URL as canonical. Sitemap, canonical, `hreflang`, OG, JSON-LD, Atom, and visible language-switch links therefore disagree with the final HTTP URL.
2. The Chinese category sitemap double-encodes non-ASCII category paths (`%25E...`), producing sitemap entries that return 404.
3. `hreflang` is limited to posts marked `translated: true`; equivalent home, archive, About, Search, Category, Tag, and Project landing pages have no machine-readable alternates.
4. The English catch-all redirect sends every missing URL to the Chinese domain, so the valid English 404 page is not reached for unknown paths.
5. No repository CI, content schema check, translation consistency check, generated-site validation, or link check prevents regressions.
6. `_config.yml` uses `default_layout: posts`, while the theme and all valid articles use `post`.
7. Existing internal links contain date-style and case-sensitive route errors that a successful Hexo build does not detect.

## 2. Goals

Phase 1 will:

- Make lowercase the only canonical URL policy for the English site while preserving existing Chinese URL casing.
- Make all URL-bearing outputs agree: generated paths, canonical, `hreflang`, OG, JSON-LD, Atom, sitemap, language switcher, and redirects.
- Repair sitemap encoding and ensure every sitemap URL resolves directly to a generated page.
- Expose equivalent bilingual landing pages to users and search engines without inventing mappings for non-equivalent taxonomy detail pages.
- Redirect only known Chinese-only articles from the English domain and keep genuinely unknown requests on the English site’s 404 page.
- Fix deterministic build/configuration and internal-link defects discovered by the audit.
- Add local and CI guardrails that distinguish hard correctness failures from useful translation reminders.

## 3. Non-goals

Phase 1 will not:

- Rewrite the English About narrative or make editorial decisions about personal or employer-related content.
- Translate the remaining 65 Chinese-only posts.
- Migrate every historical `kerywords` field or redesign the full tag taxonomy.
- Convert remote images, modify S3/CloudFront, or introduce an image transformation service.
- Submit either site to Google Search Console.
- Perform broad mobile, archive, typography, or CSS redesign work.
- Modify or commit the user’s untracked `source/_posts/2026-03-13-Meet-Yourself.md` draft.

Those items belong to later, independently specified phases.

## 4. Chosen Approach

The work will be delivered incrementally rather than as an emergency-only patch or a single comprehensive overhaul.

1. Establish executable tests for URL and content policy.
2. Correct English routes and all dependent SEO/feed outputs.
3. Repair sitemap generation.
4. Replace the English wildcard redirect with generated, explicit fallbacks.
5. Add equivalent-page alternates and a shared visible language switcher.
6. Fix scaffolding and deterministic internal links.
7. enforce the verified state in GitHub Actions and Netlify builds.

This sequence keeps each behavior independently testable and makes rollback straightforward.

## 5. URL and Translation Architecture

### 5.1 Single policy module

A small pure module will be the single source of truth for bilingual routing. It will contain:

- Site hosts and language codes.
- English lowercase path normalization.
- Chinese case-preserving path derivation.
- Post pairing-key extraction from same-named source files.
- The explicit list of equivalent site-level paths.
- Collision detection for any two logical resources that normalize to the same public path.

The pure module will be used by thin Hexo helper/generator registrations and by verification commands. Templates will not independently concatenate domains and `page.path`.

### 5.2 Post path policy

The exact Markdown basename is the translation pairing key. No title matching or translated-title slug generation is used.

- English output paths are lowercase.
- Chinese output paths retain the source basename’s current casing.
- A Chinese page targeting English lowercases the paired slug.
- An English page targeting Chinese derives the case-preserving slug from the paired source filename rather than from the already-lowercased English route.
- `x-default` continues to point to the English page.

There are currently no case-insensitive English post-slug collisions. A pre-build collision check will make this an enforced invariant.

### 5.3 Equivalent site-level paths

The following landing pages are explicitly equivalent and may emit reciprocal alternates and a visible switcher:

- `/`
- `/blog/`
- `/about/`
- `/search/`
- `/category/`
- `/tag/`
- `/project/`

Generated detail pages such as a specific category or tag are not automatically paired because the Chinese and English taxonomy labels are not one-to-one. They retain self-canonical metadata only unless a future design adds an explicit mapping.

### 5.4 Shared metadata and switcher

The URL resolver feeds:

- `<link rel="canonical">`
- Reciprocal `<link rel="alternate" hreflang="...">`
- `x-default`
- `og:url`
- `og:locale:alternate` for translated/equivalent pages
- JSON-LD `url` and `mainEntityOfPage`
- Visible language-switch links

The switcher becomes a reusable partial rather than post-template-only markup. Its link includes `rel="alternate"`, `hreflang`, `lang`, and a localized accessible label. It renders only when the resolver proves that an equivalent page exists.

## 6. Lowercase Migration and Taxonomy Collisions

The English Hexo build will generate lowercase paths, making sitemap, Atom, page permalinks, and generated internal links lowercase by construction.

Before enabling that policy, the implementation will inventory posts, categories, and tags after normalization. English tag terms that differ only by casing and would collide at the same lowercase route will be consolidated to one existing canonical spelling. This is a collision repair, not a semantic taxonomy rewrite. Other synonymous or awkward historical tag values remain unchanged in Phase 1.

The verifier blocks future case-insensitive route collisions. Existing mixed-case English URLs may redirect once to their lowercase canonical URL, but generated pages and metadata must never point at the redirecting form.

## 7. Sitemap and Feed Design

The outdated `hexo-generator-seo-friendly-sitemap` package will be replaced with `hexo-generator-sitemap`. Each site will continue to publish its own `/sitemap.xml` under its configured host.

Generated XML validation will assert:

- Well-formed sitemap and Atom XML.
- No `%25xx` double-encoded path fragments.
- Correct host per build.
- Lowercase English post URLs.
- Every sitemap location maps directly to a generated output route.
- Feed self links, entry links, and entry IDs use the same final URL policy.

Changing from a sitemap index to a single sitemap is acceptable. `robots.txt` continues to reference `/sitemap.xml`, so no consumer-facing path changes.

## 8. English Redirect and 404 Design

The source-level wildcard redirect will be removed. An English-only Hexo generator will build `_redirects` from the tracked content inventory:

1. Compare Chinese and English post basenames.
2. For each Chinese-only post, emit a lowercase English request path that redirects once to the exact case-preserving Chinese canonical URL.
3. After all known fallbacks, emit the English 404 rewrite with status 404.

Static assets and existing English pages continue to shadow non-forced fallback rules. Unknown typos remain on `iami.xyz` and display `source-en/404.html`; they no longer cross domains before failing.

The generator fails if normalized redirect sources collide, a translated English page is also present in the fallback set, or an expected target cannot be derived.

## 9. Content and Build Guardrails

### 9.1 Hard failures

The content checker exits non-zero for:

- Unparseable front matter after CRLF normalization.
- Invalid filename dates for tracked posts.
- A tracked article without `layout: post`, title, categories, or tags.
- An English post without a same-named Chinese source.
- A `translated: true` post without a same-named, reciprocally marked counterpart.
- Post, category, tag, or redirect path collisions after normalization.
- Generated canonical or `hreflang` URLs that do not map to a final output page.
- Broken generated internal page, CSS, JavaScript, font, or local-image references.
- Invalid sitemap/Atom XML or incorrect build hosts/languages.

### 9.2 Non-blocking reminders

The checker reports but does not fail for:

- A newly added Chinese post without an English counterpart.
- A translated Chinese source changed without the English source changing in the same diff.
- Historical `kerywords` occurrences covered by the recorded baseline.
- Unreachable external URLs during scheduled network checks.

Newly added tracked content must use `keywords`, not `kerywords`. This prevents growth of the historical typo without creating a noisy all-file migration.

### 9.3 Scaffolding

`default_layout` becomes `post`. The post scaffold exposes standard `categories`, `tags`, `keywords`, and translation-state fields so a new article starts from the supported schema.

## 10. Verification and CI

### 10.1 Local commands

The repository will expose one documented `npm run verify` entry point composed of focused commands for:

- Node unit tests.
- Content/front-matter checks.
- Translation inventory checks.
- Chinese and English Hexo builds with bail-on-error behavior.
- Generated metadata, XML, route, and internal-link checks.

The pure routing and inventory modules will use Node’s built-in test runner. Fixtures cover mixed-case slugs, Unicode slugs, missing pairs, reciprocal flags, lowercase collisions, site-level mappings, known Chinese-only fallbacks, and unknown 404 behavior.

### 10.2 GitHub Actions

A pull-request workflow will:

- Pin Node 22 and install from lockfiles with `npm ci`.
- Run unit and content checks.
- Build Chinese and English sites in separate matrix jobs.
- Validate each job’s generated output against the expected host and language.
- Build theme assets and fail if committed generated CSS/JavaScript is stale.

External HTTP checks run on a scheduled workflow and report failures without making ordinary pull requests dependent on third-party availability.

### 10.3 Netlify

Each Netlify site will run the lightweight content, translation, and URL-policy checks before its existing site generation command. This provides a final deployment guard even if branch-protection settings are absent or bypassed.

Diagnostics use stable error codes plus `file:line` output. Errors fail the command; reminders leave the exit code at zero.

## 11. Existing Defect Repair

Phase 1 will repair deterministic repository-owned defects revealed by the new checks, including:

- Date-style links that no longer match `:title/` permalinks.
- Internal path casing mismatches.
- Other local generated-route references with an unambiguous existing target.

Historical missing external assets or links without a trustworthy replacement are reported separately rather than silently rewritten or removed.

## 12. Rollout and Rollback

The implementation will use small commits in this order:

1. Tests and audit fixtures that reproduce the current failures.
2. Shared URL policy, English lowercase generation, and collision normalization.
3. Sitemap package replacement and XML verification.
4. Explicit Chinese-only redirects and English 404 behavior.
5. Site-level alternates and the shared language switcher.
6. Scaffold and deterministic internal-link fixes.
7. CI and deployment guards.

After deployment, production verification checks representative translated posts, a Chinese-only post, an unknown English path, sitemap entries, Atom entries, and equivalent landing pages.

Rollback can revert the responsible commit independently. The old mixed-case English URLs continue to redirect, so rollback does not require deleting content or changing established Chinese URLs.

## 13. Acceptance Criteria

Phase 1 is complete when:

- Both sites build cleanly on Node 22 from their lockfiles.
- Every English post sitemap URL is lowercase and maps directly to a generated page.
- Chinese sitemap URLs contain no double encoding.
- Canonical, OG, JSON-LD, Atom, sitemap, and language-switch URLs agree.
- Every translated post has reciprocal, direct-target `hreflang` links.
- The seven equivalent landing-page paths have reciprocal alternates and a visible switcher.
- A known Chinese-only path on `iami.xyz` redirects once to the exact Chinese canonical URL.
- An unknown path stays on `iami.xyz`, returns status 404, and renders the English 404 page.
- Newly untranslated Chinese posts produce reminders rather than CI failures.
- Structural errors in declared translated pairs fail CI and Netlify builds.
- Deterministic internal-route defects found in the audit are fixed or explicitly classified as external historical debt.
- No change or commit includes `source/_posts/2026-03-13-Meet-Yourself.md`.

## 14. Follow-up Phases

After Phase 1 is stable, separate design and implementation cycles will cover:

1. Accessibility and light frontend performance: page zoom, 44px touch targets, semantic controls, keyboard focus, conditional font loading, English line length, and archive mobile layout.
2. Editorial/content experience: a concise English About introduction and author-reviewed career narrative.
3. Image infrastructure: dimensions, responsive variants, AVIF/WebP, GIF-to-video, cache policy, and CloudFront/S3 delivery changes.
4. External operations: Search Console submission and production SEO monitoring.
