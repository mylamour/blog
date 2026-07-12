'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');
const test = require('node:test');
const {
  routeForOutputFile,
  buildRouteIndex,
  resolveLocalReference,
  validateGeneratedLinks,
  validateHtmlPage,
  validateSitemap,
  validateAtom,
  validateGeneratedSite
} = require('../lib/generated-audit');
const { buildInventory, parsePostSource } = require('../lib/content-inventory');
const { SITES, postPath } = require('../lib/site-policy');

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(__dirname, '..');

async function buildEnglishSite() {
  await execFileAsync(
    path.join(repositoryRoot, 'node_modules', '.bin', 'hexo'),
    ['clean'],
    { cwd: repositoryRoot }
  );
  await execFileAsync(
    path.join(repositoryRoot, 'node_modules', '.bin', 'hexo'),
    ['generate', '--bail', '--config', '_config.yml,_config.en.yml'],
    { cwd: repositoryRoot }
  );
}

function codes(diagnostics) {
  return diagnostics.map((diagnostic) => diagnostic.code);
}

function routes(values) {
  return new Map(values.map((route) => [route, route === '/' ? 'index.html' : `${route.slice(1)}index.html`]));
}

function generatedLinks({
  html,
  siteId = 'zh',
  sourceRoute = '/page/',
  routeValues = [sourceRoute],
  targetHtml = {},
  baseline = []
}) {
  const routeIndex = routes(routeValues);
  const htmlByRoute = new Map([
    [sourceRoute, { html, file: routeIndex.get(sourceRoute) }],
    ...Object.entries(targetHtml).map(([route, target]) => [
      route,
      { html: target, file: routeIndex.get(route) }
    ])
  ]);
  return validateGeneratedLinks({ siteId, routeIndex, htmlByRoute, baseline });
}

function post(file, side, translated = true) {
  return parsePostSource({
    file,
    side,
    source: `---\nlayout: post\ntitle: Example\ndate: 2025-01-02\ntranslated: ${translated}\n---\nBody\n`
  });
}

function pageHtml({
  siteId,
  canonical,
  alternate,
  alternateLanguage,
  xDefault,
  jsonLd = false,
  switchTarget = alternate
}) {
  const site = SITES[siteId];
  const alternates = alternate
    ? `<link rel="alternate" hreflang="${site.language}" href="${canonical}">
       <link rel="alternate" hreflang="${alternateLanguage}" href="${alternate}">
       <link rel="alternate" hreflang="x-default" href="${xDefault}">`
    : '';
  const structured = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify({
      '@type': 'BlogPosting',
      url: canonical,
      mainEntityOfPage: { '@id': canonical }
    })}</script>`
    : '';
  const languageSwitch = switchTarget
    ? `<span class="lang-switch"><a href="${switchTarget}">switch</a></span>`
    : '';
  return `<!doctype html><html lang="${site.language}"><head>
    <link rel="canonical" href="${canonical}">
    <meta property="og:url" content="${canonical}">
    ${alternates}${structured}</head><body>${languageSwitch}</body></html>`;
}

test('maps generated output files to only their direct public routes', () => {
  assert.equal(routeForOutputFile('index.html'), '/');
  assert.equal(routeForOutputFile('foo/index.html'), '/foo/');
  assert.equal(routeForOutputFile('foo.txt'), '/foo.txt');
  assert.equal(routeForOutputFile('assets/App.js'), '/assets/App.js');
  assert.notEqual(routeForOutputFile('foo/index.html'), '/foo');
});

test('builds a case-sensitive direct route index recursively', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'generated-routes-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'Foo'), { recursive: true });
  await fs.writeFile(path.join(root, 'index.html'), 'home');
  await fs.writeFile(path.join(root, 'Foo', 'index.html'), 'upper');
  await fs.writeFile(path.join(root, 'asset.txt'), 'asset');

  const index = await buildRouteIndex(root);
  assert.deepEqual([...index.keys()].sort(), ['/', '/Foo/', '/asset.txt']);
  assert.equal(index.has('/foo/'), false);
  assert.equal(index.has('/Foo'), false);
});

test('sitemap rejects double encoding and URLs without direct generated routes', () => {
  const routeIndex = routes(['/', '/sitemap.xml', '/present/']);
  const xml = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${SITES.zh.origin}/%25E5%25AE%2589/</loc></url>
    <url><loc>${SITES.zh.origin}/missing/</loc></url>
  </urlset>`;
  const diagnostics = validateSitemap({ xml, siteId: 'zh', routeIndex, file: 'public/sitemap.xml' });
  assert.deepEqual(codes(diagnostics), [
    'GEN_SITEMAP_DOUBLE_ENCODED',
    'GEN_SITEMAP_MISSING_ROUTE'
  ]);
});

test('English sitemap paths must be lowercase', () => {
  const xml = `<?xml version="1.0"?><urlset><url><loc>${SITES.en.origin}/Upper/</loc></url></urlset>`;
  const diagnostics = validateSitemap({
    xml,
    siteId: 'en',
    routeIndex: routes(['/Upper/']),
    file: 'public/sitemap.xml'
  });
  assert.equal(codes(diagnostics).includes('GEN_ENGLISH_PATH_NOT_LOWERCASE'), true);
});

test('sitemap accepts an explicit index file but not an extensionless rewrite route', () => {
  const routeIndex = routes(['/foo/']);
  const accepted = `<?xml version="1.0"?><urlset><url><loc>${SITES.zh.origin}/foo/index.html</loc></url></urlset>`;
  assert.deepEqual(validateSitemap({ xml: accepted, siteId: 'zh', routeIndex }), []);

  const rewritten = `<?xml version="1.0"?><urlset><url><loc>${SITES.zh.origin}/foo</loc></url></urlset>`;
  assert.equal(codes(validateSitemap({
    xml: rewritten,
    siteId: 'zh',
    routeIndex
  })).includes('GEN_SITEMAP_MISSING_ROUTE'), true);
});

test('Atom requires exact feed URLs, matching entry link and ID, and direct lowercase routes', () => {
  const xml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
    <link rel="self" href="${SITES.en.origin}/wrong.xml"/>
    <id>${SITES.en.origin}/wrong/</id>
    <entry><link href="${SITES.en.origin}/Upper/"/><id>${SITES.en.origin}/different/</id></entry>
  </feed>`;
  const diagnostics = validateAtom({
    xml,
    siteId: 'en',
    routeIndex: routes(['/', '/atom.xml', '/Upper/']),
    file: 'public/atom.xml'
  });
  assert.equal(codes(diagnostics).includes('GEN_ATOM_SELF_URL'), true);
  assert.equal(codes(diagnostics).includes('GEN_ATOM_FEED_ID'), true);
  assert.equal(codes(diagnostics).includes('GEN_ATOM_ENTRY_LINK_ID_MISMATCH'), true);
  assert.equal(codes(diagnostics).includes('GEN_ENGLISH_PATH_NOT_LOWERCASE'), true);
});

test('valid Atom has an exact self URL, home feed ID, and entry link equal to ID', () => {
  const entry = `${SITES.zh.origin}/Example/`;
  const xml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
    <link rel="self" href="${SITES.zh.origin}/atom.xml"/>
    <link href="${SITES.zh.origin}/"/>
    <id>${SITES.zh.origin}/</id>
    <entry><link href="${entry}"/><id>${entry}</id></entry>
  </feed>`;
  assert.deepEqual(validateAtom({
    xml,
    siteId: 'zh',
    routeIndex: routes(['/', '/atom.xml', '/Example/'])
  }), []);
});

test('post HTML metadata, language, hreflang and visible switch follow inventory policy', () => {
  const key = '2025-01-02-Example.md';
  const inventory = buildInventory([
    post(`source/_posts/${key}`, 'zh'),
    post(`source-en/_posts/${key}`, 'en')
  ]);
  const route = postPath('en', key);
  const canonical = `${SITES.en.origin}${route}`;
  const alternate = `${SITES.zh.origin}${postPath('zh', key)}`;
  const html = pageHtml({
    siteId: 'en',
    canonical,
    alternate,
    alternateLanguage: SITES.zh.language,
    xDefault: canonical,
    jsonLd: true
  });
  assert.deepEqual(validateHtmlPage({ html, route, siteId: 'en', inventory }), []);

  const broken = html.replaceAll(canonical, `${SITES.en.origin}/wrong/`);
  const brokenCodes = codes(validateHtmlPage({ html: broken, route, siteId: 'en', inventory }));
  assert.equal(brokenCodes.includes('GEN_HTML_CANONICAL'), true);
  assert.equal(brokenCodes.includes('GEN_HTML_OG_URL'), true);
  assert.equal(brokenCodes.includes('GEN_HTML_JSONLD_URL'), true);
  assert.equal(brokenCodes.includes('GEN_HTML_JSONLD_MAIN_ENTITY'), true);
  assert.equal(brokenCodes.includes('GEN_HTML_HREFLANG'), true);
});

test('Chinese generated post matching preserves the tracked filename slug', () => {
  const key = '2025-01-02-Example_Post.md';
  const inventory = buildInventory([
    post(`source/_posts/${key}`, 'zh'),
    post(`source-en/_posts/${key}`, 'en')
  ]);
  const route = '/Example_Post/';
  const canonical = `${SITES.zh.origin}${route}`;
  const alternate = `${SITES.en.origin}${postPath('en', key)}`;
  const html = pageHtml({
    siteId: 'zh',
    canonical,
    alternate,
    alternateLanguage: SITES.en.language,
    xDefault: alternate,
    jsonLd: true
  });
  assert.deepEqual(validateHtmlPage({ html, route, siteId: 'zh', inventory }), []);
  assert.equal(codes(validateHtmlPage({
    html: html.replace(canonical, `${SITES.zh.origin}/wrong/`),
    route,
    siteId: 'zh',
    inventory
  })).includes('GEN_HTML_CANONICAL'), true);
});

test('seven shared landing pages require alternates while taxonomy detail pages forbid them', () => {
  const inventory = buildInventory([]);
  for (const route of ['/', '/blog/', '/about/', '/search/', '/category/', '/tag/', '/project/']) {
    const canonical = `${SITES.zh.origin}${route}`;
    const alternate = `${SITES.en.origin}${route}`;
    const html = pageHtml({
      siteId: 'zh',
      canonical,
      alternate,
      alternateLanguage: SITES.en.language,
      xDefault: alternate
    });
    assert.deepEqual(validateHtmlPage({ html, route, siteId: 'zh', inventory }), [], route);
  }

  const taxonomy = pageHtml({
    siteId: 'en',
    canonical: `${SITES.en.origin}/tags/Security/`,
    alternate: `${SITES.zh.origin}/tags/Security/`,
    alternateLanguage: SITES.zh.language,
    xDefault: `${SITES.en.origin}/tags/Security/`
  });
  const taxonomyCodes = codes(validateHtmlPage({
    html: taxonomy,
    route: '/tags/Security/',
    siteId: 'en',
    inventory
  }));
  assert.equal(taxonomyCodes.includes('GEN_HTML_UNEXPECTED_HREFLANG'), true);
  assert.equal(taxonomyCodes.includes('GEN_HTML_UNEXPECTED_LANGUAGE_SWITCH'), true);
});

test('local references decode once, normalize NFC, preserve case, and skip non-local schemes', () => {
  const resolved = resolveLocalReference({
    reference: '../Cafe%CC%81/File.PNG?raw=1#preview',
    fromRoute: '/posts/example/',
    siteId: 'en'
  });
  assert.equal(resolved.skip, false);
  assert.equal(resolved.route, '/posts/Café/File.PNG');
  assert.equal(resolved.query, '?raw=1');
  assert.equal(resolved.fragment, '#preview');
  assert.equal(resolveLocalReference({
    reference: 'mailto:hello@example.test', fromRoute: '/', siteId: 'en'
  }).skip, true);
  assert.equal(resolveLocalReference({
    reference: 'https://example.test/file', fromRoute: '/', siteId: 'en'
  }).skip, true);
  assert.equal(resolveLocalReference({
    reference: 'https://example.test/%25E5/', fromRoute: '/', siteId: 'en'
  }).skip, true);

  const invalid = resolveLocalReference({
    reference: '/%25E5%25AE%2589/', fromRoute: '/', siteId: 'zh'
  });
  assert.equal(invalid.diagnostic.code, 'GEN_REFERENCE_DOUBLE_ENCODED');
});

test('generated links require case-sensitive direct routes', () => {
  const diagnostics = generatedLinks({
    html: '<a href="/Foo/">direct</a><a href="/foo/">wrong case</a><a href="/Foo">rewrite only</a>',
    routeValues: ['/page/', '/Foo/']
  });
  const missing = diagnostics.filter((item) => item.code === 'GEN_LINK_TARGET_MISSING');

  assert.equal(diagnostics.length, 2);
  assert.equal(missing.length, 2);
  assert.equal(missing.some((item) => item.message.includes('/foo/')), true);
  assert.equal(missing.some((item) => item.message.includes('/Foo"')), true);
});

test('an exact missing-link baseline tuple suppresses only that pair and emits one aggregate warning', () => {
  const diagnostics = generatedLinks({
    html: '<a href="/missing-a">approved</a><a href="/missing-b">new regression</a>',
    baseline: [{ source: '/page/', target: '/missing-a', reason: 'historical deletion' }]
  });

  assert.deepEqual(
    diagnostics.map(({ severity, code }) => ({ severity, code })),
    [
      { severity: 'warning', code: 'GEN_LINK_BASELINE_MATCHED' },
      { severity: 'error', code: 'GEN_LINK_TARGET_MISSING' }
    ]
  );
  assert.equal(diagnostics[1].message.includes('/missing-b'), true);
});

test('a link baseline entry is stale when its source reference disappears', () => {
  const diagnostics = generatedLinks({
    html: '<p>No historical reference remains.</p>',
    baseline: [{ source: '/page/', target: '/missing', reason: 'historical deletion' }]
  });

  assert.deepEqual(codes(diagnostics), ['GEN_LINK_BASELINE_STALE']);
  assert.equal(diagnostics[0].severity, 'error');
});

test('a link baseline entry is stale when its target starts existing', () => {
  const diagnostics = generatedLinks({
    html: '<a href="/restored/">restored</a>',
    routeValues: ['/page/', '/restored/'],
    targetHtml: { '/restored/': '<h1>Restored</h1>' },
    baseline: [{ source: '/page/', target: '/restored/', reason: 'historical deletion' }]
  });

  assert.deepEqual(codes(diagnostics), ['GEN_LINK_BASELINE_STALE']);
  assert.equal(diagnostics[0].severity, 'error');
});

test('internal HTML fragments decode once and must match an exact target id', () => {
  const diagnostics = generatedLinks({
    html: '<div id="local"></div><a href="#local">local</a><a href="/target/#%E4%BD%A0%E5%A5%BD">valid</a><a href="/target/#missing">invalid</a>',
    routeValues: ['/page/', '/target/'],
    targetHtml: { '/target/': '<h2 id="你好">Decoded once</h2>' }
  });

  assert.deepEqual(codes(diagnostics), ['GEN_FRAGMENT_MISSING']);
  assert.equal(diagnostics[0].message.includes('#missing'), true);
});

test('generated link audit inspects resource attributes and parses srcset URLs', () => {
  const diagnostics = generatedLinks({
    html: `
      <a href="/missing-a">a</a>
      <link href="/missing-link.css">
      <script src="/missing-script.js"></script>
      <img src="/missing-image.png" data-src="/missing-lazy.png"
        srcset="data:image/svg+xml,%3Csvg%3E 1x, /missing-srcset.png 2x">
      <source src="/missing-source.mp4" srcset="/missing-source-1.png 1x, /missing-source-2.png 2x">
      <video poster="/missing-poster.png"></video>
    `
  });

  const missingMessages = diagnostics
    .filter((item) => item.code === 'GEN_LINK_TARGET_MISSING')
    .map((item) => item.message);
  for (const target of [
    '/missing-a',
    '/missing-link.css',
    '/missing-script.js',
    '/missing-image.png',
    '/missing-lazy.png',
    '/missing-srcset.png',
    '/missing-source.mp4',
    '/missing-source-1.png',
    '/missing-source-2.png',
    '/missing-poster.png'
  ]) {
    assert.equal(missingMessages.some((message) => message.includes(target)), true, target);
  }
  assert.equal(missingMessages.length, 10);
});

test('generated English audit composes links, redirect contract, and English 404 language', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'generated-site-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const home = pageHtml({
    siteId: 'en',
    canonical: `${SITES.en.origin}/`,
    alternate: `${SITES.zh.origin}/`,
    alternateLanguage: SITES.zh.language,
    xDefault: `${SITES.en.origin}/`
  }).replace('</body>', '<a href="/historical-missing">legacy</a></body>');
  await fs.writeFile(path.join(root, 'index.html'), home);
  for (const route of ['/blog/', '/about/', '/search/', '/category/', '/tag/', '/project/']) {
    const directory = path.join(root, route.slice(1));
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'index.html'), pageHtml({
      siteId: 'en',
      canonical: `${SITES.en.origin}${route}`,
      alternate: `${SITES.zh.origin}${route}`,
      alternateLanguage: SITES.zh.language,
      xDefault: `${SITES.en.origin}${route}`
    }));
  }
  await fs.writeFile(path.join(root, '404.html'), '<!doctype html><html lang="en"><body>missing</body></html>');
  await fs.writeFile(path.join(root, '_redirects'), '/* /404.html 404\n');
  await fs.writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0"?><urlset><url><loc>${SITES.en.origin}/</loc></url></urlset>`);
  await fs.writeFile(path.join(root, 'atom.xml'), `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><link rel="self" href="${SITES.en.origin}/atom.xml"/><id>${SITES.en.origin}/</id></feed>`);

  const diagnostics = await validateGeneratedSite({
    publicDir: root,
    siteId: 'en',
    inventory: buildInventory([]),
    linkBaseline: [{
      source: '/',
      target: '/historical-missing',
      reason: 'historical deletion'
    }]
  });
  assert.deepEqual(diagnostics.map(({ severity, code }) => ({ severity, code })), [
    { severity: 'warning', code: 'GEN_LINK_BASELINE_MATCHED' }
  ]);
});

test('English entry pages generate a Story route and a self-contained 404', async () => {
  await buildEnglishSite();

  const story = await fs.readFile(path.join(repositoryRoot, 'public', 'story', 'index.html'), 'utf8');
  assert.match(story, /<title>My Story/);

  const notFound = await fs.readFile(path.join(repositoryRoot, 'public', '404.html'), 'utf8');
  assert.match(notFound, /<h1>The path ends here<\/h1>/);
  assert.match(notFound, /<a href="\/">Home<\/a>/);
  assert.match(notFound, /<a href="\/blog\/">All posts<\/a>/);
  assert.match(notFound, /<a href="\/search\/">Search<\/a>/);
  assert.doesNotMatch(notFound, /Chinese only|fz\.cool/);
});
