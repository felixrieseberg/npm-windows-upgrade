const exec = require('child_process').exec
const nwuVersion = require('../package.json').version

/**
 * Gets the currently installed version of npm (npm -v)
 * @return {Promise.<string>} - Installed version of npm
 */
function getInstalledNPMVersion () {
  return new Promise((resolve, reject) => {
    let nodeVersion

    exec('npm -v', (err, stdout) => {
      if (err) {
        reject(new Error('Could not determine npm version.'))
      } else {
        nodeVersion = stdout.replace(/\n/, '')
        resolve(nodeVersion)
      }
    })
  })
}

/**
 * Fetches the published versions of npm from the npm registry
 * @return {Promise.<versions[]>} - Array of the available versions
 */
function getAvailableNPMVersions () {
  return new Promise((resolve, reject) => {
    exec('npm view npm versions --json', (err, stdout) => {
      if (err) {
        let error = 'We could not show latest available versions. Try running this script again '
        error += 'with the version you want to install (npm-windows-upgrade --npm-version 3.0.0)'
        return reject(error)
      }

      resolve(JSON.parse(stdout))
    })
  })
}

/**
 * Fetches the published versions of npm from the npm registry
 * @return {Promise.<version>} - Array of the available versions
 */
function getLatestNPMVersion () {
  return new Promise((resolve, reject) => {
    exec('npm show npm version', (err, stdout) => {
      if (err) {
        let error = 'We could not show latest available versions. Try running this script again '
        error += 'with the version you want to install (npm-windows-upgrade --npm-version 3.0.0)'
        return reject(error)
      }

      let latest = stdout.replace(/(\r\n|\n|\r)/gm, '')

      resolve(latest.trim())
    })
  })
}

/**
 * Get the current name and version of Windows
 */
function _getWindowsVersion () {
  return new Promise((resolve, reject) => {
    const command = 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"'
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

/**
 * Get installed versions of virtually everything important
 */
function getVersions () {
  return new Promise((resolve) => {
    let versions = process.versions
    let prettyVersions = ''
    versions.os = process.platform + ' ' + process.arch

    for (let variable in versions) {
      if (versions.hasOwnProperty(variable)) {
        prettyVersions += `${variable}: ${versions[variable]}`
      }
    }

    _getWindowsVersion()
      .then((windowsVersion) => {
        prettyVersions += windowsVersion.replace(/  +/g, ' ') // eslint-disable-line no-regex-spaces
        resolve(prettyVersions)
      })
  })
}

module.exports = {
  nwuVersion,
  getInstalledNPMVersion,
  getLatestNPMVersion,
  getAvailableNPMVersions,
  getVersions
}
