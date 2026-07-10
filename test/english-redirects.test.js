'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  buildEnglishRedirects,
  parseNetlifyRedirects,
  validateEnglishRedirects
} = require('../lib/english-redirects');
const { loadTrackedInventory, listTrackedPostPaths } = require('../lib/content-inventory');
const { SITES, postPath } = require('../lib/site-policy');
const { register } = require('../scripts/english-redirects');

const translatedKey = '2025-04-05-Deep-Dive-Into-Clearing-Network.md';
const asciiKey = '2016-02-02-Jekyll-and-Markdown.md';
const unicodeKey = '2018-02-13-ELK小记.md';

function post(side, key) {
  return {
    side,
    pairingKey: key,
    file: `${side === 'zh' ? 'source' : 'source-en'}/_posts/${key}`
  };
}

function inventoryFor({ zh = [], en = [] } = {}) {
  return {
    zhByKey: new Map(zh.map((key) => [key, post('zh', key)])),
    enByKey: new Map(en.map((key) => [key, post('en', key)]))
  };
}

function exactFixtureInventory() {
  return inventoryFor({
    zh: [unicodeKey, translatedKey, asciiKey],
    en: [translatedKey]
  });
}

function articleRule(key) {
  return {
    source: postPath('en', key),
    target: `${SITES.zh.origin}${postPath('zh', key)}`,
    status: 301
  };
}

function exactFixtureRules() {
  return [articleRule(asciiKey), articleRule(unicodeKey), {
    source: '/*',
    target: '/404.html',
    status: 404
  }];
}

test('builds deterministic explicit redirects only for Chinese-only posts', () => {
  const inventory = exactFixtureInventory();
  const text = buildEnglishRedirects(inventory);

  assert.equal(text, [
    `${postPath('en', asciiKey)} ${SITES.zh.origin}${postPath('zh', asciiKey)} 301`,
    `${postPath('en', unicodeKey)} ${SITES.zh.origin}${postPath('zh', unicodeKey)} 301`,
    '/* /404.html 404',
    ''
  ].join('\n'));
  assert.equal(text.includes(postPath('en', translatedKey)), false);
  assert.equal(text.endsWith('\n'), true);
  assert.equal(text.endsWith('\n\n'), false);
  assert.equal(text.split('\n').at(-2), '/* /404.html 404');
});

test('rejects Chinese-only keys whose normalized English sources collide', () => {
  const first = '2024-01-01-Case-Collision.md';
  const second = '2024-01-02-case-collision.md';
  assert.throws(
    () => buildEnglishRedirects(inventoryFor({ zh: [first, second] })),
    (error) => {
      assert.match(error.message, /duplicate|collision/i);
      assert.match(error.message, new RegExp(first));
      assert.match(error.message, new RegExp(second));
      return true;
    }
  );
});

test('parses generated Netlify rules into deterministic records', () => {
  const generated = buildEnglishRedirects(exactFixtureInventory());
  assert.deepEqual(parseNetlifyRedirects(generated), exactFixtureRules());
  assert.deepEqual(
    parseNetlifyRedirects(`# generated\n\n${generated}`),
    exactFixtureRules()
  );
});

test('accepts exactly generated redirects', () => {
  const inventory = exactFixtureInventory();
  const rules = parseNetlifyRedirects(buildEnglishRedirects(inventory));
  assert.doesNotThrow(() => validateEnglishRedirects({ rules, inventory }));
});

test('rejects duplicate normalized redirect sources', () => {
  const inventory = exactFixtureInventory();
  const rules = exactFixtureRules();
  rules.splice(1, 0, { ...rules[0], source: rules[0].source.toUpperCase() });

  assert.throws(
    () => validateEnglishRedirects({ rules, inventory }),
    /duplicate.*source|source.*duplicate/i
  );
});

test('rejects a fallback for a post backed by English content', () => {
  const inventory = exactFixtureInventory();
  const rules = exactFixtureRules();
  rules.splice(2, 0, articleRule(translatedKey));

  assert.throws(
    () => validateEnglishRedirects({ rules, inventory }),
    /English-backed|translated/i
  );
});

test('rejects missing and extra Chinese-only fallbacks', () => {
  const inventory = exactFixtureInventory();
  assert.throws(
    () => validateEnglishRedirects({ rules: [exactFixtureRules()[0], exactFixtureRules()[2]], inventory }),
    /missing/i
  );

  const rules = exactFixtureRules();
  rules.splice(2, 0, articleRule('2020-01-01-Not-In-Inventory.md'));
  assert.throws(
    () => validateEnglishRedirects({ rules, inventory }),
    /extra|unexpected/i
  );
});

test('rejects wrong redirect targets, statuses, and ordering', () => {
  const inventory = exactFixtureInventory();
  const wrongTarget = exactFixtureRules();
  wrongTarget[0] = { ...wrongTarget[0], target: `${SITES.zh.origin}/wrong/` };
  assert.throws(
    () => validateEnglishRedirects({ rules: wrongTarget, inventory }),
    /target/i
  );

  const wrongStatus = exactFixtureRules();
  wrongStatus[0] = { ...wrongStatus[0], status: 302 };
  assert.throws(
    () => validateEnglishRedirects({ rules: wrongStatus, inventory }),
    /status/i
  );

  const wrongOrder = exactFixtureRules();
  [wrongOrder[0], wrongOrder[1]] = [wrongOrder[1], wrongOrder[0]];
  assert.throws(
    () => validateEnglishRedirects({ rules: wrongOrder, inventory }),
    /order/i
  );
});

test('requires the exact final English 404 rule', () => {
  const inventory = exactFixtureInventory();
  assert.throws(
    () => validateEnglishRedirects({ rules: exactFixtureRules().slice(0, -1), inventory }),
    /404|final/i
  );

  const misplaced = exactFixtureRules();
  misplaced.unshift(misplaced.pop());
  assert.throws(
    () => validateEnglishRedirects({ rules: misplaced, inventory }),
    /404|final/i
  );
});

test('rejects every cross-domain wildcard, including the former splat rule', () => {
  const inventory = exactFixtureInventory();
  for (const wildcard of [
    { source: '/*', target: 'https://fz.cool/:splat', status: 301 },
    { source: '/blog/*', target: 'https://fz.cool/:splat', status: 301 }
  ]) {
    const rules = exactFixtureRules();
    rules.splice(-1, 0, wildcard);
    assert.throws(
      () => validateEnglishRedirects({ rules, inventory }),
      /cross-domain wildcard/i
    );
  }
});

test('tracked repository inventory generates 64 article fallbacks and one 404', async () => {
  const inventory = await loadTrackedInventory(process.cwd());
  const trackedPaths = await listTrackedPostPaths(process.cwd());
  const rules = parseNetlifyRedirects(buildEnglishRedirects(inventory));

  assert.equal(rules.length, 65);
  assert.equal(rules.filter((rule) => rule.status === 301).length, 64);
  assert.deepEqual([...inventory.byFile.keys()], trackedPaths);
  assert.equal(
    [...inventory.byFile.keys()].some((file) => !trackedPaths.includes(file)),
    false,
    'protected untracked drafts must not enter the redirect inventory'
  );
  assert.doesNotThrow(() => validateEnglishRedirects({ rules, inventory }));
});

test('generator skips Chinese and emits exact tracked redirects for English', async () => {
  async function registeredGenerator(language, baseDir) {
    let registration;
    const mockHexo = {
      config: { language },
      base_dir: baseDir,
      extend: {
        generator: {
          register(name, implementation) {
            registration = { name, implementation };
          }
        }
      }
    };
    register(mockHexo);
    assert.equal(registration.name, 'english_redirects');
    return registration.implementation;
  }

  const skipped = await registeredGenerator('zh-CN', '/definitely/not/a/git/repository');
  assert.deepEqual(await skipped(), []);

  const repoRoot = path.resolve(__dirname, '..');
  const generate = await registeredGenerator('en', repoRoot);
  const inventory = await loadTrackedInventory(repoRoot);
  assert.deepEqual(await generate(), {
    path: '_redirects',
    data: buildEnglishRedirects(inventory)
  });
});
