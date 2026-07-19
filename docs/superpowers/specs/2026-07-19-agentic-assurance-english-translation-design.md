# Agentic Assurance Engineering English Translation Design

## Objective

Create a complete English counterpart for
`source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md` at the
exact same basename under `source-en/_posts/`. The English article must preserve
the Chinese source's technical claims, evidence boundaries, structure, diagrams,
and first-person voice while reading as a natural English engineering essay.

## Source and Output

- Chinese source:
  `source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md`
- English output:
  `source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md`
- Reciprocal translation metadata:
  both files declare `translated: true`
- The output keeps the same `0x00` through `0x09` section structure.

## Translation Style

The translation will use polished, idiomatic English suitable for a long-form
software engineering article. It will follow the direct first-person style used
by the existing English posts, while avoiding word-for-word Chinese syntax.

The translation will not summarize, shorten, embellish, or introduce new
technical claims. All counts, dates, test results, status labels, limitations,
and statements about what evidence does not prove must retain their original
scope.

## Terminology Policy

Established English technical terms remain unchanged, including:

- Agentic Assurance Engineering
- Agentic SDLC
- Grounded Review
- Runtime Proof
- Ownership Lease
- Evidence Engineering
- Proof-Carrying Delivery
- Context Engineering
- Harness Engineering
- Loop Engineering
- candidate finding
- blocking finding
- first-breakpoint
- provenance
- counterevidence
- readback
- managed claim

Repository and product names such as X2-Docs, X2-Bot, X2-Orbit, X-Pulsar, Sea,
Core, Gravity, and Spiral Review remain unchanged. Code identifiers, commands,
paths, version numbers, state enum values, and evidence field names remain
literal unless the source uses Chinese explanatory text around them.

## Front Matter

The English Front Matter will contain:

- an idiomatic English title and description;
- `categories: Security Architect`, matching the established English taxonomy;
- independent English tags represented as a YAML array;
- the existing English technical keywords;
- `translated: true`.

The Chinese source will only be changed from `translated: false` to
`translated: true`. No other Chinese prose or metadata will be rewritten as part
of this translation task.

## Markdown and Diagram Handling

- Preserve Markdown heading levels, blockquotes, tables, emphasis, and code
  fences.
- Preserve executable code, commands, YAML keys, identifiers, and paths.
- Translate prose inside Mermaid nodes, subgraph labels, edge labels, notes,
  legends, and figure captions.
- Preserve Mermaid graph structure, node IDs, class definitions, colors, and
  syntax.
- Translate table headings and explanatory cells while preserving values and
  claim boundaries.
- Preserve deliberate status vocabulary such as CURRENT, LIVE, PARTIAL, RISK,
  MISSING, TARGET, CANDIDATE, FOUNDATION, and ADVISORY.

## Quality Controls

The completed translation must satisfy all of the following:

1. The English file has the exact same basename as the Chinese file.
2. Both sides declare `translated: true`.
3. Every source section, table, figure, code block, and substantive paragraph
   has an English counterpart.
4. Mermaid block counts and fenced-code block boundaries match the source.
5. Numeric claims and evidence states remain unchanged.
6. No unintended Chinese prose remains, except proper names or literals that
   cannot be translated without changing an identifier.
7. Repository content and translation checks pass when the new files are
   included in the inventory.
8. The English Hexo build and generated-site checks pass.

## Out of Scope

- Rewriting or shortening the Chinese article.
- Changing the article's technical claims or evidence classifications.
- Redesigning the Hexo theme.
- Retrofitting tag arrays across older articles.
- Creating new diagrams or images.

## Acceptance Criteria

The task is complete when the English article exists in `source-en/_posts/`, the
Chinese and English Front Matter form a valid reciprocal translation pair, the
full article reads naturally in English without loss of evidence boundaries,
and the repository's bilingual validation and English build checks succeed.
