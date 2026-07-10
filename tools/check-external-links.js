#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const USAGE = 'usage: check-external-links --dir PATH';
const TIMEOUT_MS = 15_000;

function parseArguments(argv) {
  if (argv.length !== 2 || argv[0] !== '--dir' || !argv[1]) {
    throw new Error(USAGE);
  }
  return path.resolve(argv[1]);
}

function normalizeExternalUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function extractExternalUrls(html) {
  const urls = new Set();
  const add = (value) => {
    const url = normalizeExternalUrl(value);
    if (url) urls.add(url);
  };
  const attribute = /\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi;
  for (const match of html.matchAll(attribute)) add(match[2]);
  const srcset = /\bsrcset\s*=\s*(["'])(.*?)\1/gi;
  for (const match of html.matchAll(srcset)) {
    for (const candidate of match[2].split(',')) add(candidate.trim().split(/\s+/)[0]);
  }
  return [...urls].sort();
}

function isReachableStatus(status) {
  return (status >= 200 && status < 400) || [401, 403, 405].includes(status);
}

function classifyResponse(response) {
  return isReachableStatus(response.status)
    ? { reachable: true }
    : { reachable: false, reason: `returned HTTP ${response.status}` };
}

async function fetchWithTimeout(fetchImpl, url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url, { fetchImpl }) {
  let finalFailure;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      let response = await fetchWithTimeout(fetchImpl, url, { method: 'HEAD', redirect: 'follow' });
      if (response.status === 501) {
        response = await fetchWithTimeout(fetchImpl, url, { method: 'GET', redirect: 'follow' });
      }
      const result = classifyResponse(response);
      if (result.reachable) return null;
      finalFailure = result.reason;
    } catch (error) {
      finalFailure = `request failed: ${error && error.message ? error.message : String(error)}`;
    }
  }
  return `external-link: ${url} ${finalFailure}`;
}

async function checkExternalUrls(urls, { fetchImpl = globalThis.fetch, concurrency = 8 } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch is not available');
  const sortedUrls = [...new Set(urls)].sort();
  const warnings = [];
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < sortedUrls.length) {
      const url = sortedUrls[nextIndex];
      nextIndex += 1;
      const warning = await checkUrl(url, { fetchImpl });
      if (warning) warnings.push(warning);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, sortedUrls.length) }, worker));
  return { warnings: warnings.sort() };
}

async function readHtmlFiles(directory) {
  const html = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) html.push(await fs.readFile(file, 'utf8'));
    }
  }
  await walk(directory);
  return html;
}

async function main(argv = process.argv.slice(2), dependencies = {}) {
  const processRef = dependencies.processRef || process;
  try {
    const directory = parseArguments(argv);
    const exists = dependencies.exists || (async (target) => {
      const stat = await fs.stat(target);
      return stat.isDirectory();
    });
    if (!await exists(directory)) throw new Error(`public directory does not exist: ${directory}`);
    const htmlFiles = await (dependencies.readHtmlFiles || readHtmlFiles)(directory);
    const urls = htmlFiles.flatMap(extractExternalUrls);
    const { warnings } = await checkExternalUrls(urls, { fetchImpl: dependencies.fetchImpl });
    for (const warning of warnings) processRef.stderr.write(`${warning}\n`);
    processRef.exitCode = 0;
  } catch (error) {
    processRef.stderr.write(`check-external-links: ${error.message}\n`);
    processRef.exitCode = 2;
  }
}

if (require.main === module) main();

module.exports = {
  extractExternalUrls,
  isReachableStatus,
  classifyResponse,
  checkExternalUrls,
  main
};
