'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  extractExternalUrls,
  isReachableStatus,
  checkExternalUrls,
  main
} = require('../tools/check-external-links');

test('extractExternalUrls deduplicates external href and src URLs and skips mailto', () => {
  const urls = extractExternalUrls(`
    <a href="https://example.com/a">one</a>
    <img src="https://cdn.example.com/image.png">
    <a href="https://example.com/a">duplicate</a>
    <a href="mailto:hello@example.com">mail</a>
    <script src="/local.js"></script>
  `);

  assert.deepEqual(urls, [
    'https://cdn.example.com/image.png',
    'https://example.com/a'
  ]);
});

test('isReachableStatus accepts successful, redirect, and access-restricted responses', () => {
  for (const status of [200, 204, 301, 399, 401, 403, 405]) {
    assert.equal(isReachableStatus(status), true, String(status));
  }
  assert.equal(isReachableStatus(400), false);
  assert.equal(isReachableStatus(500), false);
});

test('checkExternalUrls retries a transient network error exactly once', async () => {
  let calls = 0;
  const result = await checkExternalUrls(['https://example.com/'], {
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('temporary network failure');
      return { status: 200 };
    }
  });

  assert.equal(calls, 2);
  assert.deepEqual(result.warnings, []);
});

test('checkExternalUrls emits deterministic warnings for final failures', async () => {
  const result = await checkExternalUrls([
    'https://z.example/fail',
    'https://a.example/fail'
  ], {
    concurrency: 1,
    fetchImpl: async () => ({ status: 500 })
  });

  assert.deepEqual(result.warnings, [
    'external-link: https://a.example/fail returned HTTP 500',
    'external-link: https://z.example/fail returned HTTP 500'
  ]);
});

test('main reports network warnings without failing the required check', async () => {
  const writes = [];
  const processRef = { exitCode: undefined, stderr: { write: (line) => writes.push(line) } };
  await main(['--dir', 'public'], {
    processRef,
    exists: async () => true,
    readHtmlFiles: async () => ['<a href="https://example.com/fail">fail</a>'],
    fetchImpl: async () => ({ status: 500 })
  });

  assert.equal(processRef.exitCode, 0);
  assert.deepEqual(writes, ['external-link: https://example.com/fail returned HTTP 500\n']);
});

test('main exits 2 for invalid arguments or a missing public directory', async () => {
  const invalid = { exitCode: undefined, stderr: { write() {} } };
  await main([], { processRef: invalid });
  assert.equal(invalid.exitCode, 2);

  const missing = { exitCode: undefined, stderr: { write() {} } };
  await main(['--dir', 'missing'], { processRef: missing, exists: async () => false });
  assert.equal(missing.exitCode, 2);
});
