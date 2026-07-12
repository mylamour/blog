#!/usr/bin/env node
'use strict';

const os = require('node:os');
const path = require('node:path');
const { execFile, spawn } = require('node:child_process');
const { mkdtemp, rm } = require('node:fs/promises');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

function runCheck(script, cwd, env) {
  return new Promise((resolve) => {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npm, ['run', script], {
      cwd,
      env,
      stdio: 'inherit'
    });
    child.once('error', (error) => {
      process.stderr.write(`check:pre-commit: Unable to run ${script}: ${error.message}\n`);
      resolve(2);
    });
    child.once('close', (code, signal) => {
      resolve(code === 0 && !signal ? 0 : (Number.isInteger(code) ? code : 1));
    });
  });
}

async function createIndexSnapshot(root) {
  const snapshot = await mkdtemp(path.join(os.tmpdir(), 'pre-commit-check-'));
  await execFileAsync('git', ['checkout-index', '--all', `--prefix=${snapshot}${path.sep}`], {
    cwd: root
  });
  const { stdout } = await execFileAsync('git', ['rev-parse', '--absolute-git-dir'], {
    cwd: root,
    encoding: 'utf8'
  });
  return { directory: snapshot, gitDirectory: stdout.trim() };
}

async function main() {
  const root = process.cwd();
  let snapshot;
  try {
    snapshot = await createIndexSnapshot(root);
    const environment = {
      ...process.env,
      GIT_DIR: snapshot.gitDirectory,
      GIT_WORK_TREE: snapshot.directory,
      NODE_PATH: [path.join(root, 'node_modules'), process.env.NODE_PATH]
        .filter(Boolean)
        .join(path.delimiter),
      VERIFY_BASE_SHA: 'HEAD',
      VERIFY_STAGED: '1'
    };
    const contentCode = await runCheck('check:content', snapshot.directory, environment);
    const translationCode = await runCheck('check:translations', snapshot.directory, environment);
    process.exitCode = contentCode || translationCode;
  } catch (error) {
    process.stderr.write(`check:pre-commit: ${error && error.message ? error.message : String(error)}\n`);
    process.exitCode = 2;
  } finally {
    if (snapshot) await rm(snapshot.directory, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
