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
  symlink,
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

test('uses matching four-hyphen front-matter delimiters for key lines', () => {
  const keyLines = frontMatterKeyLines([
    '----',
    'title: Example',
    'tags: Test',
    '----',
    'Body'
  ].join('\n'));

  assert.deepEqual([...keyLines], [['title', 2], ['tags', 3]]);
});

test('returns no key lines for unrecognized or unclosed prefix delimiters', () => {
  const sources = [
    [' ---', 'title: padded', ' ---', 'Body'].join('\n'),
    ['---', 'title: dot close', '...', 'Body'].join('\n'),
    ['---', 'title: unclosed'].join('\n')
  ];

  for (const source of sources) {
    assert.deepEqual([...frontMatterKeyLines(source)], []);
  }
});

test('reports suffix-delimited front-matter keys from line one', () => {
  const keyLines = frontMatterKeyLines(['title: Example', '---', 'Body'].join('\n'));

  assert.deepEqual([...keyLines], [['title', 1]]);
});

test('builds exact bilingual maps without scanning the filesystem', () => {
  const zh = parsePostSource({ file: 'source/_posts/2024-02-29-Example.md', side: 'zh', source: crlf });
  const en = parsePostSource({ file: 'source-en/_posts/2024-02-29-Example.md', side: 'en', source: crlf });
  const inventory = buildInventory([zh, en]);
  assert.equal(inventory.zhByKey.get(zh.pairingKey), zh);
  assert.equal(inventory.enByKey.get(en.pairingKey), en);
});

test('rejects duplicate inventory file records', () => {
  const first = parsePostSource({
    file: 'source/_posts/2024-02-29-Example.md',
    side: 'zh',
    source: crlf
  });
  const duplicate = { ...first };

  assert.throws(
    () => buildInventory([first, duplicate]),
    {
      name: 'Error',
      message: 'Duplicate inventory file path: "source/_posts/2024-02-29-Example.md" conflicts with "source/_posts/2024-02-29-Example.md"'
    }
  );
});

test('rejects duplicate same-side pairing keys with both conflict paths', () => {
  const first = parsePostSource({
    file: 'source/_posts/first/2024-02-29-Example.md',
    side: 'zh',
    source: crlf
  });
  const second = parsePostSource({
    file: 'source/_posts/second/2024-02-29-Example.md',
    side: 'zh',
    source: crlf
  });

  assert.throws(
    () => buildInventory([first, second]),
    {
      name: 'Error',
      message: 'Duplicate zh pairing key "2024-02-29-Example.md": "source/_posts/first/2024-02-29-Example.md" conflicts with "source/_posts/second/2024-02-29-Example.md"'
    }
  );
});

test('parses NUL-delimited Git name-status output', () => {
  assert.deepEqual(parseNameStatus('A\0source/_posts/a.md\0M\0source-en/_posts/b.md\0'), [
    { status: 'A', path: 'source/_posts/a.md' },
    { status: 'M', path: 'source-en/_posts/b.md' }
  ]);
});

for (const [description, output] of [
  ['ordinary path', 'A\0\0'],
  ['rename source path', 'R100\0\0source/_posts/new.md\0'],
  ['rename destination path', 'R100\0source/_posts/old.md\0\0']
]) {
  test(`rejects an empty ${description} in Git name-status output`, () => {
    assert.throws(
      () => parseNameStatus(output),
      { name: 'Error', message: 'Malformed NUL-delimited Git name-status output' }
    );
  });
}

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

test('rejects tracked symlinks as non-regular posts before reading them', async (t) => {
  const root = await createGitRepository(t);
  const targetFile = path.join(root, 'target.md');
  const linkFile = 'source/_posts/2024-02-29-Link.md';
  await writeFile(targetFile, crlf);

  try {
    await symlink('../../target.md', path.join(root, linkFile));
  } catch (error) {
    if (['EACCES', 'ENOSYS', 'EPERM'].includes(error.code)) {
      t.skip(`symbolic links unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  await execFileAsync('git', ['add', '--', linkFile], { cwd: root });

  await assert.rejects(
    loadTrackedPosts(root),
    {
      name: 'Error',
      message: `Tracked post ${linkFile} in ${root} is not a regular file`
    }
  );
});

test('deduplicates unmerged index stages when listing tracked posts', async (t) => {
  const root = await createGitRepository(t);
  const file = 'source/_posts/2024-02-29-Conflict.md';
  const filePath = path.join(root, file);
  await writeFile(filePath, 'base\n');
  await execFileAsync('git', ['add', '--', file], { cwd: root });
  await execFileAsync('git', ['commit', '--quiet', '-m', 'base'], { cwd: root });

  await execFileAsync('git', ['checkout', '--quiet', '-b', 'left'], { cwd: root });
  await writeFile(filePath, 'left\n');
  await execFileAsync('git', ['add', '--', file], { cwd: root });
  await execFileAsync('git', ['commit', '--quiet', '-m', 'left'], { cwd: root });

  await execFileAsync('git', ['checkout', '--quiet', '-b', 'right', 'HEAD~1'], { cwd: root });
  await writeFile(filePath, 'right\n');
  await execFileAsync('git', ['add', '--', file], { cwd: root });
  await execFileAsync('git', ['commit', '--quiet', '-m', 'right'], { cwd: root });

  await execFileAsync('git', ['checkout', '--quiet', 'left'], { cwd: root });
  await assert.rejects(
    execFileAsync('git', ['merge', '--no-edit', 'right'], { cwd: root }),
    (error) => error.code === 1
  );

  const { stdout } = await execFileAsync('git', ['ls-files', '--stage', '--', file], { cwd: root });
  assert.equal(stdout.trim().split('\n').length, 3);
  assert.deepEqual(await listTrackedPostPaths(root), [file]);
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
  await execFileAsync('git', ['config', 'diff.renames', 'false'], { cwd: root });
  const changes = await listGitChanges(root, base);

  assert.deepEqual(changes, [{ status: 'R100', oldPath: oldFile, path: newFile }]);
});
