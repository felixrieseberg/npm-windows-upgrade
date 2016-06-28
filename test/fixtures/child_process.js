'use strict'

const EventEmitter = require('events')

module.exports = class ChildProcessMock extends EventEmitter {
  constructor (options) {
    super()

    this.stdout = {
      on (type, cb) {
        if (options.stdout) {
          cb(options.stdout)
        }
      }
    }

    this.stderr = {
      on (type, cb) {
        if (options.stderr) {
          cb(options.stderr)
        }
      }
    }

    this.stdin = {
      end: () => {
        this.emit('exit', 0)
      }
    }
  }
}
