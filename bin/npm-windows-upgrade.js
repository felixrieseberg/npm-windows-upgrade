#! /usr/bin/env node

var program = require('commander')
var pack = require('../package.json')
var Upgrader = require('../lib/upgrader')

// Check OS
if (!/^win/.test(process.platform)) {
  throw new Error('This script upgrades npm on Windows, but the OS is not Windows.')
}

program
  .version(pack.version)
  .option('-d, --no-dns-check', 'Disable the internet connectivity 5test')
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
  .then(() => upgrader.ensureInternet())
  .then(() => upgrader.chooseVersion())
  .then(() => upgrader.choosePath())
  .then(() => upgrader.upgrade())
