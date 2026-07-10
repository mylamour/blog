'use strict';

const path = require('node:path');
const { slugize } = require('hexo-util');

const SITES = Object.freeze({
  zh: Object.freeze({ id: 'zh', origin: 'https://fz.cool', language: 'zh-CN', locale: 'zh_CN' }),
  en: Object.freeze({ id: 'en', origin: 'https://iami.xyz', language: 'en', locale: 'en_US' })
});

const EQUIVALENT_PATHS = new Set([
  '/', '/blog/', '/about/', '/search/', '/category/', '/tag/', '/project/'
]);

function siteFor(siteId) {
  if (!Object.prototype.hasOwnProperty.call(SITES, siteId)) {
    throw new TypeError(`Unknown site: ${siteId}`);
  }
  return SITES[siteId];
}

function pairingKeyFromSourcePath(sourcePath) {
  return path.basename(String(sourcePath || ''));
}

function slugFromPairingKey(pairingKey, transform) {
  const raw = pairingKeyFromSourcePath(pairingKey)
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return slugize(raw, { transform });
}

function postPath(siteId, pairingKey) {
  const site = siteFor(siteId);
  const transform = site.id === 'en' ? 1 : 0;
  return encodeURI(`/${slugFromPairingKey(pairingKey, transform)}/`);
}

function normalizePagePath(value) {
  let pathname = String(value || '').split(/[?#]/, 1)[0].replace(/^\/+/, '');
  pathname = pathname.replace(/(^|\/)index\.html$/i, '');
  if (!pathname) return '/';
  return `/${pathname.replace(/\/+$/, '')}/`;
}

function canonicalUrl(siteId, publicPath) {
  return new URL(normalizePagePath(publicPath), `${siteFor(siteId).origin}/`).href;
}

function resolveBilingualUrls(input) {
  const site = siteFor(input.siteId);
  const alternateSite = siteFor(input.siteId === 'en' ? 'zh' : 'en');
  const canonical = String(input.canonicalUrl).replace(/\/index\.html$/, '/');
  const publicPath = normalizePagePath(input.pagePath);
  let alternatePath = null;

  if (input.layout === 'post' && input.translated === true) {
    alternatePath = postPath(alternateSite.id, pairingKeyFromSourcePath(input.source));
  } else if (EQUIVALENT_PATHS.has(publicPath)) {
    alternatePath = publicPath;
  }

  const alternateUrl = alternatePath
    ? new URL(alternatePath, `${alternateSite.origin}/`).href
    : null;

  return {
    canonicalUrl: canonical,
    language: site.language,
    locale: site.locale,
    alternateUrl,
    alternateLanguage: alternateUrl ? alternateSite.language : null,
    alternateLocale: alternateUrl ? alternateSite.locale : null,
    xDefaultUrl: alternateUrl ? (site.id === 'en' ? canonical : alternateUrl) : null
  };
}

function findPathCollisions(entries, siteId) {
  const site = siteFor(siteId);
  const groups = new Map();
  for (const entry of entries) {
    const key = site.id === 'en' ? entry.path.toLowerCase() : entry.path;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry.id);
  }
  return [...groups.entries()]
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([key, ids]) => ({ key, ids: [...new Set(ids)].sort() }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

module.exports = {
  SITES,
  EQUIVALENT_PATHS,
  siteFor,
  pairingKeyFromSourcePath,
  slugFromPairingKey,
  postPath,
  normalizePagePath,
  canonicalUrl,
  resolveBilingualUrls,
  findPathCollisions
};
