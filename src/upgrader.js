const { Spinner } = require('cli-spinner')
const chalk = require('chalk')
const inquirer = require('inquirer')

const powershell = require('./powershell')
const utils = require('./utils')
const strings = require('./strings')
const versions = require('./versions')
const findNpm = require('./find-npm')
const debug = require('./debug')

class Upgrader {
  constructor (program) {
    this.options = program

    if (this.options.prompt === false) {
      this.options.spinner = false
    }
  }

  /**
   * Executes the upgrader's "let's check the user's internet" logic,
   * eventually quietly resolving or quitting the process with an
   * error if the connection is not sufficient
   */
  async ensureInternet () {
    if (this.options.dnsCheck !== false) {
      const isOnline = await utils.checkInternetConnection()

      if (!isOnline) {
        utils.exit(1, strings.noInternet)
      }
    }
  }

  /**
   * Executes the upgrader's "let's check the user's powershell execution
   * policy" logic, eventually quietly resolving or quitting the process
   * with an error if the policy is not sufficient
   */
  async ensureExecutionPolicy () {
    if (this.options.executionPolicyCheck !== false) {
      try {
        const isExecutable = await utils.checkExecutionPolicy()

        if (!isExecutable) {
          utils.exit(1, strings.noExecutionPolicy)
        }
      } catch (err) {
        utils.exit(1, strings.executionPolicyCheckError, err)
      }
    }
  }

  /**
   * Checks if the upgrade was successful
   *
   * @return {boolean} - was the upgrade successful?
   */
  async wasUpgradeSuccessful () {
    this.installedVersion = await versions.getInstalledNPMVersion()
    return (this.installedVersion === this.options.npmVersion)
  }

  /**
   * Executes the upgrader's "let's have the user choose a version" logic
   */
  async chooseVersion () {
    if (!this.options.npmVersion) {
      const availableVersions = await versions.getAvailableNPMVersions()
      const versionList = [{
        type: 'list',
        name: 'version',
        message: 'Which version do you want to install?',
        choices: availableVersions.reverse()
      }]

      this.options.npmVersion = await inquirer.prompt(versionList)
        .then(answer => answer.version)
    }

    if (this.options.npmVersion === 'latest') {
      this.options.npmVersion = await versions.getLatestNPMVersion()
    }
  }

  /**
   * Executes the upgrader's "let's find npm" logic
   */
  async choosePath () {
    try {
      const npmPaths = await findNpm(this.options.npmPath)

      this.log(npmPaths.message)
      this.options.npmPath = npmPaths.path

      debug(`Upgrader: Chosen npm path: ${this.options.npmPath}`)
    } catch (err) {
      utils.exit(1, err)
    }
  }

  /**
   * Attempts a simple upgrade, eventually calling npm install -g npm
   *
   * @param {string} version - Version that should be installed
   * @private
   */
  async upgradeSimple () {
    this.spinner = new Spinner(`${strings.startingUpgradeSimple} %s`)

    if (this.options.spinner === false) {
      console.log(strings.startingUpgradeSimple)
    } else {
      this.spinner.start()
    }

    const output = await powershell.runSimpleUpgrade(this.options.npmVersion)

    this.spinner.stop(false)
    console.log('\n')

    if (output.error) {
      throw output.error
    }
  }

  /**
   * Upgrades npm in the correct directory, securing and reapplying
   * existing configuration
   *
   * @param  {string} version - Version that should be installed
   * @param  {string} npmPath - Path where npm should be installed
   * @private
   */
  async upgradeComplex () {
    this.spinner = new Spinner(`${strings.startingUpgradeComplex} %s`)

    if (this.options.spinner === false) {
      console.log(strings.startingUpgradeComplex)
    } else {
      this.spinner.start()
    }

    const output = await powershell.runUpgrade(this.options.npmVersion, this.options.npmPath)

    this.spinner.stop(false)
    console.log('\n')

    // If we failed to elevate to administrative rights, we have to abort.
    if (output.stdout[0] && output.stdout[0].includes('NOTADMIN')) {
      utils.exit(1, strings.noAdmin)
    }
  }

  /**
   * Executes the full upgrade flow
   */
  upgrade () {
    debug('Starting upgrade')

    return this.upgradeComplex()
      .then(() => this.wasUpgradeSuccessful())
      .then((isDone) => {
        if (isDone) {
          // Awesome, the upgrade worked!
          utils.exit(0, strings.upgradeFinished(this.installedVersion))
        } else {
          return this.upgradeSimple()
        }
      })
      .then(() => this.wasUpgradeSuccessful())
      .then((isDone) => {
        if (isDone) {
          // Awesome, the upgrade worked!
          utils.exit(0, strings.upgradeFinished(this.installedVersion))
        } else {
          this.logUpgradeFailure()
        }
      })
      .catch((err) => console.log(err))
  }

  /**
   * Logs a message to console, unless the user specified quiet mode
   *
   * @param {string} message - message to log
   * @private
   */
  log (message) {
    if (!this.options.quiet) {
      console.log(message)
    }
  }

  /**
   * If the whole upgrade failed, we use this method to log a
   * detailed trace with versions - all to make it easier for
   * users to create meaningful issues.
   *
   * @param errors {array} - AS many errors as found
   */
  logUpgradeFailure (...errors) {
    // Uh-oh, something didn't work as it should have.
    versions.getVersions().then((debugVersions) => {
      let info

      if (this.options.npmVersion && this.installedVersion) {
        info = `You wanted to install npm ${this.options.npmVersion}, but the installed version is ${this.installedVersion}.\n\n`
        info += 'A common reason is an attempted "npm install npm" or "npm upgrade npm". '
        info += 'As of today, the only solution is to completely uninstall and then reinstall Node.js. '
        info += 'For a small tutorial, please see https://github.com/felixrieseberg/npm-windows-upgrade#usage.\n'
      } else if (this.options.npmVersion) {
        info = `You wanted to install npm ${this.options.npmVersion}, but we could not confirm that the installation succeeded.`
      } else {
        info = 'We encountered an error during installation.\n'
      }

      info += '\nPlease consider reporting your trouble to https://aka.ms/npm-issues.'

      console.log(chalk.red(info))
      console.log(chalk.bold('\nDebug Information:\n'))
      console.log(debugVersions)

      if (errors && errors.length && errors.length > 0) console.log('Here is the error:')

      // If we just got an error string (we shouldn't handle that)
      if (typeof errors !== 'string') {
        console.log('\n' + errors + '\n')
        return process.exit(1)
      }

      for (let i = 0; i < errors.length; i++) {
        console.log('\n' + errors[i] + '\n')
      }

      setTimeout(() => {
        process.exit(1)
      }, 1000)
    })
  }
}

module.exports = Upgrader
