const chai = require('chai')
const mockery = require('mockery')

chai.should()
mockery.enable({ warnOnUnregistered: false })

// Run tests
require('./src/debug')
require('./src/find-npm')
require('./src/powershell')
require('./src/utils')
require('./src/versions')
require('./src/upgrader')
