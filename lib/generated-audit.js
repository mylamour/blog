'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { createDiagnostic, sortDiagnostics } = require('./diagnostics');
const {
  SITES,
  EQUIVALENT_PATHS,
  postPath,
  resolveBilingualUrls,
  siteFor
} = require('./site-policy');
const { parseNetlifyRedirects, validateEnglishRedirects } = require('./english-redirects');

const DOUBLE_ENCODED_OCTET = /%25[0-9A-Fa-f]{2}/;
const SKIPPED_PROTOCOL = /^(?:mailto|tel|data|javascript):/i;

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function routeForOutputFile(relativeFile) {
  const normalized = String(relativeFile == null ? '' : relativeFile)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');
  if (!normalized || normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    return `/${normalized.slice(0, -'index.html'.length)}`;
  }
  return `/${normalized}`;
}

async function buildRouteIndex(publicDir) {
  const root = path.resolve(publicDir);
  let stats;
  try {
    stats = await fs.stat(root);
  } catch (cause) {
    const error = new Error(`Unable to inspect generated directory ${root}: ${cause.message}`);
    error.cause = cause;
    throw error;
  }
  if (!stats.isDirectory()) throw new Error(`Generated path is not a directory: ${root}`);

  const files = [];
  async function visit(directory, prefix) {
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (cause) {
      const error = new Error(`Unable to read generated directory ${directory}: ${cause.message}`);
      error.cause = cause;
      throw error;
    }
    entries.sort((left, right) => compareText(left.name, right.name));
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute, relative);
      } else if (entry.isFile()) {
        files.push(relative.normalize('NFC'));
      }
    }
  }
  await visit(root, '');

  const index = new Map();
  for (const file of files) {
    const route = routeForOutputFile(file);
    if (index.has(route)) {
      throw new Error(`Duplicate generated route "${route}": ${index.get(route)} and ${file}`);
    }
    index.set(route, file);
  }
  return index;
}

function diagnostic(code, message, file = '<generated>') {
  return createDiagnostic('error', code, message, { file, line: 1, column: 1 });
}

function decodePathname(pathname) {
  return decodeURIComponent(pathname).normalize('NFC');
}

function resolveLocalReference({ reference, fromRoute = '/', siteId }) {
  const site = siteFor(siteId);
  const value = String(reference == null ? '' : reference).trim();
  if (!value || value.startsWith('#') || SKIPPED_PROTOCOL.test(value)) {
    return { skip: true };
  }
  let url;
  try {
    url = new URL(value, new URL(fromRoute, `${site.origin}/`));
  } catch {
    return {
      skip: false,
      diagnostic: diagnostic('GEN_REFERENCE_INVALID_URL', `Invalid local URL reference: ${value}`)
    };
  }
  if (url.origin !== site.origin) return { skip: true };
  if (DOUBLE_ENCODED_OCTET.test(value)) {
    return {
      skip: false,
      diagnostic: diagnostic(
        'GEN_REFERENCE_DOUBLE_ENCODED',
        `Local reference contains a double-encoded URL octet: ${value}`
      )
    };
  }

  let pathname;
  try {
    pathname = decodePathname(url.pathname);
  } catch {
    return {
      skip: false,
      diagnostic: diagnostic('GEN_REFERENCE_INVALID_ENCODING', `Invalid URL encoding: ${value}`)
    };
  }
  return {
    skip: false,
    route: pathname || '/',
    pathname: pathname || '/',
    query: url.search,
    fragment: url.hash
  };
}

function routeIndexFrom(input) {
  return input.routeIndex || input.routes || new Map();
}

function hasRoute(index, route) {
  return Boolean(index && typeof index.has === 'function' && index.has(route));
}

function sourceText(input, key) {
  return String(input[key] == null ? input.content == null ? '' : input.content : input[key]);
}

function xmlDocument(xml) {
  return new JSDOM(xml, { contentType: 'application/xml' }).window.document;
}

function urlDiagnosticPrefix(kind) {
  return kind === 'sitemap' ? 'GEN_SITEMAP' : 'GEN_ATOM';
}

function validateGeneratedUrl({ value, kind, siteId, routeIndex, file }) {
  const diagnostics = [];
  const site = siteFor(siteId);
  const prefix = urlDiagnosticPrefix(kind);
  if (DOUBLE_ENCODED_OCTET.test(value)) {
    diagnostics.push(diagnostic(
      `${prefix}_DOUBLE_ENCODED`,
      `${kind} URL contains a double-encoded octet: ${value}`,
      file
    ));
    return diagnostics;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    diagnostics.push(diagnostic(`${prefix}_INVALID_URL`, `Invalid ${kind} URL: ${value}`, file));
    return diagnostics;
  }
  if (url.origin !== site.origin) {
    diagnostics.push(diagnostic(
      `${prefix}_WRONG_HOST`,
      `${kind} URL must use ${site.origin}: ${value}`,
      file
    ));
    return diagnostics;
  }

  let route;
  try {
    route = decodePathname(url.pathname || '/');
  } catch {
    diagnostics.push(diagnostic(`${prefix}_INVALID_ENCODING`, `Invalid ${kind} URL encoding: ${value}`, file));
    return diagnostics;
  }
  if (siteId === 'en' && route !== route.toLowerCase()) {
    diagnostics.push(diagnostic(
      'GEN_ENGLISH_PATH_NOT_LOWERCASE',
      `English generated URL pathname must be lowercase: ${value}`,
      file
    ));
  }
  const directRoute = route.endsWith('/index.html')
    ? routeForOutputFile(route.slice(1))
    : route;
  if (!hasRoute(routeIndex, directRoute)) {
    diagnostics.push(diagnostic(
      `${prefix}_MISSING_ROUTE`,
      `${kind} URL does not map to a direct generated route: ${value}`,
      file
    ));
  }
  return diagnostics;
}

function validateSitemap(input) {
  const xml = sourceText(input, 'xml');
  const file = input.file || 'public/sitemap.xml';
  let document;
  try {
    document = xmlDocument(xml);
  } catch (cause) {
    return [diagnostic('GEN_SITEMAP_INVALID_XML', `Sitemap is not well formed: ${cause.message}`, file)];
  }

  const diagnostics = [];
  for (const node of document.querySelectorAll('loc')) {
    diagnostics.push(...validateGeneratedUrl({
      value: node.textContent.trim(),
      kind: 'sitemap',
      siteId: input.siteId,
      routeIndex: routeIndexFrom(input),
      file
    }));
  }
  return sortDiagnostics(diagnostics);
}

function validateAtom(input) {
  const xml = sourceText(input, 'xml');
  const file = input.file || 'public/atom.xml';
  const site = siteFor(input.siteId);
  let document;
  try {
    document = xmlDocument(xml);
  } catch (cause) {
    return [diagnostic('GEN_ATOM_INVALID_XML', `Atom feed is not well formed: ${cause.message}`, file)];
  }

  const diagnostics = [];
  const routeIndex = routeIndexFrom(input);
  const self = document.querySelector('feed > link[rel="self"]')?.getAttribute('href') || '';
  const feedId = document.querySelector('feed > id')?.textContent.trim() || '';
  const expectedSelf = `${site.origin}/atom.xml`;
  const expectedId = `${site.origin}/`;
  if (self !== expectedSelf) {
    diagnostics.push(diagnostic('GEN_ATOM_SELF_URL', `Atom self URL must be exactly ${expectedSelf}`, file));
  }
  if (feedId !== expectedId) {
    diagnostics.push(diagnostic('GEN_ATOM_FEED_ID', `Atom feed ID must be exactly ${expectedId}`, file));
  }

  const checked = new Set();
  function checkUrl(value) {
    if (!value || checked.has(value)) return;
    checked.add(value);
    diagnostics.push(...validateGeneratedUrl({
      value,
      kind: 'atom',
      siteId: input.siteId,
      routeIndex,
      file
    }));
  }
  checkUrl(self);
  checkUrl(feedId);
  for (const link of document.querySelectorAll('feed > link[href]')) checkUrl(link.getAttribute('href').trim());

  for (const entry of document.querySelectorAll('entry')) {
    const link = entry.querySelector('link[href]')?.getAttribute('href')?.trim() || '';
    const id = entry.querySelector('id')?.textContent.trim() || '';
    if (!link || link !== id) {
      diagnostics.push(diagnostic(
        'GEN_ATOM_ENTRY_LINK_ID_MISMATCH',
        `Atom entry link must exactly equal its ID: link="${link}", id="${id}"`,
        file
      ));
    }
    checkUrl(link);
    checkUrl(id);
  }
  return sortDiagnostics(diagnostics);
}

function canonicalForRoute(siteId, route) {
  return new URL(route, `${siteFor(siteId).origin}/`).href;
}

function decodedPolicyPath(value) {
  try {
    return decodePathname(value);
  } catch {
    return value;
  }
}

function generatedPostPath(siteId, key) {
  if (siteId === 'en') return decodedPolicyPath(postPath(siteId, key));
  const slug = path.basename(String(key))
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return `/${slug.normalize('NFC')}/`;
}

function findPost(inventory, siteId, route) {
  if (!inventory) return null;
  const map = siteId === 'zh' ? inventory.zhByKey : inventory.enByKey;
  if (!(map instanceof Map)) return null;
  for (const [key, value] of map) {
    if (generatedPostPath(siteId, key) === route.normalize('NFC')) return value;
  }
  return null;
}

function expectedPagePolicy({ route, siteId, inventory }) {
  const post = findPost(inventory, siteId, route);
  const canonicalUrl = canonicalForRoute(siteId, route);
  if (post) {
    const otherMap = siteId === 'zh' ? inventory.enByKey : inventory.zhByKey;
    const translated = post.data?.translated === true && otherMap instanceof Map
      && otherMap.has(post.pairingKey);
    return {
      check: true,
      post,
      ...resolveBilingualUrls({
        siteId,
        canonicalUrl,
        pagePath: route,
        source: post.file,
        layout: 'post',
        translated
      })
    };
  }
  if (EQUIVALENT_PATHS.has(route)) {
    return {
      check: true,
      post: null,
      ...resolveBilingualUrls({ siteId, canonicalUrl, pagePath: route, layout: 'page' })
    };
  }
  if (/^\/(?:tags|categories)\/[^/]+\/$/.test(route)) {
    return {
      check: true,
      post: null,
      ...resolveBilingualUrls({ siteId, canonicalUrl, pagePath: route, layout: 'page' })
    };
  }
  return { check: false, post: null, canonicalUrl };
}

function attributeValue(document, selector, attribute) {
  return document.querySelector(selector)?.getAttribute(attribute) || '';
}

function validateHtmlPage(input) {
  const file = input.file || `public${input.route === '/' ? '/index.html' : input.route}`;
  const route = String(input.route || '/').normalize('NFC');
  const site = siteFor(input.siteId);
  const dom = new JSDOM(sourceText(input, 'html'));
  const document = dom.window.document;
  const policy = expectedPagePolicy({ route, siteId: input.siteId, inventory: input.inventory });
  if (!policy.check) return [];

  const diagnostics = [];
  const actualLanguage = document.documentElement.getAttribute('lang') || '';
  if (actualLanguage !== site.language) {
    diagnostics.push(diagnostic(
      'GEN_HTML_LANGUAGE',
      `HTML language must be "${site.language}", received "${actualLanguage}"`,
      file
    ));
  }

  const canonical = attributeValue(document, 'link[rel="canonical"]', 'href');
  if (canonical !== policy.canonicalUrl) {
    diagnostics.push(diagnostic(
      'GEN_HTML_CANONICAL',
      `Canonical URL must be exactly ${policy.canonicalUrl}`,
      file
    ));
  }

  if (policy.post) {
    const openGraph = attributeValue(document, 'meta[property="og:url"]', 'content');
    if (openGraph !== policy.canonicalUrl) {
      diagnostics.push(diagnostic('GEN_HTML_OG_URL', `og:url must be exactly ${policy.canonicalUrl}`, file));
    }

    let jsonLd = null;
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const value = JSON.parse(script.textContent);
        const values = Array.isArray(value) ? value : value['@graph'] || [value];
        jsonLd = values.find((item) => item && item['@type'] === 'BlogPosting') || jsonLd;
      } catch {
        // A malformed BlogPosting is reported below as missing structured post metadata.
      }
    }
    if (!jsonLd || jsonLd.url !== policy.canonicalUrl) {
      diagnostics.push(diagnostic('GEN_HTML_JSONLD_URL', `BlogPosting URL must be ${policy.canonicalUrl}`, file));
    }
    const mainEntity = jsonLd?.mainEntityOfPage;
    const mainEntityUrl = typeof mainEntity === 'string' ? mainEntity : mainEntity?.['@id'];
    if (mainEntityUrl !== policy.canonicalUrl) {
      diagnostics.push(diagnostic(
        'GEN_HTML_JSONLD_MAIN_ENTITY',
        `BlogPosting mainEntityOfPage must be ${policy.canonicalUrl}`,
        file
      ));
    }
  }

  const alternateNodes = [...document.querySelectorAll('link[rel~="alternate"][hreflang]')];
  const switchLinks = [...document.querySelectorAll('.lang-switch a[href]')];
  if (!policy.alternateUrl) {
    if (alternateNodes.length > 0) {
      diagnostics.push(diagnostic(
        'GEN_HTML_UNEXPECTED_HREFLANG',
        `Page without a shared bilingual route must not publish hreflang alternates: ${route}`,
        file
      ));
    }
    if (switchLinks.length > 0) {
      diagnostics.push(diagnostic(
        'GEN_HTML_UNEXPECTED_LANGUAGE_SWITCH',
        `Page without a shared bilingual route must not display a language switch: ${route}`,
        file
      ));
    }
  } else {
    const expected = new Map([
      [policy.language, policy.canonicalUrl],
      [policy.alternateLanguage, policy.alternateUrl],
      ['x-default', policy.xDefaultUrl]
    ]);
    const actual = new Map(alternateNodes.map((node) => [
      node.getAttribute('hreflang'),
      node.getAttribute('href')
    ]));
    if (
      actual.size !== expected.size
      || [...expected].some(([language, href]) => actual.get(language) !== href)
    ) {
      diagnostics.push(diagnostic(
        'GEN_HTML_HREFLANG',
        `Self, reciprocal and x-default hreflang URLs do not match bilingual policy for ${route}`,
        file
      ));
    }
    if (switchLinks.length !== 1 || switchLinks[0].getAttribute('href') !== policy.alternateUrl) {
      diagnostics.push(diagnostic(
        'GEN_HTML_LANGUAGE_SWITCH',
        `Visible language switch must target ${policy.alternateUrl}`,
        file
      ));
    }
  }

  return sortDiagnostics(diagnostics);
}

function generatedFile(index, route) {
  return index.get(route);
}

async function readGenerated(root, relative) {
  try {
    return await fs.readFile(path.join(root, relative), 'utf8');
  } catch (cause) {
    const error = new Error(`Unable to read generated file ${relative} from ${root}: ${cause.message}`);
    error.cause = cause;
    throw error;
  }
}

function expectedRoutes(siteId, inventory) {
  const routes = new Set(EQUIVALENT_PATHS);
  const map = siteId === 'zh' ? inventory?.zhByKey : inventory?.enByKey;
  if (map instanceof Map) {
    for (const key of map.keys()) routes.add(generatedPostPath(siteId, key));
  }
  return [...routes].sort(compareText);
}

async function validateGeneratedSite(input) {
  const root = path.resolve(input.publicDir || input.dir);
  const routeIndex = await buildRouteIndex(root);
  const diagnostics = [];
  const siteId = input.siteId;
  siteFor(siteId);

  for (const route of expectedRoutes(siteId, input.inventory)) {
    if (!routeIndex.has(route)) {
      diagnostics.push(diagnostic(
        'GEN_EXPECTED_PAGE_MISSING',
        `Expected ${siteId} page is not a direct generated route: ${route}`,
        path.join(root, route === '/' ? 'index.html' : route.slice(1), 'index.html')
      ));
    }
  }

  const htmlEntries = [...routeIndex]
    .filter(([, file]) => file.endsWith('.html'))
    .sort((left, right) => compareText(left[1], right[1]));
  for (const [route, file] of htmlEntries) {
    const relevant = EQUIVALENT_PATHS.has(route)
      || /^\/(?:tags|categories)\/[^/]+\/$/.test(route)
      || Boolean(findPost(input.inventory, siteId, route));
    if (!relevant) continue;
    const html = await readGenerated(root, file);
    diagnostics.push(...validateHtmlPage({
      html,
      route,
      siteId,
      inventory: input.inventory,
      file: path.join(root, file)
    }));
  }

  const sitemapEntries = [...routeIndex]
    .filter(([, file]) => /(?:^|\/)(?:sitemap|[^/]+-sitemap)\.xml$/.test(file))
    .sort((left, right) => compareText(left[1], right[1]));
  if (sitemapEntries.length === 0) {
    diagnostics.push(diagnostic('GEN_SITEMAP_MISSING', 'Generated site is missing sitemap.xml', path.join(root, 'sitemap.xml')));
  } else {
    for (const [, file] of sitemapEntries) {
      const xml = await readGenerated(root, file);
      diagnostics.push(...validateSitemap({
        xml,
        siteId,
        routeIndex,
        file: path.join(root, file)
      }));
    }
  }

  const atomFile = generatedFile(routeIndex, '/atom.xml');
  if (!atomFile) {
    diagnostics.push(diagnostic('GEN_ATOM_MISSING', 'Generated site is missing atom.xml', path.join(root, 'atom.xml')));
  } else {
    diagnostics.push(...validateAtom({
      xml: await readGenerated(root, atomFile),
      siteId,
      routeIndex,
      file: path.join(root, atomFile)
    }));
  }

  if (siteId === 'en') {
    const redirectsFile = generatedFile(routeIndex, '/_redirects');
    if (!redirectsFile) {
      diagnostics.push(diagnostic(
        'GEN_ENGLISH_REDIRECTS',
        'English generated site is missing _redirects',
        path.join(root, '_redirects')
      ));
    } else {
      try {
        const rules = parseNetlifyRedirects(await readGenerated(root, redirectsFile));
        validateEnglishRedirects({ rules, inventory: input.inventory });
      } catch (cause) {
        diagnostics.push(diagnostic('GEN_ENGLISH_REDIRECTS', cause.message, path.join(root, redirectsFile)));
      }
    }

    const notFoundFile = generatedFile(routeIndex, '/404.html');
    if (!notFoundFile) {
      diagnostics.push(diagnostic('GEN_ENGLISH_404', 'English generated site is missing 404.html', path.join(root, '404.html')));
    } else {
      const document = new JSDOM(await readGenerated(root, notFoundFile)).window.document;
      if (document.documentElement.getAttribute('lang') !== 'en') {
        diagnostics.push(diagnostic(
          'GEN_ENGLISH_404',
          'English 404.html must declare lang="en"',
          path.join(root, notFoundFile)
        ));
      }
    }
  }

  return sortDiagnostics(diagnostics);
}

module.exports = {
  routeForOutputFile,
  buildRouteIndex,
  resolveLocalReference,
  validateHtmlPage,
  validateSitemap,
  validateAtom,
  validateGeneratedSite
};
