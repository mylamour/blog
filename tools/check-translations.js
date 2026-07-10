#!/usr/bin/env node
'use strict';

const {
  loadTrackedInventory,
  listGitChanges
} = require('../lib/content-inventory');
const {
  validateTranslationStructure,
  validateTranslationDiff
} = require('../lib/content-audit');
const { printDiagnostics, exitCodeFor } = require('../lib/diagnostics');

async function main() {
  try {
    const root = process.cwd();
    const inventory = await loadTrackedInventory(root);
    const diagnostics = validateTranslationStructure(inventory);
    const base = process.env.VERIFY_BASE_SHA;
    if (typeof base === 'string' && base.length > 0) {
      const changes = await listGitChanges(root, base);
      diagnostics.push(...validateTranslationDiff(inventory, changes));
    }
    printDiagnostics(diagnostics);
    process.exitCode = exitCodeFor(diagnostics);
  } catch (error) {
    process.stderr.write(`check-translations: ${error && error.message ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
