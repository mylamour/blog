#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { loadTrackedInventory } = require('../lib/content-inventory');
const { printDiagnostics, exitCodeFor } = require('../lib/diagnostics');
const { validateGeneratedSite } = require('../lib/generated-audit');

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!['--site', '--dir'].includes(name) || !value || values[name]) {
      throw new Error('usage: check-generated --site zh|en --dir PATH');
    }
    values[name] = value;
  }
  if (!['zh', 'en'].includes(values['--site']) || !values['--dir']) {
    throw new Error('usage: check-generated --site zh|en --dir PATH');
  }
  return { siteId: values['--site'], publicDir: path.resolve(values['--dir']) };
}

async function main() {
  try {
    const input = parseArguments(process.argv.slice(2));
    const inventory = await loadTrackedInventory(process.cwd());
    const diagnostics = await validateGeneratedSite({ ...input, inventory });
    printDiagnostics(diagnostics);
    process.exitCode = exitCodeFor(diagnostics);
  } catch (cause) {
    process.stderr.write(`check-generated: ${cause.message}\n`);
    process.exitCode = 2;
  }
}

main();
