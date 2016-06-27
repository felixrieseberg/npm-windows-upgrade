'use strict'

const debug = require('../../lib/debug')

describe('Debug', () => {
  it('should log if process.env.debug is set', () => {
    process.env.DEBUG = true

    const oldLog = console.log
    console.log = (msg) => {
      msg.should.be.equal('test')
    }

    debug('test')
    console.log = oldLog
  })

  it('should not log if process.env.debug is not set', () => {
    delete process.env.DEBUG

    const oldLog = console.log
    console.log = (msg) => {
      msg.should.be.equal('not called')
    }

    debug('test')
    console.log = oldLog
  })
});