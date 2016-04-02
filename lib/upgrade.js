'use strict';

// Upgrade Functions

/**
 * Attempts a simple upgrade, eventually calling npm install -g npm
 * @param  {string} version - Version that should be installed
 */

var simpleUpgrade = function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(version) {
        var spinner;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        spinner = void 0;


                        if (program.prompt) {
                            spinner = new Spinner('Upgrading (fallback method)... %s');
                            spinner.start();
                        } else {
                            console.log('Starting upgrade (fallback method)...');
                        }

                        powershell.runSimpleUpgrade(version).then(function () {
                            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(output) {
                                var installedVersion, info;
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                if (spinner) spinner.stop();

                                                if (!output.error) {
                                                    _context.next = 3;
                                                    break;
                                                }

                                                return _context.abrupt('return', logError([output.error]));

                                            case 3:
                                                _context.next = 5;
                                                return versions.getInstalledNPMVersion();

                                            case 5:
                                                installedVersion = _context.sent;

                                                if (!(installedVersion === version)) {
                                                    _context.next = 9;
                                                    break;
                                                }

                                                // Awesome, the upgrade worked!
                                                info = 'Upgrade finished. Your new npm version is ' + installedVersion + '. Have a nice day!';
                                                return _context.abrupt('return', console.log(chalk.bold.green(info)));

                                            case 9:
                                                return _context.abrupt('return', logError([], version, installedVersion));

                                            case 10:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, this);
                            }));

                            function handleOutput(_x2) {
                                return ref.apply(this, arguments);
                            }

                            return handleOutput;
                        }());

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function simpleUpgrade(_x) {
        return ref.apply(this, arguments);
    };
}();

/**
 * The actual upgrade method, utilizing all the helper methods above
 * @param  {string} version - Version that should be installed
 * @param  {string} npmPath - Path where npm should be installed
 */


var upgrade = function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(version, npmPath) {
        var spinner;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        spinner = void 0;


                        if (program.prompt) {
                            spinner = new Spinner('Upgrading... %s');
                            spinner.start();
                        } else {
                            console.log('Starting upgrade...');
                        }

                        npmpathfinder(npmPath).then(function (confirmedPath) {
                            powershell.runUpgrade(version, confirmedPath).then(function () {
                                var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(output) {
                                    var _info, installedVersion, _info2;

                                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                        while (1) {
                                            switch (_context3.prev = _context3.next) {
                                                case 0:
                                                    if (program.prompt) spinner.stop(false);
                                                    console.log('\n');

                                                    // If we failed to elevate to administrative rights, we have to abort.

                                                    if (!(output.stdout[0] && output.stdout[0].indexOf('Please restart this script from an administrative PowerShell!') > -1)) {
                                                        _context3.next = 6;
                                                        break;
                                                    }

                                                    _info = 'NPM cannot be upgraded without administrative rights. To run PowerShell as Administrator,\n';

                                                    _info += 'right-click PowerShell and select \'Run as Administrator\'.';
                                                    return _context3.abrupt('return', console.log(chalk.bold.red(_info)));

                                                case 6:
                                                    _context3.next = 8;
                                                    return versions.getInstalledNPMVersion();

                                                case 8:
                                                    installedVersion = _context3.sent;

                                                    if (!(installedVersion === version)) {
                                                        _context3.next = 12;
                                                        break;
                                                    }

                                                    // Awesome, the upgrade worked!
                                                    _info2 = 'Upgrade finished. Your new npm version is ' + installedVersion + '. Have a nice day!';
                                                    return _context3.abrupt('return', console.log(chalk.bold.green(_info2)));

                                                case 12:

                                                    // Uh-oh, something didn't work as it should have.
                                                    // Let's attempt a last-ditch effort - try npm's upgrade method
                                                    simpleUpgrade(version);

                                                case 13:
                                                case 'end':
                                                    return _context3.stop();
                                            }
                                        }
                                    }, _callee3, this);
                                }));

                                function handleOutput(_x5) {
                                    return ref.apply(this, arguments);
                                }

                                return handleOutput;
                            }()).catch(function (error) {
                                if (spinner) spinner.stop();
                                return logError([error]);
                            });
                        }, function (error) {
                            console.log(chalk.bold.red('\nWe had trouble with the path you specified:\n'));
                            console.log(error + '\n');
                            return;
                        });

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function upgrade(_x3, _x4) {
        return ref.apply(this, arguments);
    };
}();

/**
 * Prepares the upgrade by checking execution policy, internet, and
 * checking for parameters.
 */


var prepareUpgrade = function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(_program) {
        var canExecute, isOnline, availableVersions, versionList;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        debug('Upgrade: Preparing upgrade');

                        // Set program reference
                        program = _program;

                        // Print version
                        console.log(chalk.yellow.bold('npm-windows-upgrade ' + versions.nwuVersion));

                        // Let's make sure that the user wants to upgrade
                        debug('Upgrade: Asking for confirmation');
                        _context5.t0 = program.prompt;

                        if (!_context5.t0) {
                            _context5.next = 9;
                            break;
                        }

                        _context5.next = 8;
                        return askForConfirmation();

                    case 8:
                        _context5.t0 = !_context5.sent;

                    case 9:
                        if (!_context5.t0) {
                            _context5.next = 11;
                            break;
                        }

                        return _context5.abrupt('return');

                    case 11:

                        // Check Execution Policy
                        debug('Upgrade: Checking execution policy');
                        _context5.next = 14;
                        return powershell.checkExecutionPolicy();

                    case 14:
                        canExecute = _context5.sent;


                        debug('Upgrade: canExecute is ' + canExecute);

                        if (!(canExecute.error && canExecute.error.length && canExecute.error.length > 0)) {
                            _context5.next = 21;
                            break;
                        }

                        debug('Upgrade: Execution Policy check failed');
                        console.log(chalk.bold.red('Encountered an error while checking the system\'s execution policy. The error was:'));
                        console.log(canExecute.error);
                        return _context5.abrupt('return');

                    case 21:
                        if (canExecute) {
                            _context5.next = 27;
                            break;
                        }

                        debug('Upgrade: Execution policy insufficient');
                        console.log(chalk.bold.red('Scripts cannot be executed on this system.'));
                        console.log(chalk.green('To fix, run the command below as Administrator in PowerShell and try again:'));
                        console.log(chalk.red('Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force'));
                        return _context5.abrupt('return');

                    case 27:

                        // Check Internet Connection
                        debug('Upgrade: Checking internet connection');
                        _context5.next = 30;
                        return checkForInternet();

                    case 30:
                        isOnline = _context5.sent;

                        if (isOnline) {
                            _context5.next = 35;
                            break;
                        }

                        debug('Upgrade: Internet Check: Offline');
                        console.error(chalk.bold.red('We have trouble connecting to the Internet. Aborting.'));
                        return _context5.abrupt('return');

                    case 35:
                        if (program.npmVersion) {
                            _context5.next = 45;
                            break;
                        }

                        debug('Upgrade: Getting available npm versions from npm');
                        _context5.next = 39;
                        return versions.getAvailableNPMVersions();

                    case 39:
                        availableVersions = _context5.sent;
                        versionList = [{
                            type: 'list',
                            name: 'version',
                            message: 'Which version do you want to install?',
                            choices: availableVersions.reverse()
                        }];


                        debug('Upgrade: Got npm version list, now asking user for selection');
                        inquirer.prompt(versionList, function (answer) {
                            return upgrade(answer.version, program.npmPath);
                        });
                        _context5.next = 46;
                        break;

                    case 45:
                        upgrade(program.npmVersion, program.npmPath);

                    case 46:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function prepareUpgrade(_x6) {
        return ref.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var chalk = require('chalk'),
    inquirer = require('inquirer'),
    regeneratorRuntime = require('regenerator-runtime-only'),
    // eslint-disable-line no-unused-vars
Spinner = require('cli-spinner').Spinner,
    TPromise = require('promise'),


// Internal Modules
versions = require('./versions'),
    powershell = require('./powershell'),
    npmpathfinder = require('./npmpathfinder'),
    debug = require('./debug');

var program = void 0;

// Helper Functions

/**
Logs an error to console and exits the process with status code 1
 * @param  {array} errors - An array with all erros to log
*/
function logError(errors, version, installedVersion) {
    // Uh-oh, something didn't work as it should have.
    versions.getVersions().then(function (debugVersions) {
        var info = void 0;

        if (version && installedVersion) {
            info = 'You wanted to install npm ' + version + ', but the installed version is ' + installedVersion + '.\n';
            info += '\n';
            info += 'A common reason is an attempted "npm install npm" or "npm upgrade npm".';
            info += 'As of today, the only solution is to completely uninstall and then reinstall Node.js.';
            info += 'For a small tutorial, please see http://aka.ms/fix-npm-upgrade.\n';
        } else if (version) {
            info = 'You wanted to install npm ' + version + ', but we could not confirm that the installation succeeded.\n';
        } else {
            info = 'We encountered an error during installation.\n';
        }

        info += 'Please consider reporting your trouble to http://aka.ms/npm-issues.';

        console.log(chalk.red(info));

        console.log(chalk.bold('\nDebug Information:\n'));
        console.log(debugVersions);

        if (errors && errors.length && errors.length > 0) console.log('Here is the error:');

        // If we just got an error string (we shouldn't, handle that)
        if (typeof errors !== 'string') {
            console.log('\n' + errors + '\n');
            return process.exit(1);
        }

        for (var i = 0; i < errors.length; i++) {
            console.log('\n' + errors[i] + '\n');
        }

        setTimeout(function () {
            process.exit(1);
        }, 1000);
    });
}
/**
 * Prints helpful information to console
 */
function displayHelp() {
    var help = chalk.yellow.bold('  Automatically upgrade npm on Windows. Made with <3 for npm and Node by Microsoft.\n');
    help += '  All parameters optional. Version ' + versions.nwuVersion + '\n';

    console.log(help);
}

/**
 * Asks the user for confirmation whether or not he/she wants to upgrade
 */
function askForConfirmation() {
    return new TPromise(function (resolve) {
        inquirer.prompt({
            type: 'confirm',
            name: 'c',
            message: 'This tool will upgrade npm. Do you want to continue?'
        }, function (response) {
            if (!response.c) {
                console.log(chalk.bold.green('Well then, we\'re done here. Have a nice day!'));
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Checks for an active Internet connection by doing a DNS lookup of Microsoft.com
 * @return {boolean} - True if lookup succeeded (or if we skip the test), false if it didn't
 */
function checkForInternet() {
    return new TPromise(function (resolve) {
        for (var i = 1; i < process.argv.length; i = i + 1) {
            if (process.argv[i].indexOf('--no-dns-check') > -1) {
                resolve(true);
            }
        }

        require('dns').lookup('microsoft.com', function (err) {
            if (err && err.code === 'ENOTFOUND') {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

module.exports = {
    prepareUpgrade: prepareUpgrade,
    displayHelp: displayHelp
};