'use strict';

const path = require('node:path');
const { execFile } = require('node:child_process');
const { lstat, readFile } = require('node:fs/promises');
const { promisify } = require('node:util');
const frontMatter = require('hexo-front-matter');
const { pairingKeyFromSourcePath } = require('./site-policy');

const execFileAsync = promisify(execFile);

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function normalizeSource(source) {
  return String(source == null ? '' : source)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n');
}

function frontMatterKeyLines(source) {
  const splitData = frontMatter.split(normalizeSource(source));
  const keyLines = new Map();
  if (typeof splitData.data !== 'string') return keyLines;

  const lineOffset = splitData.prefixSeparator ? 1 : 0;
  const lines = splitData.data.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = /^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\s*:(?:\s|$)/.exec(line);
    const key = match && (match[1] || match[2] || match[3]);
    if (key && !keyLines.has(key)) keyLines.set(key, index + lineOffset + 1);
  }

  return keyLines;
}

function sideFromTrackedPath(file) {
  if (file.startsWith('source-en/')) return 'en';
  if (file.startsWith('source/')) return 'zh';
  throw new Error(`Tracked post is outside the bilingual source roots: ${file}`);
}

function parsePostSource({ file, side, source }) {
  const normalizedSource = normalizeSource(source);
  const data = frontMatter.parse(normalizedSource);

  return {
    file,
    side: side || sideFromTrackedPath(file),
    source: normalizedSource,
    body: data._content || '',
    data,
    keyLines: frontMatterKeyLines(normalizedSource),
    pairingKey: pairingKeyFromSourcePath(file)
  };
}

async function runGit(repoRoot, args, description) {
  const root = path.resolve(repoRoot || process.cwd());
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024
    });
    return stdout;
  } catch (cause) {
    const error = new Error(`Unable to ${description} in ${root}: ${cause.message}`);
    error.cause = cause;
    throw error;
  }
}

async function listTrackedPostPaths(repoRoot = process.cwd()) {
  const output = await runGit(repoRoot, [
    'ls-files',
    '-z',
    '--deduplicate',
    '--',
    'source/_posts',
    'source-en/_posts'
  ], 'list tracked bilingual posts');

  return output
    .split('\0')
    .filter((file) => file.endsWith('.md'))
    .sort(compareText);
}

async function loadTrackedPosts(repoRoot = process.cwd()) {
  const root = path.resolve(repoRoot);
  const files = await listTrackedPostPaths(root);

  return Promise.all(files.map(async (file) => {
    const filePath = path.join(root, file);
    let stats;
    try {
      stats = await lstat(filePath);
    } catch (cause) {
      const error = new Error(`Unable to inspect tracked post ${file} in ${root}: ${cause.message}`);
      error.cause = cause;
      throw error;
    }
    if (!stats.isFile()) {
      throw new Error(`Tracked post ${file} in ${root} is not a regular file`);
    }

    try {
      const source = await readFile(filePath, 'utf8');
      return parsePostSource({ file, side: sideFromTrackedPath(file), source });
    } catch (cause) {
      const error = new Error(`Unable to read tracked post ${file} from ${root}: ${cause.message}`);
      error.cause = cause;
      throw error;
    }
  }));
}

function buildInventory(posts) {
  const sortedPosts = [...posts].sort((left, right) => compareText(left.file, right.file));
  const byFile = new Map();
  const zhByKey = new Map();
  const enByKey = new Map();

  for (const post of sortedPosts) {
    if (byFile.has(post.file)) {
      const existing = byFile.get(post.file);
      throw new Error(`Duplicate inventory file path: "${existing.file}" conflicts with "${post.file}"`);
    }

    const sideMap = post.side === 'zh' ? zhByKey : post.side === 'en' ? enByKey : null;
    if (sideMap && sideMap.has(post.pairingKey)) {
      const existing = sideMap.get(post.pairingKey);
      throw new Error(
        `Duplicate ${post.side} pairing key "${post.pairingKey}": `
        + `"${existing.file}" conflicts with "${post.file}"`
      );
    }

    byFile.set(post.file, post);
    if (sideMap) sideMap.set(post.pairingKey, post);
  }

  return { posts: sortedPosts, byFile, zhByKey, enByKey };
}

async function loadTrackedInventory(repoRoot = process.cwd()) {
  return buildInventory(await loadTrackedPosts(repoRoot));
}

function parseNameStatus(output) {
  const fields = String(output == null ? '' : output).split('\0');
  if (fields.at(-1) === '') fields.pop();

  const changes = [];
  for (let index = 0; index < fields.length;) {
    const status = fields[index];
    const renamedOrCopied = /^[RC]\d*$/.test(status);
    const requiredFields = renamedOrCopied ? 3 : 2;
    if (!status || index + requiredFields > fields.length) {
      throw new Error('Malformed NUL-delimited Git name-status output');
    }
    const paths = fields.slice(index + 1, index + requiredFields);
    if (paths.some((file) => typeof file !== 'string' || file.length === 0)) {
      throw new Error('Malformed NUL-delimited Git name-status output');
    }

    if (renamedOrCopied) {
      changes.push({ status, oldPath: fields[index + 1], path: fields[index + 2] });
    } else {
      changes.push({ status, path: fields[index + 1] });
    }
    index += requiredFields;
  }

  return changes;
}

async function listGitChanges(repoRoot = process.cwd(), base, options = {}) {
  if (!base) return [];

  const staged = Boolean(options.staged);
  const output = await runGit(repoRoot, [
    'diff',
    ...(staged ? ['--cached'] : []),
    '--name-status',
    '-z',
    '--find-renames',
    staged ? base : `${base}...HEAD`,
    '--',
    'source/_posts',
    'source-en/_posts'
  ], `list bilingual post changes from ${base}`);

  return parseNameStatus(output);
}

module.exports = {
  normalizeSource,
  frontMatterKeyLines,
  parsePostSource,
  listTrackedPostPaths,
  loadTrackedPosts,
  buildInventory,
  loadTrackedInventory,
  parseNameStatus,
  listGitChanges
};
