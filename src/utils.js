const TPromise = require('promise')
const fs = require('fs')
const spawn = require('child_process').spawn

// Internal Modules
const debug = require('./debug')

/**
 * Exits the process with a given status,
 * logging a given message before exiting.
 *
 * @param {number} status - exit status
 * @param {string} messages - message to log
 */
function exit (status, ...messages) {
  if (messages) {
    messages.forEach(message => console.log(message))
  }

  process.exit(status)
}

/**
 * Checks for an active Internet connection by doing a DNS lookup of Microsoft.com.
 *
 * @return {Promise.<boolean>} - True if lookup succeeded (or if we skip the test)
 */
function checkInternetConnection () {
  return new TPromise((resolve) => {
    require('dns').lookup('microsoft.com', (err) => {
      if (err && err.code === 'ENOTFOUND') {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * Checks the current Windows PS1 execution policy. The upgrader requires an unrestricted policy.
 *
 * @return {Promise.<boolean>} - True if unrestricted, false if it isn't
 */
function checkExecutionPolicy () {
  return new TPromise((resolve, reject) => {
    let output = []
    let unrestricted
    let child

    try {
      debug('Powershell: Attempting to spawn PowerShell child')
      child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', 'Get-ExecutionPolicy'])
    } catch (error) {
      debug('Powershell: Could not spawn PowerShell child')
      reject(error)
    }

    child.stdout.on('data', (data) => {
      debug('PowerShell: Stdout received: ' + data.toString())
      output.push(data.toString())
    })

    child.stderr.on('data', (data) => {
      debug('PowerShell: Stderr received: ' + data.toString())
      output.push(data.toString())
    })

    child.on('exit', () => {
      unrestricted = !!(output.filter((line) => line.includes('Unrestricted')))

      if (!unrestricted) {
        debug('PowerShell: Resolving restricted (false)')
        resolve(false)
      } else {
        debug('PowerShell: Resolving unrestricted (true)')
        resolve(true)
      }
    })

    child.stdin.end()
  })
}

/**
 * Checks if a path exists
 *
 * @param filePath - file path to check
 * @returns {boolean} - does the file path exist?
 */
function isPathExists (filePath) {
  try {
    fs.accessSync(filePath)
    debug(`Utils: isPathExists(): ${filePath} exists`)
    return true
  } catch (err) {
    debug(`Utils: isPathExists(): ${filePath} does not exist`)
    return false
  }
}

module.exports = {
  checkInternetConnection,
  checkExecutionPolicy,
  exit,
  isPathExists
}
