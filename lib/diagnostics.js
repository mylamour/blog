'use strict';

const path = require('node:path');

function createDiagnostic(severity, code, message, location) {
  return { severity, code, message, location };
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function compareNumbers(left, right) {
  return Number(left || 0) - Number(right || 0);
}

function compareDiagnostics(left, right) {
  const leftLocation = left.location || {};
  const rightLocation = right.location || {};

  return compareText(String(leftLocation.file || ''), String(rightLocation.file || ''))
    || compareNumbers(leftLocation.line, rightLocation.line)
    || compareNumbers(leftLocation.column, rightLocation.column)
    || compareText(String(left.severity || ''), String(right.severity || ''))
    || compareText(String(left.code || ''), String(right.code || ''))
    || compareText(String(left.message || ''), String(right.message || ''));
}

function sortDiagnostics(diagnostics) {
  return [...diagnostics].sort(compareDiagnostics);
}

function formatDiagnostic(diagnostic, cwd = process.cwd()) {
  const location = diagnostic.location || {};
  const file = String(location.file || '<unknown>');
  const displayFile = (path.isAbsolute(file) ? path.relative(cwd, file) : file)
    .split(path.sep)
    .join('/');
  const line = location.line || 1;
  const column = location.column || 1;

  return `${displayFile}:${line}:${column}: ${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}`;
}

function printDiagnostics(diagnostics, streams = process) {
  const cwd = typeof streams.cwd === 'function'
    ? streams.cwd()
    : streams.cwd || process.cwd();
  const output = sortDiagnostics(diagnostics)
    .map((diagnostic) => formatDiagnostic(diagnostic, cwd))
    .join('\n');

  if (output) {
    const stream = streams.stderr || streams.stdout;
    stream.write(`${output}\n`);
  }
}

function exitCodeFor(diagnostics) {
  return diagnostics.some((diagnostic) => diagnostic.severity === 'error') ? 1 : 0;
}

module.exports = {
  createDiagnostic,
  sortDiagnostics,
  formatDiagnostic,
  printDiagnostics,
  exitCodeFor
};
