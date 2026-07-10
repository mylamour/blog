'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');

test('Hexo defaults new content to the supported post layout', () => {
  const config = yaml.load(readFileSync(path.join(root, '_config.yml'), 'utf8'));

  assert.equal(config.default_layout, 'post');
});

test('post scaffold declares the complete supported front-matter schema', () => {
  const source = readFileSync(path.join(root, 'scaffolds/post.md'), 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?$/.exec(source);

  assert.ok(match, 'post scaffold must contain only a YAML front-matter block');
  const data = yaml.load(match[1]
    .replaceAll('{{ title }}', 'Example title')
    .replaceAll('{{ date }}', '2024-02-29 12:00:00'));

  assert.deepEqual(Object.keys(data), [
    'layout',
    'title',
    'date',
    'categories',
    'tags',
    'keywords',
    'translated'
  ]);
  assert.equal(data.layout, 'post');
  assert.equal(data.translated, false);
  assert.equal(Object.prototype.hasOwnProperty.call(data, 'kerywords'), false);
});
