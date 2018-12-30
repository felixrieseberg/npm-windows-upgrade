const { spawn } = require('child_process')
const path = require('path')

const debug = require('./debug')

/**
 * Executes the PS1 script upgrading npm
 * @param  {string} version - The version to be installed (npm install npm@{version})
 * @param  {string} npmPath - Path to Node installation (optional)
 * @return {Promise.<stderr[], stdout[]>} - stderr and stdout received from the PS1 process
 */
function runUpgrade (version, npmPath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../powershell/upgrade-npm.ps1')
    const psArgs = npmPath === null
      ? `& {& '${scriptPath}' -version '${version}' }`
      : `& {& '${scriptPath}' -version '${version}' -NodePath '${npmPath}' }`
    const args = [ '-ExecutionPolicy', 'Bypass', '-NoProfile', '-NoLogo', psArgs ]

    if (process.env.DEBUG) {
      args.push('-debug')
    }

    let stdout = []
    let stderr = []
    let child

    try {
      child = spawn('powershell.exe', args)
    } catch (error) {
      return reject(error)
    }

    child.stdout.on('data', (data) => {
      debug('PowerShell: Stdout received: ' + data.toString())
      stdout.push(data.toString())
    })

    child.stderr.on('data', (data) => {
      debug('PowerShell: Stderr received: ' + data.toString())
      stderr.push(data.toString())
    })

    child.on('exit', () => resolve({ stderr, stdout }))
    child.stdin.end()
  })
}

/**
 * Executes 'npm install -g npm' upgrading npm
 * @param  {string} version - The version to be installed (npm install npm@{version})
 * @return {Promise.<stderr[], stdout[]>} - stderr and stdout received from the PS1 process
 */
function runSimpleUpgrade (version) {
  return new Promise((resolve) => {
    let npmCommand = (version) ? `npm install -g npm@${version}` : 'npm install -g npm'
    let stdout = []
    let stderr = []
    let child

    try {
      child = spawn('powershell.exe', [ '-NoProfile', '-NoLogo', npmCommand ])
    } catch (error) {
      // This is dirty, but the best way for us to try/catch right now
      resolve({ error })
    }

    child.stdout.on('data', (data) => stdout.push(data.toString()))
    child.stderr.on('data', (data) => stderr.push(data.toString()))

    child.on('exit', () => resolve({ stderr, stdout }))

    child.stdin.end()
  })
}

module.exports = {
  runUpgrade,
  runSimpleUpgrade
}
