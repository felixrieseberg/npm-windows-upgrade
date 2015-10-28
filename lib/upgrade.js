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

var noPrompt = false;

/**
 * Prepares the upgrade by checking execution policy, internet, and
 * checking for parameters.
 */
function prepareUpgrade() {
    var help, npmPath, chosenVersion, i, canExecute, isOnline, availableVersions, versionList;
    return regeneratorRuntime.async(function prepareUpgrade$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:

                // Print version
                console.log(chalk.yellow.bold('npm-windows-upgrade ' + versions.nwuVersion));

                // Check for command line arguments
                for (i = 1; i < process.argv.length; i = i + 1) {
                    noPrompt = process.argv[i].indexOf('--no-prompt') > -1 ? true : noPrompt;
                    help = process.argv[i].indexOf('--help') > -1 ? true : help;
                    npmPath = process.argv[i].indexOf('--npm-path:') > -1 ? process.argv[i].slice(11) : npmPath;
                    chosenVersion = process.argv[i].indexOf('--version:') > -1 ? process.argv[i].slice(10) : chosenVersion;
                }

                // See if the user is just calling for help

                if (!help) {
                    context$1$0.next = 4;
                    break;
                }

                return context$1$0.abrupt('return', displayHelp());

            case 4:
                context$1$0.t0 = !noPrompt;

                if (!context$1$0.t0) {
                    context$1$0.next = 9;
                    break;
                }

                context$1$0.next = 8;
                return regeneratorRuntime.awrap(askForConfirmation());

            case 8:
                context$1$0.t0 = !context$1$0.sent;

            case 9:
                if (!context$1$0.t0) {
                    context$1$0.next = 11;
                    break;
                }

                return context$1$0.abrupt('return');

            case 11:
                context$1$0.next = 13;
                return regeneratorRuntime.awrap(powershell.checkExecutionPolicy());

            case 13:
                canExecute = context$1$0.sent;

                if (!canExecute.error) {
                    context$1$0.next = 18;
                    break;
                }

                console.log(chalk.bold.red('Encountered an error while checking the system\'s execution policy. The error was:'));
                console.log(canExecute.error);
                return context$1$0.abrupt('return');

            case 18:
                if (canExecute) {
                    context$1$0.next = 23;
                    break;
                }

                console.log(chalk.bold.red('Scripts cannot be executed on this system.'));
                console.log(chalk.green('To fix, run the command below as Administrator in PowerShell and try again:'));
                console.log(chalk.red('Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force'));
                return context$1$0.abrupt('return');

            case 23:
                context$1$0.next = 25;
                return regeneratorRuntime.awrap(checkForInternet());

            case 25:
                isOnline = context$1$0.sent;

                if (isOnline) {
                    context$1$0.next = 28;
                    break;
                }

                return context$1$0.abrupt('return', console.error(chalk.bold.red('We have trouble connecting to the Internet. Aborting.')));

            case 28:
                if (chosenVersion) {
                    context$1$0.next = 36;
                    break;
                }

                context$1$0.next = 31;
                return regeneratorRuntime.awrap(versions.getAvailableNPMVersions());

            case 31:
                availableVersions = context$1$0.sent;
                versionList = [{
                    type: 'list',
                    name: 'version',
                    message: 'Which version do you want to install?',
                    choices: availableVersions.reverse()
                }];

                inquirer.prompt(versionList, function (answer) {
                    return upgrade(answer.version, npmPath);
                });
                context$1$0.next = 37;
                break;

            case 36:
                upgrade(chosenVersion, npmPath);

            case 37:
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
                if (!noPrompt) {
                    spinner = new Spinner('Upgrading... %s');

                    spinner.start();
                } else {
                    console.log('Starting upgrade...');
                }

                npmpathfinder(npmPath).then(function (confirmedPath) {
                    powershell.runUpgrade(version, confirmedPath).then(function callee$2$0(output) {
                        var _info, installedVersion, _info2;

                        return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    if (!noPrompt) spinner.stop(false);
                                    console.log('\n');

                                    // If we failed to elevate to administrative rights, we have to abort.

                                    if (!(output.stdout[0] && output.stdout[0].indexOf('Please restart this script from an administrative PowerShell!') > -1)) {
                                        context$3$0.next = 6;
                                        break;
                                    }

                                    _info = 'NPM cannot be upgraded without administrative rights. To run PowerShell as Administrator,\n';

                                    _info += "right-click PowerShell and select 'Run as Administrator'.";
                                    return context$3$0.abrupt('return', console.log(chalk.bold.red(_info)));

                                case 6:
                                    context$3$0.next = 8;
                                    return regeneratorRuntime.awrap(versions.getInstalledNPMVersion());

                                case 8:
                                    installedVersion = context$3$0.sent;

                                    if (!(installedVersion === version)) {
                                        context$3$0.next = 14;
                                        break;
                                    }

                                    _info2 = 'Upgrade finished. Your new npm version is ' + installedVersion + '. Have a nice day!';
                                    return context$3$0.abrupt('return', console.log(chalk.bold.green(_info2)));

                                case 14:
                                    // Uh-oh, something didn't work as it should have.
                                    info = 'You wanted to install npm ' + version + ', but the installed version is' + installedVersion + '.\n';
                                    info += 'Please consider reporting your trouble to http://aka.ms/npm-issues.';
                                    console.log(chalk.bold.red(info));
                                    console.log('Here is the output from the upgrader script:');
                                    console.log(stdout, output.stderr);
                                    return context$3$0.abrupt('return', process.exit(1));

                                case 20:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, this);
                    });
                });

            case 2:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
}

/**
 * Prints helpful information to console
 */
function displayHelp() {
    var help = '\n';
    help += 'Default usage: npm-windows-upgrade\n';
    help += '\n';
    help += 'Optional parameters:\n';
    help += '--version (npm version to upgrade to, usage: --version:3.1.0)\n';
    help += '--npm-path (path to upgrade npm in, usage: --npmPath:"C:\\nodejs")\n';
    help += '--no-prompt (bypasses the initial prompt)\n';
    help += '--no-dns-check (bypasses the internet check)\n';

    console.log(chalk.yellow.bold('npm-windows-upgrade ' + versions.nwuVersion));
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
    prepareUpgrade: prepareUpgrade
};

// Let's make sure that the user wants to upgrade

// Check Execution Policy

// Check Internet Connection

// Let's check our version

// Confirm that the upgrade actually worked

// Awesome, the upgrade worked!