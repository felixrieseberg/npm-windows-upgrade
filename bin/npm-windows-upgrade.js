#! /usr/bin/env node

// Check for incompatibilities
require('../src/compatible')

const program = require('commander')
const Upgrader = require('../src/upgrader')
const { getInstalledNPMVersion, nwuVersion } = require('../src/versions')

program
  .version(nwuVersion)
  .option('-d, --no-dns-check', 'Disable the internet connectivity test')
  .option('-p, --no-spinner', 'Disable the spinner animation')
  .option('-e, --no-execution-policy-check', 'Disable the PowerShell execution policy test')
  .option('-n, --npm-path <path>', '(Optional) If passed, npm will be upgraded in the specified location')
  .option('-v, --npm-version <version>', '(Optional) If passed, npm will be upgraded/downgraded to the specified version')
  .option('--quiet', 'No output')
  .option('--no-prompt', '[Deprecated] Use --no-spinner instead')
  .parse(process.argv)

const npmVersion = await getInstalledNPMVersion()

console.log('npm v' + npmVersion)
console.log('npm-windows-upgrade v' + nwuVersion)

// Execute
const upgrader = new Upgrader(program)

upgrader.ensureExecutionPolicy()
  .then(function () { return upgrader.ensureInternet() })
  .then(function () { return upgrader.chooseVersion() })
  .then(function () { return upgrader.choosePath() })
  .then(function () { return upgrader.upgrade() })
