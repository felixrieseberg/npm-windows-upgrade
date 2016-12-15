'use strict'

const path = require('path')
const mockery = require('mockery')
const ChildProcessMock = require('../fixtures/child_process')

describe('Powershell', () => {
  let passedArgs
  let passedProcess

  const cpMock = {
    spawn(_process, _args) {
      passedProcess = _process
      passedArgs = _args

      return new ChildProcessMock({
        stdout: 'All done!'
      })
    }
  }

  before(() => process.env.quiet = true)

  afterEach(() => {
    mockery.deregisterAll()
    mockery.disable()
    passedArgs = undefined
    passedProcess = undefined
  })

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    })
  })

  it('should attempt to attempt to execute an upgrade using the script', (done) => {
    const fsMock = {
      accessSync: () => true
    }

    mockery.registerMock('child_process', cpMock)
    const ps1 = require('../../lib/powershell')

    ps1.runUpgrade('v1.0.0', 'C://test//path')
      .then(() => {
        const expectedScriptPath = path.resolve(__dirname, '../../powershell/upgrade-npm.ps1')
        const expectedProcess = 'powershell.exe'
        const expectedPsArgs = `& {& '${expectedScriptPath}' -version 'v1.0.0' -NodePath 'C://test//path' }`
        const expectedArgs = ['-NoProfile', '-NoLogo', expectedPsArgs]

        passedProcess.should.be.equal(expectedProcess)
        passedArgs.should.be.deep.equal(expectedArgs)

        done()
      })
      .catch(err => console.log(err))
  })

  it('should attempt to attempt to execute an simple upgrade', (done) => {
    const fsMock = {
      accessSync: () => true
    }

    mockery.registerMock('child_process', cpMock)
    const ps1 = require('../../lib/powershell')

    ps1.runSimpleUpgrade('v1.0.0')
      .then(() => {
        const expectedScriptPath = path.resolve(__dirname, '../../powershell/upgrade-npm.ps1')
        const expectedProcess = 'powershell.exe'
        const expectedPsArgs = 'npm install -g npm@v1.0.0'
        const expectedArgs = ['Bypass', '-NoProfile', '-NoLogo', expectedPsArgs]

        passedProcess.should.be.equal(expectedProcess)
        passedArgs.should.be.deep.equal(expectedArgs)

        done()
      })
      .catch(err => console.log(err))
  })
})
