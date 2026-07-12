# English Entry, Quality, Performance, and Dependency Design

## Goal

Improve the English site's first-visit experience, preserve bilingual publishing
discipline, systematically polish the oldest English translations, reduce local
asset rendering cost, and remediate dependency vulnerabilities without changing
the site's hosting or deployment workflow.

## Scope

This design covers five requested improvements:

1. An English About-page reading guide, a dedicated Story page, and an English
   404 recovery page.
2. An incremental reminder for new Chinese posts that do not yet have an
   English peer.
3. Editorial review of every translated English post dated 2016 through 2018.
4. Local image and font-loading improvements.
5. Conservative dependency vulnerability remediation compatible with Hexo 7
   and Node 22.

Search Console submission, CDN configuration, deployment, and changes to the
Chinese source articles are outside this scope.

## English Entry Content

The English About page remains personal rather than becoming a résumé. Its top
will gain a short introduction and a "Where to begin" guide with links to
security architecture, technical writing, life writing, and the new Story
page. The present full career narrative moves unchanged in meaning to
`/story/`; it may receive only editorial formatting needed for page structure.

The English 404 page uses the restrained phrase "The path ends here" and
provides direct Home, Search, and Blog recovery links. It follows the existing
theme, responsive behavior, and English-site language metadata.

## Publishing Guardrail

The existing content and translation checks remain the source of truth. Their
changed-file advisory output will explicitly identify a newly added Chinese
post with no English peer. A Chinese post that declares `translated: true`
continues to fail validation when the exact same-basename English peer does not
declare the reciprocal flag.

The repository will provide a documented optional pre-commit wrapper that runs
the content and translation checks. It will not silently install or require a
Git hook, so contributors who do not use hooks retain the same workflow while
CI enforces the invariant.

## Translation Editorial Policy

Every English article paired with a 2016–2018 Chinese source will be reviewed.
Edits are limited to English prose: title, excerpt, lead, terminology,
grammar, readability, and obvious literal translations. Dates, filenames,
front matter pairing fields, routes, Chinese source material, and code blocks
remain unchanged. Chinese comments inside code blocks remain Chinese.

The preferred style is clear professional English, retaining the author's
first-person voice and technical precision rather than replacing it with a
generic marketing tone.

## Performance Policy

The repository-controlled theme PNG assets will receive WebP equivalents and
the templates/styles will retain PNG fallback where appropriate. Font faces
will use `font-display: swap` so text remains visible during loading.

The externally hosted `img.iami.xyz` image corpus will not be downloaded,
rewritten, or converted in this change. That requires CDN/storage authority
outside the repository. A follow-up note will state that format negotiation or
an image CDN is the appropriate next step for those images.

## Dependency Policy

Run `npm audit` from a clean install, identify the direct and transitive
advisories, and upgrade only the smallest compatible dependency versions that
remove them. Compatibility is constrained to Hexo 7 and Node 22. Do not use
`npm audit fix --force` and do not accept an unrelated major-version upgrade.

If a remaining advisory can only be removed by a breaking dependency change,
record its package, severity, dependency path, and reason for deferral in the
README or security note.

## Verification

Automated coverage will prove new changed-post diagnostics and the optional
pre-commit wrapper behavior. Existing content, translation, generated-site,
and bilingual URL checks remain required. Each dependency update must pass
`npm ci`, `npm run verify`, theme drift checking, and a clean diff check.

Manual review will verify the English About, Story, and 404 pages at desktop
and mobile widths, and will review every edited 2016–2018 translation against
its Chinese counterpart.
