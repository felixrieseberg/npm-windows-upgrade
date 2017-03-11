'use strict'

const path = require('path')
const mockery = require('mockery')
const TPromise = require('promise')

const ChildProcessMock = require('../fixtures/child_process')

describe('Upgrader', () => {
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

  it('constructor() should set inquirer options on the instance', () => {
    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({
      spinner: false
    })

    upgrader.options.spinner.should.be.equal.false
  })

  it('ensureInternet() should not exit if there is internet', (done) => {
    const utilsMock = {
      checkInternetConnection: () => new TPromise((resolve) => resolve(true)),
    }

    mockery.registerMock('./utils', utilsMock)

    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({})

    upgrader.ensureInternet()
      .then(() => done())
      .catch(err => console.log(err))
  })

  it('ensureInternet() should exit if there is no internet', (done) => {
    let exitCalled
    const utilsMock = {
      checkInternetConnection: () => new TPromise((resolve) => resolve(false)),
      exit: () => exitCalled = true
    }

    mockery.registerMock('./utils', utilsMock)

    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({})

    upgrader.ensureInternet()
      .then(() => {
        exitCalled.should.be.true
        done()
      })
      .catch(err => console.log(err))
  })

  it('ensureExecutionPolicy() should exit if the policy is insufficient', (done) => {
    let exitCalled
    const utilsMock = {
      checkExecutionPolicy: () => new TPromise((resolve) => resolve(false)),
      exit: () => exitCalled = true
    }

    mockery.registerMock('./utils', utilsMock)

    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({})

    upgrader.ensureExecutionPolicy()
      .then(() => {
        exitCalled.should.be.true
        done()
      })
      .catch(err => console.log(err))
  })

  it('ensureExecutionPolicy() should not exit if the policy is sufficient', (done) => {
    const utilsMock = {
      checkExecutionPolicy: () => new TPromise((resolve) => resolve(true)),
      exit: () => exitCalled = true
    }

    mockery.registerMock('./utils', utilsMock)

    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({})

    upgrader.ensureExecutionPolicy()
      .then(() => done())
      .catch(err => console.log(err))
  })

  it('wasUpgradeSuccessful() returns true if versions match', (done) => {
    const versionsMock = {
      getInstalledNPMVersion: () => new TPromise((resolve) => resolve('v1.0.0')),
    }

    mockery.registerMock('./versions', versionsMock)

    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({ npmVersion: 'v1.0.0' })

    upgrader.wasUpgradeSuccessful()
      .then((result) => {
        result.should.be.true
        done()
      })
      .catch(err => console.log(err))
  })

  it('wasUpgradeSuccessful() returns false if versions do not match', (done) => {
    const versionsMock = {
      getInstalledNPMVersion: () => new TPromise((resolve) => resolve('v1.1.0')),
    }

    mockery.registerMock('./versions', versionsMock)

    const Upgrader = require('../../lib/upgrader')
    const upgrader = new Upgrader({ npmVersion: 'v1.0.0' })

    upgrader.wasUpgradeSuccessful()
      .then((result) => {
        result.should.be.false
        done()
      })
      .catch(err => console.log(err))
  })
})
