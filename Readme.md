> Good morning, and in case I don't see ya, good afternoon, good evening, and good night

## Optional local pre-commit check

CI is authoritative, but you can opt in to the local content and translation reminder:

```sh
npm run check:pre-commit
```

Install it as a local hook with:

```sh
hook_path="$(git rev-parse --git-path hooks/pre-commit)"
mkdir -p "$(dirname "$hook_path")"
ln -sf "$(git rev-parse --show-toplevel)/tools/pre-commit-check.js" "$hook_path"
```

The local check validates the staged snapshot and compares staged post changes with `HEAD`. It warns when a new Chinese article has no English peer yet. It fails when an article declares `translated: true` without a reciprocal `translated: true` peer.

## Security notes

`themes/fexo2` declares direct development dependency `esbuild@^0.21.0`, currently resolved in its lockfile as `0.21.5`; that resolution is affected by the moderate advisory [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99). The available `npm audit fix` upgrade is the breaking major release `esbuild@0.28.1`; it is deferred pending compatible theme-build validation. This does not affect the root production dependency audit.

## Changelog

### 2026/07/12

* English quality pass: improved Story, About, and 404 pages; reviewed the first 32 translations and polished 9 of them.
* Added an optional staged-index-aware local pre-commit check (see [Optional local pre-commit check](#optional-local-pre-commit-check)); root `npm audit` now reports 0 vulnerabilities.
* Performance polish: configurable WebP avatar with PNG fallback and `font-display: swap`.
* `img.iami.xyz` image conversion requires separate CDN/storage work and is not included here. The deferred theme `esbuild` upgrade is tracked in the existing [Security notes](#security-notes).

### 2026/07/10

* Bilingual correctness safeguards: lowercase English canonical URLs, repaired sitemap and 404 routing, site-level alternates, and automated bilingual verification

### 2026/07/09

* Launch English edition at https://iami.xyz (single repo + `_config.en.yml` + second Netlify site, `HEXO_CONFIG` env driven)
* First 3 posts translated into English, plus English About page; hreflang and language switcher between fz.cool and iami.xyz
* Force 301 iami.xyz → fz.cool until the English site goes live (remove duplicate content)
* SEO: canonical / JSON-LD / Open Graph / robots.txt; GA ID moved to theme config
* In-post links switched from absolute iami.xyz URLs to relative paths
* Theme UI strings internationalized (word count, read time, visits, copy button)

### 2026/07/07

* Performance: subset FZShuSong font to woff2, minify HTML/CSS at build time, lazy-load images at generate time, Netlify cache headers, asset cache-busting via rev.js
* New theme components: light/dark theme toggle, reading progress bar, image zoom
* Clean up gh-pages deploy leftovers (hexo-deployer-git, CNAME, deploy config)

### 2026/1/15

* Remove useless front, Lazy Load image to reduce the LCP
* Use Prism to highlight code block within Markdown
* Hidden the scroll bar.
* Support Mermaid Render.
* Upgrade Netlify runtime from 18.x to 22.x
* Enable BuSuanZi Count
* Enable WordCount & Time Read
* Enable Comments System Powered By https://giscus.app/

### 2024/01/15

* Modified blog domain to https://fz.cool

### 2023/06/25
* Display blog directly
* Modified the blog style , include font, css, and related
* Modified blog name to “開”
* Modified solgon to “吾生也有涯, 而知也无涯”

### 2023/04/14
![Screenshot 2023-04-14 at 18 46 39](https://user-images.githubusercontent.com/12653147/232024323-119e7ea6-9ecd-4fb1-81aa-ce08f09654ec.png)

* enable new styles in https://iami.xyz
* move blog from https://iami.xyz to https://iami.xyz/blog
* add icon and website link to new homepage
* move all images from https://user-images.githubusercontent.com to https://img.iami.xyz

### 2022/09/22
![Screenshot 2023-04-14 at 18 48 33](https://user-images.githubusercontent.com/12653147/232024645-cce00e6b-49ae-451d-8889-c682d64c0716.png)
* Blog: https://iami.xyz
* Blog RSS: https://iami.xyz/atom.xml
* Notes: https://github.com/mylamour/blog/issues
* My Book: https://book.iami.xyz or https://www.securityarchitecture.pro/
* Read List: https://iread.cool 
<!-- https://web.archive.org/web/20230224163358/http://iami.xyz/ -->

### 2016/02/02
* move blog from wordpress to github pages

### 2014 
* i can't remember
