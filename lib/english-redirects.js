'use strict';

const { SITES, postPath } = require('./site-policy');

const FINAL_404_RULE = Object.freeze({
  source: '/*',
  target: '/404.html',
  status: 404
});

function compareCodeUnits(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function normalizeRedirectSource(source) {
  return String(source).toLowerCase();
}

function chineseOnlyKeys(inventory) {
  return [...inventory.zhByKey.keys()]
    .filter((key) => !inventory.enByKey.has(key))
    .sort(compareCodeUnits);
}

function articleRule(key) {
  return {
    key,
    source: postPath('en', key),
    target: `${SITES.zh.origin}${postPath('zh', key)}`,
    status: 301
  };
}

function expectedArticleRules(inventory) {
  return chineseOnlyKeys(inventory).map(articleRule);
}

function assertUniqueExpectedSources(rules) {
  const bySource = new Map();
  for (const rule of rules) {
    const normalized = normalizeRedirectSource(rule.source);
    const conflict = bySource.get(normalized);
    if (conflict) {
      throw new Error(
        `Duplicate normalized English redirect source "${rule.source}": `
        + `pairing key "${conflict.key}" conflicts with "${rule.key}"`
      );
    }
    bySource.set(normalized, rule);
  }
}

function buildEnglishRedirects(inventory) {
  const rules = expectedArticleRules(inventory);
  assertUniqueExpectedSources(rules);
  return [
    ...rules.map((rule) => `${rule.source} ${rule.target} ${rule.status}`),
    `${FINAL_404_RULE.source} ${FINAL_404_RULE.target} ${FINAL_404_RULE.status}`
  ].join('\n') + '\n';
}

function parseNetlifyRedirects(text) {
  const rules = [];
  const lines = String(text == null ? '' : text).replace(/^\uFEFF/, '').split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith('#')) continue;
    const fields = line.split(/\s+/);
    if (fields.length !== 3 || !/^\d+$/.test(fields[2])) {
      throw new Error(`Malformed Netlify redirect rule on line ${index + 1}: ${lines[index]}`);
    }
    rules.push({
      source: fields[0],
      target: fields[1],
      status: Number(fields[2])
    });
  }

  return rules;
}

function describeRule(rule) {
  return `${rule.source} ${rule.target} ${rule.status}`;
}

function validateEnglishRedirects({ rules, inventory }) {
  if (!Array.isArray(rules)) throw new TypeError('English redirect rules must be an array');

  for (const rule of rules) {
    if (
      !rule
      || typeof rule.source !== 'string'
      || !rule.source
      || typeof rule.target !== 'string'
      || !rule.target
      || !Number.isInteger(rule.status)
    ) {
      throw new Error(`Malformed English redirect rule: ${JSON.stringify(rule)}`);
    }
    if (rule.source.includes('*') && /^https?:\/\//i.test(rule.target)) {
      throw new Error(`Cross-domain wildcard redirect is forbidden: ${describeRule(rule)}`);
    }
  }

  const sources = new Map();
  for (const rule of rules) {
    const normalized = normalizeRedirectSource(rule.source);
    const conflict = sources.get(normalized);
    if (conflict) {
      throw new Error(
        `Duplicate normalized redirect source "${normalized}": `
        + `"${describeRule(conflict)}" conflicts with "${describeRule(rule)}"`
      );
    }
    sources.set(normalized, rule);
  }

  const finalRule = rules.at(-1);
  if (
    !finalRule
    || finalRule.source !== FINAL_404_RULE.source
    || finalRule.target !== FINAL_404_RULE.target
    || finalRule.status !== FINAL_404_RULE.status
  ) {
    throw new Error('The final English redirect must be exactly "/* /404.html 404"');
  }

  const actual = rules.slice(0, -1);
  const expected = expectedArticleRules(inventory);
  assertUniqueExpectedSources(expected);
  const expectedBySource = new Map(
    expected.map((rule) => [normalizeRedirectSource(rule.source), rule])
  );
  const englishBySource = new Map();
  for (const key of inventory.enByKey.keys()) {
    const source = postPath('en', key);
    const normalized = normalizeRedirectSource(source);
    if (!englishBySource.has(normalized)) englishBySource.set(normalized, []);
    englishBySource.get(normalized).push(key);
  }

  const matched = new Set();
  for (const rule of actual) {
    const normalized = normalizeRedirectSource(rule.source);
    const englishKeys = englishBySource.get(normalized);
    if (englishKeys) {
      throw new Error(
        `Redirect fallback targets an English-backed or translated pairing key: `
        + `${englishKeys.map((key) => `"${key}"`).join(', ')} via "${rule.source}"`
      );
    }

    const expectedRule = expectedBySource.get(normalized);
    if (!expectedRule) {
      throw new Error(`Unexpected extra Chinese-only fallback: ${describeRule(rule)}`);
    }
    if (rule.source !== expectedRule.source) {
      throw new Error(
        `Wrong redirect source for pairing key "${expectedRule.key}": `
        + `expected "${expectedRule.source}", received "${rule.source}"`
      );
    }
    if (rule.target !== expectedRule.target) {
      throw new Error(
        `Wrong redirect target for pairing key "${expectedRule.key}": `
        + `expected "${expectedRule.target}", received "${rule.target}"`
      );
    }
    if (rule.status !== expectedRule.status) {
      throw new Error(
        `Wrong redirect status for pairing key "${expectedRule.key}": `
        + `expected ${expectedRule.status}, received ${rule.status}`
      );
    }
    matched.add(normalized);
  }

  const missing = expected.filter(
    (rule) => !matched.has(normalizeRedirectSource(rule.source))
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing Chinese-only fallback${missing.length === 1 ? '' : 's'}: `
      + missing.map((rule) => `"${rule.key}"`).join(', ')
    );
  }

  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index].source !== expected[index].source) {
      throw new Error(
        `English redirect order is not deterministic at rule ${index + 1}: `
        + `expected "${expected[index].source}", received "${actual[index].source}"`
      );
    }
  }
}

module.exports = {
  buildEnglishRedirects,
  parseNetlifyRedirects,
  validateEnglishRedirects
};
