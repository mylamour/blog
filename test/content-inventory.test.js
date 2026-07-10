'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const {
  mkdtemp,
  mkdir,
  rename,
  rm,
  writeFile
} = require('node:fs/promises');
const {
  createDiagnostic,
  sortDiagnostics,
  formatDiagnostic,
  printDiagnostics,
  exitCodeFor
} = require('../lib/diagnostics');
const {
  normalizeSource,
  frontMatterKeyLines,
  parsePostSource,
  listTrackedPostPaths,
  loadTrackedPosts,
  buildInventory,
  loadTrackedInventory,
  parseNameStatus,
  listGitChanges
} = require('../lib/content-inventory');

const execFileAsync = promisify(execFile);

const crlf = [
  '---',
  'layout: post',
  'title: Example',
  'categories: Security',
  'tags: Test',
  'kerywords: legacy',
  'translated: true',
  '---',
  'Body'
].join('\r\n');

async function createGitRepository(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'content-inventory-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await execFileAsync('git', ['init', '--quiet'], { cwd: root });
  await execFileAsync('git', ['config', 'user.name', 'Content Inventory Test'], { cwd: root });
  await execFileAsync('git', ['config', 'user.email', 'content-inventory@example.test'], { cwd: root });
  await mkdir(path.join(root, 'source/_posts'), { recursive: true });
  await mkdir(path.join(root, 'source-en/_posts'), { recursive: true });
  return root;
}

test('creates and formats diagnostics with repository-relative locations', () => {
  const diagnostic = createDiagnostic(
    'error',
    'CONTENT_NEW_KERYWORDS',
    'use "keywords"',
    { file: '/repo/source/file.md', line: 5, column: 1 }
  );

  assert.deepEqual(diagnostic, {
    severity: 'error',
    code: 'CONTENT_NEW_KERYWORDS',
    message: 'use "keywords"',
    location: { file: '/repo/source/file.md', line: 5, column: 1 }
  });
  assert.equal(
    formatDiagnostic(diagnostic, '/repo'),
    'source/file.md:5:1: error CONTENT_NEW_KERYWORDS: use "keywords"'
  );
});

test('sorts and prints diagnostics deterministically', () => {
  const diagnostics = [
    createDiagnostic('warning', 'CONTENT_Z', 'later', { file: '/repo/z.md', line: 2, column: 1 }),
    createDiagnostic('error', 'CONTENT_A', 'earlier', { file: '/repo/a.md', line: 3, column: 1 })
  ];
  const original = [...diagnostics];
  let output = '';

  assert.deepEqual(sortDiagnostics(diagnostics), [diagnostics[1], diagnostics[0]]);
  assert.deepEqual(diagnostics, original);
  printDiagnostics(diagnostics, {
    cwd: '/repo',
    stderr: { write(chunk) { output += chunk; } }
  });

  assert.equal(output, [
    'a.md:3:1: error CONTENT_A: earlier',
    'z.md:2:1: warning CONTENT_Z: later',
    ''
  ].join('\n'));
  assert.equal(exitCodeFor([diagnostics[0]]), 0);
  assert.equal(exitCodeFor(diagnostics), 1);
});

test('prints diagnostics with process-shaped streams', () => {
  const diagnostic = createDiagnostic(
    'error',
    'CONTENT_A',
    'example',
    { file: '/repo/a.md', line: 1, column: 1 }
  );
  let output = '';

  printDiagnostics([diagnostic], {
    cwd() { return '/repo'; },
    stderr: { write(chunk) { output += chunk; } }
  });

  assert.equal(output, 'a.md:1:1: error CONTENT_A: example\n');
});

test('normalizes BOM and CRLF before parsing front matter', () => {
  const post = parsePostSource({
    file: 'source/_posts/2024-02-29-Example.md',
    side: 'zh',
    source: `\uFEFF${crlf}`
  });
  assert.equal(normalizeSource(crlf).includes('\r'), false);
  assert.equal(post.data.layout, 'post');
  assert.equal(post.keyLines.get('kerywords'), 6);
  assert.equal(post.pairingKey, '2024-02-29-Example.md');
});

test('collects only top-level front-matter key lines', () => {
  const keyLines = frontMatterKeyLines([
    '---',
    'title: Example',
    'metadata:',
    '  kerywords: nested',
    '---',
    'kerywords: body text'
  ].join('\r\n'));

  assert.deepEqual([...keyLines], [['title', 2], ['metadata', 3]]);
});

test('builds exact bilingual maps without scanning the filesystem', () => {
  const zh = parsePostSource({ file: 'source/_posts/2024-02-29-Example.md', side: 'zh', source: crlf });
  const en = parsePostSource({ file: 'source-en/_posts/2024-02-29-Example.md', side: 'en', source: crlf });
  const inventory = buildInventory([zh, en]);
  assert.equal(inventory.zhByKey.get(zh.pairingKey), zh);
  assert.equal(inventory.enByKey.get(en.pairingKey), en);
});

test('parses NUL-delimited Git name-status output', () => {
  assert.deepEqual(parseNameStatus('A\0source/_posts/a.md\0M\0source-en/_posts/b.md\0'), [
    { status: 'A', path: 'source/_posts/a.md' },
    { status: 'M', path: 'source-en/_posts/b.md' }
  ]);
});

test('loads only tracked Markdown posts and derives their side', async (t) => {
  const root = await createGitRepository(t);
  const zhFile = 'source/_posts/2024-02-29-Zh.md';
  const enFile = 'source-en/_posts/2024-02-29-En.md';
  const untrackedFile = 'source/_posts/2024-02-29-Untracked.md';
  const nonMarkdownFile = 'source/_posts/notes.txt';

  await writeFile(path.join(root, zhFile), crlf);
  await writeFile(path.join(root, enFile), crlf);
  await writeFile(path.join(root, untrackedFile), crlf);
  await writeFile(path.join(root, nonMarkdownFile), 'tracked but not Markdown');
  await execFileAsync('git', ['add', '--', zhFile, enFile, nonMarkdownFile], { cwd: root });

  assert.deepEqual(await listTrackedPostPaths(root), [enFile, zhFile]);
  const posts = await loadTrackedPosts(root);
  assert.deepEqual(posts.map(({ file, side }) => ({ file, side })), [
    { file: enFile, side: 'en' },
    { file: zhFile, side: 'zh' }
  ]);

  const inventory = await loadTrackedInventory(root);
  assert.equal(inventory.posts.length, 2);
  assert.equal(inventory.byFile.get(untrackedFile), undefined);
  assert.equal(inventory.byFile.get(zhFile).data.layout, 'post');
});

test('loads changes only for an explicit base and preserves rename paths', async (t) => {
  assert.deepEqual(await listGitChanges('/path/that/does/not/exist'), []);

  const root = await createGitRepository(t);
  const oldFile = 'source/_posts/2024-02-29-Old.md';
  const newFile = 'source/_posts/2024-02-29-New.md';
  await writeFile(path.join(root, oldFile), crlf);
  await execFileAsync('git', ['add', '--', oldFile], { cwd: root });
  await execFileAsync('git', ['commit', '--quiet', '-m', 'base'], { cwd: root });
  const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: root });
  const base = stdout.trim();

  await rename(path.join(root, oldFile), path.join(root, newFile));
  await execFileAsync('git', ['add', '--all'], { cwd: root });
  await execFileAsync('git', ['commit', '--quiet', '-m', 'rename'], { cwd: root });
  const changes = await listGitChanges(root, base);

  assert.deepEqual(changes, [{ status: 'R100', oldPath: oldFile, path: newFile }]);
});
