'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const {
  parsePostSource,
  buildInventory,
  loadTrackedInventory
} = require('../lib/content-inventory');
const { sortDiagnostics } = require('../lib/diagnostics');
const { postPath } = require('../lib/site-policy');
const {
  validatePostSchema,
  validateFilenameDates,
  validateTranslationStructure,
  validateTranslationDiff,
  validateTaxonomyCollisions,
  validateKerywordsBaseline,
  validateContent
} = require('../lib/content-audit');

const OMIT = Symbol('omit');
const EXPECTED_KERYWORDS_BASELINE = Object.freeze({
  count: 242,
  sha256: '277a56a4d490e2dafe2a47d651649b396038f1134ed299d18486cbb43bc6c80c'
});

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function serializeField(key, value) {
  if (value === OMIT) return [];
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${key}: []`];
    return [`${key}:`, ...value.map((item) => `  - ${JSON.stringify(item)}`)];
  }
  if (value === null) return [`${key}:`];
  return [`${key}: ${typeof value === 'string' ? JSON.stringify(value) : String(value)}`];
}

function postFixture(options = {}) {
  const side = options.side
    || (options.file && options.file.startsWith('source-en/') ? 'en' : 'zh');
  const file = options.file || `${side === 'en' ? 'source-en' : 'source'}/_posts/2024-02-29-Example.md`;
  const fields = {
    layout: 'post',
    title: 'Example',
    categories: 'Security',
    tags: 'Testing',
    translated: side === 'en',
    ...options.fields
  };
  const orderedKeys = ['layout', 'title', 'categories', 'tags', 'keywords', 'kerywords', 'translated'];
  const frontMatterLines = orderedKeys.flatMap((key) => (
    Object.prototype.hasOwnProperty.call(fields, key) ? serializeField(key, fields[key]) : []
  ));

  return parsePostSource({
    file,
    side,
    source: ['---', ...frontMatterLines, '---', options.body || 'Body'].join('\n')
  });
}

function diagnosticsWithCode(diagnostics, code) {
  return diagnostics.filter((diagnostic) => diagnostic.code === code);
}

function legacyPathSet(posts) {
  return posts
    .filter((post) => post.keyLines.has('kerywords'))
    .map((post) => post.file)
    .sort(compareText);
}

function hashPaths(paths) {
  return createHash('sha256').update(`${paths.join('\n')}\n`).digest('hex');
}

test('rejects impossible filename dates and accepts valid leap days', () => {
  const invalid = postFixture({
    file: 'source/_posts/2023-02-29-Invalid.md',
    side: 'zh'
  });
  const leapDay = postFixture({
    file: 'source/_posts/2024-02-29-Valid.md',
    side: 'zh'
  });

  const diagnostics = validateFilenameDates([invalid, leapDay]);

  assert.deepEqual(diagnostics.map((diagnostic) => diagnostic.code), ['CONTENT_INVALID_DATE']);
  assert.deepEqual(diagnostics[0].location, {
    file: invalid.file,
    line: 1,
    column: 1
  });
});

test('rejects tracked post filenames without an exact calendar-date prefix', () => {
  const post = postFixture({ file: 'source/_posts/Example.md', side: 'zh' });

  const diagnostics = validateFilenameDates([post]);

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].severity, 'error');
  assert.equal(diagnostics[0].code, 'CONTENT_INVALID_DATE');
});

test('reports invalid required front matter at each relevant key line', () => {
  const post = postFixture({
    file: 'source/_posts/2024-02-29-Invalid-Schema.md',
    side: 'zh',
    fields: {
      layout: 'posts',
      title: '   ',
      categories: null,
      tags: []
    }
  });

  const diagnostics = validatePostSchema([post]);

  assert.deepEqual(
    diagnostics.map(({ severity, code, location }) => ({ severity, code, location })),
    [
      {
        severity: 'error',
        code: 'CONTENT_INVALID_LAYOUT',
        location: { file: post.file, line: post.keyLines.get('layout'), column: 1 }
      },
      {
        severity: 'error',
        code: 'CONTENT_INVALID_TITLE',
        location: { file: post.file, line: post.keyLines.get('title'), column: 1 }
      },
      {
        severity: 'error',
        code: 'CONTENT_INVALID_CATEGORIES',
        location: { file: post.file, line: post.keyLines.get('categories'), column: 1 }
      },
      {
        severity: 'error',
        code: 'CONTENT_INVALID_TAGS',
        location: { file: post.file, line: post.keyLines.get('tags'), column: 1 }
      }
    ]
  );
});

test('does not accept inherited required front-matter properties', () => {
  const post = postFixture({
    file: 'source/_posts/2024-02-29-Inherited-Schema.md',
    side: 'zh',
    fields: {
      layout: OMIT,
      title: OMIT,
      categories: OMIT,
      tags: OMIT
    }
  });
  Object.setPrototypeOf(post.data, {
    layout: 'post',
    title: 'Inherited title',
    categories: 'Inherited category',
    tags: 'Inherited tag'
  });

  const diagnostics = validatePostSchema([post]);

  assert.deepEqual(diagnostics.map((diagnostic) => diagnostic.code), [
    'CONTENT_INVALID_LAYOUT',
    'CONTENT_INVALID_TITLE',
    'CONTENT_INVALID_CATEGORIES',
    'CONTENT_INVALID_TAGS'
  ]);
  assert.equal(diagnostics.every((diagnostic) => diagnostic.location.line === 1), true);
});

test('reports English posts without an exact same-basename Chinese source', () => {
  const english = postFixture({
    file: 'source-en/_posts/2024-02-29-English-Orphan.md',
    side: 'en'
  });

  const diagnostics = validateTranslationStructure(buildInventory([english]));
  const orphan = diagnostics.find((diagnostic) => diagnostic.code === 'TRANS_EN_ORPHAN');

  assert.ok(orphan);
  assert.equal(orphan.severity, 'error');
  assert.equal(orphan.location.file, english.file);
});

test('requires every English post to own a boolean translated true declaration', () => {
  const falseValue = postFixture({
    file: 'source-en/_posts/2024-02-29-False.md',
    side: 'en',
    fields: { translated: false }
  });
  const inheritedValue = postFixture({
    file: 'source-en/_posts/2024-02-29-Inherited.md',
    side: 'en',
    fields: { translated: OMIT }
  });
  Object.setPrototypeOf(inheritedValue.data, { translated: true });

  const diagnostics = validateTranslationStructure(buildInventory([falseValue, inheritedValue]));
  const required = diagnosticsWithCode(diagnostics, 'TRANS_EN_TRANSLATED_REQUIRED');

  assert.deepEqual(required.map((diagnostic) => diagnostic.location.file), [
    falseValue.file,
    inheritedValue.file
  ]);
  assert.equal(required.every((diagnostic) => diagnostic.severity === 'error'), true);
});

test('requires translated claims to have an exact reciprocal true counterpart', () => {
  const missingEnglish = postFixture({
    file: 'source/_posts/2024-02-29-Missing-English.md',
    side: 'zh',
    fields: { translated: true }
  });
  const chinese = postFixture({
    file: 'source/_posts/2024-02-29-Not-Reciprocal.md',
    side: 'zh',
    fields: { translated: true }
  });
  const englishFalse = postFixture({
    file: 'source-en/_posts/2024-02-29-Not-Reciprocal.md',
    side: 'en',
    fields: { translated: false }
  });

  const diagnostics = validateTranslationStructure(buildInventory([
    missingEnglish,
    chinese,
    englishFalse
  ]));
  const reciprocal = diagnosticsWithCode(diagnostics, 'TRANS_RECIPROCAL_MISSING');

  assert.equal(reciprocal.length, 2);
  assert.equal(reciprocal.every((diagnostic) => diagnostic.severity === 'error'), true);
  assert.equal(reciprocal.some((diagnostic) => diagnostic.location.file === missingEnglish.file), true);
  assert.equal(reciprocal.some((diagnostic) => diagnostic.location.file === chinese.file), true);
});

test('translation pairing is based on the exact Markdown basename', () => {
  const chinese = postFixture({
    file: 'source/_posts/2024-02-29-Exact-Case.md',
    side: 'zh',
    fields: { translated: true }
  });
  const english = postFixture({
    file: 'source-en/_posts/2024-02-29-exact-case.md',
    side: 'en',
    fields: { translated: true }
  });

  const diagnostics = validateTranslationStructure(buildInventory([chinese, english]));

  assert.equal(diagnosticsWithCode(diagnostics, 'TRANS_EN_ORPHAN').length, 1);
  assert.equal(diagnosticsWithCode(diagnostics, 'TRANS_RECIPROCAL_MISSING').length, 2);
});

test('warns, but never errors, for a newly added Chinese-only post', () => {
  const chinese = postFixture({
    file: 'source/_posts/2024-02-29-New-Chinese.md',
    side: 'zh',
    fields: { translated: false }
  });
  const diagnostics = validateTranslationDiff(buildInventory([chinese]), [
    { status: 'A', path: chinese.file }
  ]);

  assert.deepEqual(diagnostics.map(({ severity, code }) => ({ severity, code })), [
    { severity: 'warning', code: 'TRANS_NEW_ZH_UNPAIRED' }
  ]);
  assert.equal(diagnostics.some((diagnostic) => diagnostic.severity === 'error'), false);
});

test('warns when a changed translated Chinese source lacks its English peer in the explicit diff', () => {
  for (const status of ['A', 'M', 'R100']) {
    const key = `2024-02-29-Changed-${status}.md`;
    const chinese = postFixture({
      file: `source/_posts/${key}`,
      side: 'zh',
      fields: { translated: true }
    });
    const english = postFixture({
      file: `source-en/_posts/${key}`,
      side: 'en',
      fields: { translated: true }
    });
    const change = status.startsWith('R')
      ? { status, oldPath: 'source/_posts/2020-01-01-Old.md', path: chinese.file }
      : { status, path: chinese.file };

    const diagnostics = validateTranslationDiff(buildInventory([chinese, english]), [change]);

    assert.equal(
      diagnosticsWithCode(diagnostics, 'TRANS_SOURCE_CHANGED_ONLY').length,
      1,
      `status ${status}`
    );
    assert.equal(diagnostics[0].severity, 'warning');
  }
});

test('suppresses changed-source reminders only for the same-key English path in the diff', () => {
  const key = '2024-02-29-Renamed.md';
  const chinese = postFixture({
    file: `source/_posts/${key}`,
    side: 'zh',
    fields: { translated: true }
  });
  const english = postFixture({
    file: `source-en/_posts/${key}`,
    side: 'en',
    fields: { translated: true }
  });
  const inventory = buildInventory([chinese, english]);
  const renamedChinese = {
    status: 'R100',
    oldPath: 'source/_posts/2024-02-29-Old-Key.md',
    path: chinese.file
  };

  assert.equal(validateTranslationDiff(inventory, [
    renamedChinese,
    { status: 'M', path: english.file }
  ]).length, 0);
  assert.equal(diagnosticsWithCode(validateTranslationDiff(inventory, [
    renamedChinese,
    { status: 'M', path: 'source-en/_posts/2024-02-29-Old-Key.md' }
  ]), 'TRANS_SOURCE_CHANGED_ONLY').length, 1);
});

test('blocks distinct English taxonomy spellings that share a transformed route', () => {
  const first = postFixture({
    file: 'source-en/_posts/2024-02-29-Architecture-A.md',
    side: 'en',
    fields: { categories: 'Security Architecture', tags: 'Dev Ops' }
  });
  const repeated = postFixture({
    file: 'source-en/_posts/2024-03-01-Architecture-B.md',
    side: 'en',
    fields: { categories: 'Security Architecture', tags: 'Dev Ops' }
  });
  const conflicting = postFixture({
    file: 'source-en/_posts/2024-03-02-Architecture-C.md',
    side: 'en',
    fields: { categories: 'security architecture', tags: 'dev ops' }
  });

  const diagnostics = validateTaxonomyCollisions(buildInventory([conflicting, repeated, first]));

  assert.equal(diagnosticsWithCode(diagnostics, 'CONTENT_TAXONOMY_COLLISION').length, 2);
  assert.equal(diagnostics.some((diagnostic) => diagnostic.message.includes('security-architecture')), true);
  assert.equal(diagnostics.some((diagnostic) => diagnostic.message.includes('dev-ops')), true);
  for (const value of ['Security Architecture', 'security architecture', first.file, conflicting.file]) {
    assert.equal(diagnostics[0].message.includes(value), true);
  }
  assert.deepEqual(diagnostics, sortDiagnostics(diagnostics));
  assert.deepEqual(
    validateTaxonomyCollisions(buildInventory([first, repeated, conflicting])),
    diagnostics
  );
});

test('does not treat identical repeated taxonomy spelling as a collision', () => {
  const posts = [1, 2].map((day) => postFixture({
    file: `source-en/_posts/2024-03-0${day}-Repeated-${day}.md`,
    side: 'en',
    fields: { categories: ['Security Architecture'], tags: ['Dev Ops'] }
  }));

  assert.deepEqual(validateTaxonomyCollisions(buildInventory(posts)), []);
});

test('blocks English post-route case collisions through the shared site policy', () => {
  const upper = postFixture({
    file: 'source-en/_posts/2024-02-29-Case-Route.md',
    side: 'en'
  });
  const lower = postFixture({
    file: 'source-en/_posts/2024-02-29-case-route.md',
    side: 'en'
  });
  assert.equal(postPath('en', upper.pairingKey), postPath('en', lower.pairingKey));

  const diagnostics = validateTaxonomyCollisions(buildInventory([upper, lower]));
  const collision = diagnostics.find((diagnostic) => diagnostic.code === 'CONTENT_POST_PATH_COLLISION');

  assert.ok(collision);
  assert.equal(collision.severity, 'error');
  assert.equal(collision.message.includes(upper.file), true);
  assert.equal(collision.message.includes(lower.file), true);
});

test('accepts exactly the tracked historical kerywords baseline as one aggregate warning', async () => {
  const inventory = await loadTrackedInventory(path.resolve(__dirname, '..'));
  const paths = legacyPathSet(inventory.posts);
  const actual = { count: paths.length, sha256: hashPaths(paths) };

  assert.deepEqual(actual, EXPECTED_KERYWORDS_BASELINE);
  const diagnostics = validateKerywordsBaseline(inventory.posts, EXPECTED_KERYWORDS_BASELINE);
  assert.deepEqual(diagnostics.map(({ severity, code }) => ({ severity, code })), [
    { severity: 'warning', code: 'CONTENT_KERYWORDS_BASELINE_MATCHED' }
  ]);
});

test('rejects any changed top-level kerywords tracked path set', async () => {
  const inventory = await loadTrackedInventory(path.resolve(__dirname, '..'));
  const firstLegacyFile = legacyPathSet(inventory.posts)[0];
  const changedPosts = inventory.posts.filter((post) => post.file !== firstLegacyFile);

  const diagnostics = validateKerywordsBaseline(changedPosts, EXPECTED_KERYWORDS_BASELINE);

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].severity, 'error');
  assert.equal(diagnostics[0].code, 'CONTENT_KERYWORDS_BASELINE_CHANGED');
});

test('validateContent composes hard rules, sorts results, and includes diff reminders only explicitly', () => {
  const invalidChinese = postFixture({
    file: 'source/_posts/2023-02-29-Composed.md',
    side: 'zh',
    fields: { layout: 'posts', translated: true, kerywords: 'legacy' }
  });
  const orphan = postFixture({
    file: 'source-en/_posts/2024-02-29-Orphan-Composed.md',
    side: 'en',
    fields: { categories: 'Security Architecture' }
  });
  const taxonomyConflict = postFixture({
    file: 'source-en/_posts/2024-03-01-Orphan-Composed.md',
    side: 'en',
    fields: { categories: 'security architecture' }
  });
  const inventory = buildInventory([invalidChinese, orphan, taxonomyConflict]);
  const options = {
    kerywordsBaseline: { count: 0, sha256: hashPaths([]) }
  };

  const diagnostics = validateContent(inventory, options);
  const codes = new Set(diagnostics.map((diagnostic) => diagnostic.code));

  for (const code of [
    'CONTENT_INVALID_LAYOUT',
    'CONTENT_INVALID_DATE',
    'TRANS_EN_ORPHAN',
    'TRANS_RECIPROCAL_MISSING',
    'CONTENT_TAXONOMY_COLLISION',
    'CONTENT_KERYWORDS_BASELINE_CHANGED'
  ]) {
    assert.equal(codes.has(code), true, code);
  }
  assert.deepEqual(diagnostics, sortDiagnostics(diagnostics));
  assert.equal(codes.has('TRANS_SOURCE_CHANGED_ONLY'), false);

  const withDiff = validateContent(inventory, {
    ...options,
    changes: [{ status: 'M', path: invalidChinese.file }]
  });
  assert.equal(
    withDiff.some((diagnostic) => diagnostic.code === 'TRANS_SOURCE_CHANGED_ONLY'),
    true
  );
});
