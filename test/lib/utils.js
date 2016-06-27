'use strict'

const mockery = require('mockery')
const ChildProcessMock = require('../fixtures/child_process')

describe('Utils', () => {
  afterEach(() => {
    mockery.deregisterAll()
    mockery.disable()
  })

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    })
  })

  describe('exit', () => {
    it('should exit', (done) => {
      const oldExit = process.exit
      process.exit = () => done()

      const utils = require('../../lib/utils')
      utils.exit(0)

      process.exit = oldExit
    })
  })

  describe('checkInternetConnection', () => {
    it('should resolve true if a connection exists', (done) => {
      mockery.registerMock('dns', {
        lookup(domain, cb) {
          cb(null)
        }
      })

      const utils = require('../../lib/utils')

      utils.checkInternetConnection()
        .then((result) => {
          result.should.be.equal.true
          done()
        })
        .catch(err => console.log(err))
    })

    it('should resolve false if a connection does not exists', (done) => {
      mockery.registerMock('dns', {
        lookup(domain, cb) {
          cb({ code: 'ENOTFOUND' })
        }
      })

      const utils = require('../../lib/utils')

      utils.checkInternetConnection()
        .then(result => {
          result.should.be.equal.false
          done()
        })
        .catch(err => console.log(err))
    })
  })

  describe('checkExecutionPolicy', () => {
    it('should resolve true if the policy is sufficient', (done) => {
      const cpMock = {
        spawn(_process, _args) {
          return new ChildProcessMock({
            stdout: 'Unrestricted'
          })
        }
      }

      mockery.registerMock('child_process', cpMock)

      const utils = require('../../lib/utils')

      utils.checkExecutionPolicy()
        .then(result => {
          result.should.be.true
          done()
        })
        .catch(err => console.log(err))
    })

    it('should resolve false if the policy is not sufficient', (done) => {
      const cpMock = {
        spawn(_process, _args) {
          return new ChildProcessMock({
            stdout: 'Restricted'
          })
        }
      }

      mockery.registerMock('child_process', cpMock)

      const utils = require('../../lib/utils')

      utils.checkExecutionPolicy()
        .then(result => {
          result.should.be.false
          done()
        })
        .catch(err => console.log(err))
    })
  })

  describe('isPathExists', () => {
    it('should return true if the path is exists', () => {
      const utils = require('../../lib/utils')
      const thisExists = utils.isPathExists(__dirname)

      thisExists.should.be.equal.true
    })

    it('should return true if the path does not exists', () => {
      const utils = require('../../lib/utils')
      const thisExists = utils.isPathExists('C:\\fake-path\\')

      thisExists.should.be.equal.false
    })
  })
})
