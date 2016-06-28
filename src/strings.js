const chalk = require('chalk')

module.exports = {
  noInternet: chalk.bold.red('We have trouble connecting to the Internet. Aborting.'),
  noExecutionPolicy: chalk.bold.red('\nScripts cannot be executed on this system.\n') + 'To fix, run the command below as Administrator in PowerShell and try again:\nSet-ExecutionPolicy Unrestricted -Scope CurrentUser -Force',
  noAdmin: chalk.bold.red('\nNPM cannot be upgraded without administrative rights. To run PowerShell as Administrator,\nright-click PowerShell and select \'Run as Administrator\'.'),
  executionPolicyCheckError: 'Encountered an error while checking the system\'s execution policy',
  startingUpgradeSimple: 'Upgrading npm (fallback method)...',
  startingUpgradeComplex: 'Upgrading npm...',
  upgradeFinished: (installedVersion) => chalk.bold.green(`Upgrade finished. Your new npm version is ${installedVersion}. Have a nice day!`),
  npmFoundIn: (ps, npm, truth) => `Checked system for npm installation:\nAccording to PowerShell: ${ps}\nAccording to npm:        ${npm}\n${chalk.bold.green(`Decided that npm is installed in ${truth}`)}`,
  npmNotFoundGuessing: (ps, npm, truth) => `Checked system for npm installation:\nAccording to PowerShell: ${ps}\nAccording to npm: ${npm}\n${chalk.bold.green(`Decided that npm is not installed in either, but attempting to install in ${truth}`)}`,
  givenPathNotValid: (path) => `Given path ${path} is not a valid directory.\nPlease ensure that you added the correct path and try again!`,
  givenPathValid: (path) => `Given path ${path} is a valid directory.`
}
