'use strict';

const path = require('node:path');
const { createHash } = require('node:crypto');
const { slugize } = require('hexo-util');
const { createDiagnostic, sortDiagnostics } = require('./diagnostics');
const {
  pairingKeyFromSourcePath,
  postPath,
  findPathCollisions
} = require('./site-policy');

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function hasOwn(object, key) {
  return object !== null
    && typeof object === 'object'
    && Object.prototype.hasOwnProperty.call(object, key);
}

function postsFrom(input) {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.posts)) return input.posts;
  return [];
}

function sortedPosts(input) {
  return [...postsFrom(input)].sort((left, right) => compareText(left.file, right.file));
}

function locationFor(post, key, fallbackLine = 1) {
  const line = post
    && post.keyLines instanceof Map
    && post.keyLines.get(key);
  return {
    file: post && post.file ? post.file : '<unknown>',
    line: line || fallbackLine,
    column: 1
  };
}

function diagnosticFor(post, key, severity, code, message, fallbackLine = 1) {
  return createDiagnostic(
    severity,
    code,
    message,
    locationFor(post, key, fallbackLine)
  );
}

function taxonomyValues(value) {
  if (Array.isArray(value)) return value.flatMap(taxonomyValues);
  if (typeof value === 'string' && value.trim().length > 0) return [value];
  return [];
}

function validatePostSchema(posts) {
  const diagnostics = [];

  for (const post of sortedPosts(posts)) {
    const data = post && post.data;
    const validLayout = hasOwn(data, 'layout') && data.layout === 'post';
    const validTitle = hasOwn(data, 'title')
      && typeof data.title === 'string'
      && data.title.trim().length > 0;
    const validCategories = hasOwn(data, 'categories')
      && taxonomyValues(data.categories).length > 0;
    const validTags = hasOwn(data, 'tags')
      && taxonomyValues(data.tags).length > 0;

    if (!validLayout) {
      diagnostics.push(diagnosticFor(
        post,
        'layout',
        'error',
        'CONTENT_INVALID_LAYOUT',
        'Front matter "layout" must be exactly "post".'
      ));
    }
    if (!validTitle) {
      diagnostics.push(diagnosticFor(
        post,
        'title',
        'error',
        'CONTENT_INVALID_TITLE',
        'Front matter "title" must be a non-empty string.'
      ));
    }
    if (!validCategories) {
      diagnostics.push(diagnosticFor(
        post,
        'categories',
        'error',
        'CONTENT_INVALID_CATEGORIES',
        'Front matter "categories" must contain at least one non-empty text value.'
      ));
    }
    if (!validTags) {
      diagnostics.push(diagnosticFor(
        post,
        'tags',
        'error',
        'CONTENT_INVALID_TAGS',
        'Front matter "tags" must contain at least one non-empty text value.'
      ));
    }
  }

  return diagnostics;
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isCalendarDate(year, month, day) {
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];
  return day <= daysInMonth[month - 1];
}

function validateFilenameDates(posts) {
  const diagnostics = [];

  for (const post of sortedPosts(posts)) {
    const basename = path.basename(String(post.file || ''));
    const match = /^(\d{4})-(\d{2})-(\d{2})-.+\.md$/.exec(basename);
    const valid = match && isCalendarDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );
    if (!valid) {
      diagnostics.push(createDiagnostic(
        'error',
        'CONTENT_INVALID_DATE',
        `Post filename "${basename}" must start with a valid calendar date in YYYY-MM-DD- form.`,
        locationFor(post, null)
      ));
    }
  }

  return diagnostics;
}

function declaresTranslated(post) {
  return Boolean(post)
    && hasOwn(post.data, 'translated')
    && post.data.translated === true;
}

function inventoryMaps(inventory) {
  const posts = sortedPosts(inventory);
  const zhByKey = inventory && inventory.zhByKey instanceof Map
    ? inventory.zhByKey
    : new Map(posts.filter((post) => post.side === 'zh').map((post) => [post.pairingKey, post]));
  const enByKey = inventory && inventory.enByKey instanceof Map
    ? inventory.enByKey
    : new Map(posts.filter((post) => post.side === 'en').map((post) => [post.pairingKey, post]));
  return { posts, zhByKey, enByKey };
}

function validateTranslationStructure(inventory) {
  const diagnostics = [];
  const { zhByKey, enByKey } = inventoryMaps(inventory);
  const englishPosts = [...enByKey.values()]
    .sort((left, right) => compareText(left.file, right.file));

  for (const english of englishPosts) {
    if (!zhByKey.has(english.pairingKey)) {
      diagnostics.push(createDiagnostic(
        'error',
        'TRANS_EN_ORPHAN',
        `English post "${english.file}" has no exact same-basename Chinese source.`,
        locationFor(english, null)
      ));
    }
    if (!declaresTranslated(english)) {
      diagnostics.push(diagnosticFor(
        english,
        'translated',
        'error',
        'TRANS_EN_TRANSLATED_REQUIRED',
        'Every English post must declare front matter "translated: true".'
      ));
    }
  }

  const keys = [...new Set([...zhByKey.keys(), ...enByKey.keys()])].sort(compareText);
  for (const key of keys) {
    const chinese = zhByKey.get(key);
    const english = enByKey.get(key);
    const chineseTranslated = declaresTranslated(chinese);
    const englishTranslated = declaresTranslated(english);
    if (!(chineseTranslated || englishTranslated)) continue;
    if (chineseTranslated && englishTranslated) continue;

    const claimant = chineseTranslated ? chinese : english;
    const expectedFile = claimant.side === 'zh'
      ? `source-en/_posts/${key}`
      : `source/_posts/${key}`;
    diagnostics.push(diagnosticFor(
      claimant,
      'translated',
      'error',
      'TRANS_RECIPROCAL_MISSING',
      `Translated post "${claimant.file}" requires reciprocal "translated: true" in "${expectedFile}".`
    ));
  }

  return diagnostics;
}

function statusLetter(change) {
  return String(change && change.status || '').slice(0, 1).toUpperCase();
}

function isPathOnSide(file, side) {
  const prefix = side === 'en' ? 'source-en/_posts/' : 'source/_posts/';
  return typeof file === 'string' && file.startsWith(prefix) && file.endsWith('.md');
}

function validateTranslationDiff(inventory, changes) {
  const diagnostics = [];
  const { zhByKey, enByKey } = inventoryMaps(inventory);
  const normalizedChanges = Array.isArray(changes) ? changes : [];
  const changedEnglishKeys = new Set(normalizedChanges
    .filter((change) => isPathOnSide(change.path, 'en'))
    .map((change) => pairingKeyFromSourcePath(change.path)));
  const emitted = new Set();

  for (const change of normalizedChanges) {
    const status = statusLetter(change);
    if (!['A', 'M', 'R'].includes(status) || !isPathOnSide(change.path, 'zh')) continue;

    const key = pairingKeyFromSourcePath(change.path);
    const chinese = zhByKey.get(key);
    if (!chinese) continue;

    if (status === 'A' && !enByKey.has(key)) {
      const identity = `TRANS_NEW_ZH_UNPAIRED\0${key}`;
      if (!emitted.has(identity)) {
        diagnostics.push(createDiagnostic(
          'warning',
          'TRANS_NEW_ZH_UNPAIRED',
          `New Chinese post "${chinese.file}" has no English counterpart yet.`,
          locationFor(chinese, null)
        ));
        emitted.add(identity);
      }
    }

    if (declaresTranslated(chinese) && !changedEnglishKeys.has(key)) {
      const identity = `TRANS_SOURCE_CHANGED_ONLY\0${key}`;
      if (!emitted.has(identity)) {
        diagnostics.push(diagnosticFor(
          chinese,
          'translated',
          'warning',
          'TRANS_SOURCE_CHANGED_ONLY',
          `Translated Chinese source "${chinese.file}" changed without its same-basename English peer in this diff.`
        ));
        emitted.add(identity);
      }
    }
  }

  return sortDiagnostics(diagnostics);
}

function validateTaxonomyCollisions(inventory) {
  const diagnostics = [];
  const { enByKey } = inventoryMaps(inventory);
  const englishPosts = [...enByKey.values()]
    .sort((left, right) => compareText(left.file, right.file));
  const groups = new Map();

  for (const post of englishPosts) {
    for (const field of ['categories', 'tags']) {
      if (!hasOwn(post.data, field)) continue;
      for (const rawValue of taxonomyValues(post.data[field])) {
        const routeKey = slugize(rawValue, { transform: 1 });
        const groupKey = `${field}\0${routeKey}`;
        if (!groups.has(groupKey)) {
          groups.set(groupKey, { field, routeKey, values: new Map() });
        }
        const group = groups.get(groupKey);
        if (!group.values.has(rawValue)) group.values.set(rawValue, new Set());
        group.values.get(rawValue).add(post.file);
      }
    }
  }

  const collisions = [...groups.values()]
    .filter((group) => group.values.size > 1)
    .sort((left, right) => compareText(left.field, right.field)
      || compareText(left.routeKey, right.routeKey));
  const byFile = new Map(englishPosts.map((post) => [post.file, post]));

  for (const collision of collisions) {
    const values = [...collision.values.entries()]
      .map(([value, files]) => ({ value, files: [...files].sort(compareText) }))
      .sort((left, right) => compareText(left.value, right.value));
    const files = values.flatMap((entry) => entry.files).sort(compareText);
    const firstPost = byFile.get(files[0]);
    const details = values
      .map((entry) => `${JSON.stringify(entry.value)} in ${entry.files.map((file) => JSON.stringify(file)).join(', ')}`)
      .join('; ');
    diagnostics.push(diagnosticFor(
      firstPost,
      collision.field,
      'error',
      'CONTENT_TAXONOMY_COLLISION',
      `English ${collision.field} route key "${collision.routeKey}" has distinct raw values: ${details}.`
    ));
  }

  const routeEntries = englishPosts.map((post) => ({
    id: post.file,
    path: postPath('en', post.pairingKey)
  }));
  for (const collision of findPathCollisions(routeEntries, 'en')) {
    const firstPost = byFile.get(collision.ids[0]);
    diagnostics.push(createDiagnostic(
      'error',
      'CONTENT_POST_PATH_COLLISION',
      `English post route "${collision.key}" is shared by ${collision.ids.map((file) => JSON.stringify(file)).join(', ')}.`,
      locationFor(firstPost, null)
    ));
  }

  return sortDiagnostics(diagnostics);
}

function validateKerywordsBaseline(posts, baseline) {
  const sorted = sortedPosts(posts);
  const paths = sorted
    .filter((post) => post.keyLines instanceof Map && post.keyLines.has('kerywords'))
    .map((post) => post.file)
    .sort(compareText);
  const actual = {
    count: paths.length,
    sha256: createHash('sha256').update(`${paths.join('\n')}\n`).digest('hex')
  };
  const expectedCount = hasOwn(baseline, 'count') ? baseline.count : null;
  const expectedSha = hasOwn(baseline, 'sha256') ? baseline.sha256 : null;
  const matches = Number.isInteger(expectedCount)
    && typeof expectedSha === 'string'
    && actual.count === expectedCount
    && actual.sha256 === expectedSha;

  if (!matches) {
    const firstPost = paths.length > 0
      ? sorted.find((post) => post.file === paths[0])
      : null;
    return [createDiagnostic(
      'error',
      'CONTENT_KERYWORDS_BASELINE_CHANGED',
      `Tracked top-level "kerywords" paths changed: expected count ${String(expectedCount)} and SHA-256 ${String(expectedSha)}, got count ${actual.count} and SHA-256 ${actual.sha256}.`,
      firstPost
        ? locationFor(firstPost, 'kerywords')
        : { file: 'config/content-baseline.json', line: 1, column: 1 }
    )];
  }

  if (actual.count === 0) return [];
  const firstPost = sorted.find((post) => post.file === paths[0]);
  return [createDiagnostic(
    'warning',
    'CONTENT_KERYWORDS_BASELINE_MATCHED',
    `${actual.count} tracked posts retain the approved historical top-level "kerywords" spelling.`,
    locationFor(firstPost, 'kerywords')
  )];
}

function baselineFromOptions(options) {
  if (hasOwn(options, 'kerywordsBaseline')) return options.kerywordsBaseline;
  if (hasOwn(options, 'baseline')) {
    return hasOwn(options.baseline, 'kerywords')
      ? options.baseline.kerywords
      : options.baseline;
  }
  return undefined;
}

/**
 * Run all repository-wide content rules.
 *
 * options.kerywordsBaseline supplies the tracked legacy-path count/hash.
 * options.changes explicitly opts into advisory translation diff reminders.
 */
function validateContent(inventory, options = {}) {
  const posts = postsFrom(inventory);
  const diagnostics = [
    ...validatePostSchema(posts),
    ...validateFilenameDates(posts),
    ...validateTranslationStructure(inventory),
    ...validateTaxonomyCollisions(inventory),
    ...validateKerywordsBaseline(posts, baselineFromOptions(options))
  ];

  if (hasOwn(options, 'changes')) {
    diagnostics.push(...validateTranslationDiff(inventory, options.changes));
  }

  return sortDiagnostics(diagnostics);
}

module.exports = {
  validatePostSchema,
  validateFilenameDates,
  validateTranslationStructure,
  validateTranslationDiff,
  validateTaxonomyCollisions,
  validateKerywordsBaseline,
  validateContent
};
