#! /usr/bin/env node

// Check for incompatibilities
require('../lib/compatible')

// Proceed
require('babel-polyfill')

var program = require('commander')
var pack = require('../package.json')
var Upgrader = require('../lib/upgrader')

program
  .version(pack.version)
  .option('-d, --no-dns-check', 'Disable the internet connectivity test')
  .option('-p, --no-spinner', 'Disable the spinner animation')
  .option('-e, --no-execution-policy-check', 'Disable the PowerShell execution policy test')
  .option('-n, --npm-path <path>', '(Optional) If passed, npm will be upgraded in the specified location')
  .option('-v, --npm-version <version>', '(Optional) If passed, npm will be upgraded/downgraded to the specified version')
  .option('--quiet', 'No output')
  .option('--no-prompt', '[Deprecated] Use --no-spinner instead')
  .parse(process.argv)

console.log('npm-windows-upgrade v' + pack.version)

// Execute
var upgrader = new Upgrader(program)

upgrader.ensureExecutionPolicy()
  .then(function () { return upgrader.ensureInternet() })
  .then(function () { return upgrader.chooseVersion() })
  .then(function () { return upgrader.choosePath() })
  .then(function () { return upgrader.upgrade() })
