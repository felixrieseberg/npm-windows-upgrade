const chai = require('chai')
const mockery = require('mockery')

chai.should()
mockery.enable({ warnOnUnregistered: false })

// Run tests
require('./lib/debug')
require('./lib/find-npm')
require('./lib/powershell')
require('./lib/utils')
require('./lib/versions')
require('./lib/upgrader')
