const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const utils = require('./utils')
const debug = require('./debug')
const strings = require('./strings')

/**
 * Attempts to get npm's path by calling out to "npm config"
 *
 * @returns {Promise.<string>} - Promise that resolves with the found path (or null if not found)
 */
function _getPathFromNpm () {
  return new Promise((resolve) => {
    exec('npm config --global get prefix', (err, stdout) => {
      if (err) {
        resolve(null)
      } else {
        const npmPath = stdout.replace(/\n/, '')
        debug(`PowerShell: _getPathFromNpm() resolving with: ${npmPath}`)
        resolve(npmPath)
      }
    })
  })
}

/**
 * Attempts to get npm's path by calling out to "Get-Command npm"
 *
 * @returns {Promise.<string>} - Promise that resolves with the found path (or null if not found)
 */
function _getPathFromPowerShell () {
  return new Promise(resolve => {
    const psArgs = 'Get-Command npm | Select-Object -ExpandProperty Definition'
    const args = [ '-NoProfile', '-NoLogo', psArgs ]
    const child = spawn('powershell.exe', args)

    let stdout = []
    let stderr = []

    child.stdout.on('data', (data) => {
      debug(`PowerShell: Stdout received: ${data.toString()}`)
      stdout.push(data.toString())
    })

    child.stderr.on('data', (data) => {
      debug(`PowerShell: Stderr received: ${data.toString()}`)
      stderr.push(data.toString())
    })

    child.on('exit', () => {
      const cmdPath = (stdout[0] && stdout[0].trim) ? stdout[0].trim() : null

      if (stderr.length === 0 && cmdPath && cmdPath.slice(cmdPath.length - 7) === 'npm.cmd') {
        // We're probably installed in a location like C:\Program Files\nodejs\npm.cmd,
        // meaning that we should not use the global prefix installation location
        const npmPath = cmdPath.slice(0, cmdPath.length - 8)
        debug(`PowerShell: _getPathFromPowerShell() resolving with: ${npmPath}`)
        resolve(npmPath)
      } else {
        resolve(null)
      }
    })

    child.stdin.end()
  })
}

/**
 * Attempts to get the current installation location of npm by looking up the global prefix.
 * Prefer PowerShell, be falls back to npm's opinion
 *
 * @return {Promise.<string>} - NodeJS installation path
 */
function _getPath () {
  return Promise.all([_getPathFromPowerShell(), _getPathFromNpm()])
    .then((results) => {
      const fromNpm = results[1] || ''
      const fromPowershell = results[0] || ''

      // Quickly check if there's an npm folder in there
      const fromPowershellPath = path.join(fromPowershell, 'node_modules', 'npm')
      const fromNpmPath = path.join(fromNpm, 'node_modules', 'npm')
      const isFromPowershell = utils.isPathAccessible(fromPowershellPath)
      const isFromNpm = utils.isPathAccessible(fromNpmPath)

      // Found in...
      // Powershell: -> return powershell path
      // npm:        -> return npm path
      // nowhere:    -> return powershell path
      if (isFromPowershell) {
        return {
          path: fromPowershell,
          message: strings.npmFoundIn(fromPowershell, fromNpm, fromPowershell)
        }
      } else if (isFromNpm) {
        return {
          path: fromNpm,
          message: strings.npmFoundIn(fromPowershell, fromNpm, fromNpm)
        }
      } else {
        return {
          path: fromPowershell,
          message: strings.npmNotFoundGuessing(fromPowershell, fromNpm, fromPowershell)
        }
      }
    })
}

/**
 * Attempts to get npm's path by calling out to "npm config"
 *
 * @param  {string} npmPath - Input path if given by user
 * @returns {Promise.<string>}
 */
function _checkPath (npmPath) {
  return new Promise((resolve, reject) => {
    if (npmPath) {
      fs.lstat(npmPath, (err, stats) => {
        if (err || !stats || (stats.isDirectory && !stats.isDirectory())) {
          reject(new Error(strings.givenPathNotValid(npmPath)))
        } else {
          resolve({
            path: npmPath,
            message: strings.givenPathValid(npmPath)
          })
        }
      })
    } else {
      reject(new Error('Called _checkPath() with insufficient parameters'))
    }
  })
}

/**
 * Finds npm - either by checking a given path, or by
 * asking the system for the location
 *
 * @param {string} npmPath - Input path if given by user
 * @returns {Promise.<string>}
 */
function findNpm (npmPath) {
  if (npmPath) {
    return _checkPath(npmPath)
  } else {
    return _getPath()
  }
}

module.exports = findNpm
