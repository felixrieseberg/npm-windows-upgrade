const d = require('debug')('npm-windows-upgrade')

// Ensure that all output is sent to stdout
debug.log = console.log.bind(console)

function debug (message) {
  return d(message)
}

module.exports = debug
