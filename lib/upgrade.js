'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    inquirer = require('inquirer'),
    Promise = require('promise'),
    regeneratorRuntime = require('regenerator-runtime-only'),
    Spinner = require('cli-spinner').Spinner;

// Internal Modules
var versions = require('./versions'),
    powershell = require('./powershell'),
    npmpathfinder = require('./npmpathfinder');

var program;

/**
 * Prepares the upgrade by checking execution policy, internet, and
 * checking for parameters.
 */
function prepareUpgrade(_program) {
    var canExecute, isOnline, availableVersions, versionList;
    return regeneratorRuntime.async(function prepareUpgrade$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                // Set program reference
                program = _program;

                // Print version
                console.log(chalk.yellow.bold('npm-windows-upgrade ' + versions.nwuVersion));

                // Let's make sure that the user wants to upgrade
                context$1$0.t0 = program.prompt;

                if (!context$1$0.t0) {
                    context$1$0.next = 7;
                    break;
                }

                context$1$0.next = 6;
                return regeneratorRuntime.awrap(askForConfirmation());

            case 6:
                context$1$0.t0 = !context$1$0.sent;

            case 7:
                if (!context$1$0.t0) {
                    context$1$0.next = 9;
                    break;
                }

                return context$1$0.abrupt('return');

            case 9:
                context$1$0.next = 11;
                return regeneratorRuntime.awrap(powershell.checkExecutionPolicy());

            case 11:
                canExecute = context$1$0.sent;

                if (!canExecute.error) {
                    context$1$0.next = 16;
                    break;
                }

                console.log(chalk.bold.red('Encountered an error while checking the system\'s execution policy. The error was:'));
                console.log(canExecute.error);
                return context$1$0.abrupt('return');

            case 16:
                if (canExecute) {
                    context$1$0.next = 21;
                    break;
                }

                console.log(chalk.bold.red('Scripts cannot be executed on this system.'));
                console.log(chalk.green('To fix, run the command below as Administrator in PowerShell and try again:'));
                console.log(chalk.red('Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force'));
                return context$1$0.abrupt('return');

            case 21:
                context$1$0.next = 23;
                return regeneratorRuntime.awrap(checkForInternet());

            case 23:
                isOnline = context$1$0.sent;

                if (isOnline) {
                    context$1$0.next = 26;
                    break;
                }

                return context$1$0.abrupt('return', console.error(chalk.bold.red('We have trouble connecting to the Internet. Aborting.')));

            case 26:
                if (program.npmVersion) {
                    context$1$0.next = 34;
                    break;
                }

                context$1$0.next = 29;
                return regeneratorRuntime.awrap(versions.getAvailableNPMVersions());

            case 29:
                availableVersions = context$1$0.sent;
                versionList = [{
                    type: 'list',
                    name: 'version',
                    message: 'Which version do you want to install?',
                    choices: availableVersions.reverse()
                }];

                inquirer.prompt(versionList, function (answer) {
                    return upgrade(answer.version, program.npmPath);
                });
                context$1$0.next = 35;
                break;

            case 34:
                upgrade(program.npmVersion, program.npmPath);

            case 35:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

/**
 * The actual upgrade method, utilizing all the helper methods above
 * @param  {string} version - Version that should be installed
 * @param  {string} npmPath - Version that should be installed
 */
function upgrade(version, npmPath) {
    var spinner;
    return regeneratorRuntime.async(function upgrade$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (program.prompt) {
                    spinner = new Spinner('Upgrading... %s');

                    spinner.start();
                } else {
                    console.log('Starting upgrade...');
                }

                npmpathfinder(npmPath).then(function (confirmedPath) {
                    powershell.runUpgrade(version, confirmedPath).then(function callee$2$0(output) {
                        var info, installedVersion;
                        return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    if (program.prompt) spinner.stop(false);
                                    console.log('\n');

                                    // If we failed to elevate to administrative rights, we have to abort.

                                    if (!(output.stdout[0] && output.stdout[0].indexOf('Please restart this script from an administrative PowerShell!') > -1)) {
                                        context$3$0.next = 6;
                                        break;
                                    }

                                    info = 'NPM cannot be upgraded without administrative rights. To run PowerShell as Administrator,\n';

                                    info += "right-click PowerShell and select 'Run as Administrator'.";
                                    return context$3$0.abrupt('return', console.log(chalk.bold.red(info)));

                                case 6:
                                    context$3$0.next = 8;
                                    return regeneratorRuntime.awrap(versions.getInstalledNPMVersion());

                                case 8:
                                    installedVersion = context$3$0.sent;

                                    if (!(installedVersion === version)) {
                                        context$3$0.next = 14;
                                        break;
                                    }

                                    info = 'Upgrade finished. Your new npm version is ' + installedVersion + '. Have a nice day!';
                                    return context$3$0.abrupt('return', console.log(chalk.bold.green(info)));

                                case 14:
                                    return context$3$0.abrupt('return', logError([output.stderr, stdout]));

                                case 15:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, this);
                    })['catch'](function (error) {
                        if (spinner) spinner.stop();
                        return logError([error]);
                    });
                }, function (error) {
                    console.log(chalk.bold.red('\nWe had trouble with the path you specified:\n'));
                    console.log(error + '\n');
                    return;
                });

            case 2:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

/**
Logs an error to console and exits the process with status code 1
 * @param  {array} errors - An array with all erros to log
*/
function logError() {
    for (var _len = arguments.length, errors = Array(_len), _key = 0; _key < _len; _key++) {
        errors[_key] = arguments[_key];
    }

    // Uh-oh, something didn't work as it should have.
    var info = 'You wanted to install npm ' + version + ', but the installed version is' + installedVersion + '.\n';
    info += 'Please consider reporting your trouble to http://aka.ms/npm-issues.';

    console.log(chalk.bold.red(info));
    console.log('Here is the error:');

    // If we just got an error string (we shouldn't, handle that)
    if (!errors.length && typeof errors === 'string') {
        console.log('\n' + errors + '\n');
        return process.exit(1);
    }

    for (var i = 0; i < errors.length; i++) {
        console.log('\n' + errors[i] + '\n');
    }

    return process.exit(1);
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
    return new Promise(function (resolve, reject) {
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
    return new Promise(function (resolve, reject) {
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

// Check Execution Policy

// Check Internet Connection

// Let's check our version

// Confirm that the upgrade actually worked

// Awesome, the upgrade worked!

// Uh-oh, something didn't work as it should have.