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
