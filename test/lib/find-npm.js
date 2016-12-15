'use strict'

const mockery = require('mockery')
const ChildProcessMock = require('../fixtures/child_process')

describe('Find-Npm', () => {
  let passedArgs
  let passedProcess
  let passedCmd
  let execReturnValue

  const cpMock = {
    spawn(_process, _args) {
      passedProcess = _process
      passedArgs = _args

      return new ChildProcessMock({
        stdout: 'C:\\test-ps1\\nodejs\\npm.cmd'
      })
    },

    exec(_cmd, _cb) {
      passedCmd = _cmd
      _cb(null, execReturnValue)
    }
  }

  before(() => process.env.quiet = true)

  afterEach(() => {
    mockery.deregisterAll()
    mockery.disable()
    passedArgs = undefined
    passedProcess = undefined
    passedCmd = undefined
    execReturnValue = undefined
  })

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    })
  })

  it('should attempt to find a path if none is given', (done) => {
    const fsMock = {
      accessSync: () => true
    }

    mockery.registerMock('child_process', cpMock)
    mockery.registerMock('fs', fsMock)
    const findNpm = require('../../lib/find-npm')
    execReturnValue = 'C:\\test\\'

    findNpm()
      .then(() => {
        const expectedCmd = 'npm config --global get prefix'
        const expectedProcess = 'powershell.exe'
        const expectedPsArgs = 'Get-Command npm | Select-Object -ExpandProperty Definition'
        const expectedArgs = ['-NoProfile', '-NoLogo', expectedPsArgs]

        passedCmd.should.be.equal(expectedCmd)
        passedProcess.should.be.equal(expectedProcess)
        passedArgs.should.be.deep.equal(expectedArgs)

        done()
      })
      .catch(err => console.log(err))
  })

  it(`should remove newlines from npm's output`, (done) => {
    const utilMock = {
      isPathExists: (path) => path.includes('test-npm')
    }

    mockery.registerMock('child_process', cpMock)
    mockery.registerMock('./utils', utilMock)

    const findNpm = require('../../lib/find-npm')
    execReturnValue = 'C:\\test-npm\n'

    findNpm()
      .then(result => {
        const containsOnlyOneNewline = result.message.includes('C:\\test-npm\n\u001b')
        containsOnlyOneNewline.should.be.equal.true
        done()
      })
      .catch(err => console.log(err))
  })

  it(`should prefer PowerShell over npm (if both exist)`, (done) => {
    const fsMock = {
      accessSync: (path) => true
    }

    mockery.registerMock('child_process', cpMock)
    mockery.registerMock('fs', fsMock)
    const utils =require('../../lib/utils')
    const findNpm = require('../../lib/find-npm')
    execReturnValue = 'C:\\test-npm\n'

    findNpm()
      .then(result => {
        result.path.should.equal('C:\\test-ps1\\nodejs')
        done()
      })
      .catch(err => console.log(err))
  })

  it(`should prefer npm over PowerShell (if PowerShell does not exist)`, (done) => {
    const utilMock = {
      isPathExists: (path) => (path.includes('test-npm'))
    }

    mockery.registerMock('child_process', cpMock)
    mockery.registerMock('./utils', utilMock)

    const findNpm = require('../../lib/find-npm')
    execReturnValue = 'C:\\test-npm\n'

    findNpm()
      .then(result => {
        result.path.should.equal('C:\\test-npm')
        done()
      })
      .catch(err => console.log(err))
  })

  it(`should prefer PowerShell (if it can't confirm either)`, (done) => {
    const utilMock = {
      isPathExists: () => false
    }

    mockery.registerMock('child_process', cpMock)
    mockery.registerMock('./utils', utilMock)
	  execReturnValue = 'C:\\test-npm\n'

    const findNpm = require('../../lib/find-npm')

    findNpm()
      .then(result => {
        result.path.should.equal('C:\\test-ps1\\nodejs')
        done()
      })
      .catch(err => console.log(err))
  })

  it(`should check if a given path exists`, (done) => {
    const fsMock = {
      lstat: (path, cb) => cb(null, { isDirectory: () => true })
    }

    mockery.registerMock('fs', fsMock)

    const findNpm = require('../../lib/find-npm')

    findNpm('C:\\test-path')
      .then(result => {
        result.path.should.equal('C:\\test-path')
        done()
      })
      .catch(err => console.log(err))
  })
})
