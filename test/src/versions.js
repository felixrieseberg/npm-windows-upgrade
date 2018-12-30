const mockery = require('mockery')

describe('Versions', () => {
  let execReturnValue

  const cpMock = {
    exec(_cmd, _cb) {
      passedCmd = _cmd
      _cb(null, execReturnValue)
    }
  }

  afterEach(() => {
    mockery.deregisterAll()
    mockery.disable()
    passedCmd = undefined
    execReturnValue = undefined
  })

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    })
  })

  it('getInstalledNPMVersion() should resolve with the installed npm version', (done) => {
    execReturnValue = 'v1.0.0'
    mockery.registerMock('child_process', cpMock)
    const versions = require('../../src/versions')

    versions.getInstalledNPMVersion()
      .then(result => {
        result.should.be.equal('v1.0.0')
        done()
      })
      .catch(err => console.log(err))
  })

  it('getAvailableNPMVersions() should resolve with available versions', (done) => {
    execReturnValue = '["v1.0.0", "v2.0.0"]'
    mockery.registerMock('child_process', cpMock)
    const versions = require('../../src/versions')

    versions.getAvailableNPMVersions()
      .then(result => {
        result.should.be.deep.equal(['v1.0.0', 'v2.0.0'])
        done()
      })
      .catch(err => console.log(err))
  })

  it('getLatestNPMVersion() should resolve with the latest available versions', (done) => {
    execReturnValue = '\nv3.0.0\n'
    mockery.registerMock('child_process', cpMock)
    const versions = require('../../src/versions')

    versions.getLatestNPMVersion()
      .then(result => {
        result.should.be.equal('v3.0.0')
        done()
      })
      .catch(err => console.log(err))
  })
})
