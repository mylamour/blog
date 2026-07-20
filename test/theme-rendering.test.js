'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repositoryRoot = path.resolve(__dirname, '..');
const loadScriptTemplate = readFileSync(
  path.join(repositoryRoot, 'themes/fexo2/layout/_partial/load-script.ejs'),
  'utf8'
);
const customCss = readFileSync(
  path.join(repositoryRoot, 'themes/fexo2/source/css/custom.css'),
  'utf8'
);
const itemPostSass = readFileSync(
  path.join(repositoryRoot, 'themes/fexo2/source/sass/component/_item-post.scss'),
  'utf8'
);

function loadIsMermaidSource() {
  const match = /(function isMermaidSource\(source\) \{[\s\S]*?\n  \})\n\n  function loadScript/.exec(loadScriptTemplate);
  assert.ok(match, 'load-script.ejs must define isMermaidSource immediately before loadScript');
  return vm.runInNewContext(`(${match[1]})`);
}

test('recognizes Mermaid after directives and comments', () => {
  const isMermaidSource = loadIsMermaidSource();
  const examples = [
    `%%{init: {'theme':'base'}}%%\nflowchart TB\n  A --> B`,
    `%% explain the diagram\nsequenceDiagram\n  A->>B: hello`,
    `graph LR\n  A --> B`
  ];

  for (const source of examples) {
    assert.equal(isMermaidSource(source), true, source);
  }
});

test('does not treat ordinary plaintext as Mermaid', () => {
  const isMermaidSource = loadIsMermaidSource();
  const examples = [
    'echo flowchart TB',
    '{"graph":"LR"}',
    '%% a comment without a diagram\nplain text',
    'flowcharting is not a Mermaid declaration'
  ];

  for (const source of examples) {
    assert.equal(isMermaidSource(source), false, source);
  }
});

test('recognizes all Mermaid blocks in both latest article sources', () => {
  const isMermaidSource = loadIsMermaidSource();
  const articlePaths = [
    'source/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md',
    'source-en/_posts/2026-07-19-agentic-software-engineering-real-sdlc.md'
  ];

  for (const articlePath of articlePaths) {
    const source = readFileSync(path.join(repositoryRoot, articlePath), 'utf8');
    const blocks = Array.from(source.matchAll(/```mermaid\n([\s\S]*?)```/g), (match) => match[1]);
    assert.equal(blocks.length, 14, articlePath);
    assert.equal(blocks.every(isMermaidSource), true, articlePath);
  }
});

test('shares the wide desktop archive layout without changing mobile limits', () => {
  assert.match(
    customCss,
    /@media screen and \(min-width: 768px\) \{[\s\S]{0,500}\.content\.content-archive[\s\S]{0,200}width: min\(860px, calc\(100vw - 48px\)\);[\s\S]{0,300}\.item-post \.post-title[\s\S]{0,100}max-width: 100%;/
  );
  assert.doesNotMatch(customCss, /html\[lang="en"\] \.content\.content-archive/);
  assert.doesNotMatch(customCss, /html\[lang="en"\] \.item-post \.post-title/);
  assert.match(itemPostSass, /min-width: 400px\) and \(max-width: 500px\)[\s\S]*?max-width: 330px;/);
  assert.match(itemPostSass, /min-width: 320px\) and \(max-width: 399px\)[\s\S]*?max-width: 250px;/);
});
