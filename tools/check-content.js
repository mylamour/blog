#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { loadTrackedInventory } = require('../lib/content-inventory');
const { validateContent } = require('../lib/content-audit');
const { printDiagnostics, exitCodeFor } = require('../lib/diagnostics');

async function main() {
  try {
    const inventory = await loadTrackedInventory(process.cwd());
    const baselinePath = path.resolve(__dirname, '../config/content-baseline.json');
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    const diagnostics = validateContent(inventory, {
      kerywordsBaseline: baseline.kerywords
    });
    printDiagnostics(diagnostics);
    process.exitCode = exitCodeFor(diagnostics);
  } catch (error) {
    process.stderr.write(`check-content: ${error && error.message ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
