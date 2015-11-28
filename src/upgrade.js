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
async function prepareUpgrade(_program) {
    // Set program reference
    program = _program;

    // Print version
    console.log(chalk.yellow.bold('npm-windows-upgrade ' + versions.nwuVersion));

    // Let's make sure that the user wants to upgrade
    if (program.prompt && !(await askForConfirmation())) return;

    // Check Execution Policy
    let canExecute = await powershell.checkExecutionPolicy();
    if (canExecute.error) {
        console.log(chalk.bold.red('Encountered an error while checking the system\'s execution policy. The error was:'));
        console.log(canExecute.error);
        return;
    }

    if (!canExecute) {
        console.log(chalk.bold.red('Scripts cannot be executed on this system.'));
        console.log(chalk.green('To fix, run the command below as Administrator in PowerShell and try again:'));
        console.log(chalk.red('Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force'));
        return;
    }

    // Check Internet Connection
    let isOnline = await checkForInternet();
    if (!isOnline) {
        return console.error(chalk.bold.red('We have trouble connecting to the Internet. Aborting.'));
    }

    // Let's check our version
    if (!program.npmVersion) {
        let availableVersions = await versions.getAvailableNPMVersions();
        var versionList = [{
            type: 'list',
            name: 'version',
            message: 'Which version do you want to install?',
            choices: availableVersions.reverse()
        }];

        inquirer.prompt(versionList, (answer) => upgrade(answer.version, program.npmPath));
    } else {
        upgrade(program.npmVersion, program.npmPath);
    }
}

/**
 * The actual upgrade method, utilizing all the helper methods above
 * @param  {string} version - Version that should be installed
 * @param  {string} npmPath - Version that should be installed
 */
async function upgrade(version, npmPath) {
    if (program.prompt) {
        var spinner = new Spinner('Upgrading... %s');
        spinner.start();
    } else {
        console.log('Starting upgrade...');
    }

    npmpathfinder(npmPath).then((confirmedPath) => {
        powershell.runUpgrade(version, confirmedPath).then(async function (output) {
            if (program.prompt) spinner.stop(false);
            console.log('\n');

            // If we failed to elevate to administrative rights, we have to abort.
            if (output.stdout[0] && output.stdout[0].indexOf('Please restart this script from an administrative PowerShell!') > -1) {
                let info = 'NPM cannot be upgraded without administrative rights. To run PowerShell as Administrator,\n';
                    info += "right-click PowerShell and select 'Run as Administrator'.";
                return console.log(chalk.bold.red(info));
            }

            // Confirm that the upgrade actually worked
            let installedVersion = await versions.getInstalledNPMVersion();
            if (installedVersion === version) {
                // Awesome, the upgrade worked!
                let info = 'Upgrade finished. Your new npm version is ' + installedVersion + '. Have a nice day!';
                return console.log(chalk.bold.green(info));
            } else {
                // Uh-oh, something didn't work as it should have.
                return logError([output.stderr, stdout]);
            }
        }).catch(function (error) {
            if (spinner) spinner.stop();
            return logError([error]);
        });
    }, (error) => {
        console.log(chalk.bold.red('\nWe had trouble with the path you specified:\n'));
        console.log(error + '\n');
        return;
    });
}

/**
Logs an error to console and exits the process with status code 1
 * @param  {array} errors - An array with all erros to log
*/
function logError(...errors) {
    // Uh-oh, something didn't work as it should have.
    let info = 'You wanted to install npm ' + version + ', but the installed version is' + installedVersion + '.\n';
        info += 'Please consider reporting your trouble to http://aka.ms/npm-issues.';

    console.log(chalk.bold.red(info));
    console.log('Here is the error:');

    // If we just got an error string (we shouldn't, handle that)
    if (!errors.length && typeof errors === 'string') {
        console.log('\n' + errors + '\n');
        return process.exit(1);
    }

    for (let i = 0; i < errors.length; i++) {
        console.log('\n' + errors[i] + '\n');
    }

    return process.exit(1);
}

/**
 * Prints helpful information to console
 */
function displayHelp() {
    let help = chalk.yellow.bold('  Automatically upgrade npm on Windows. Made with <3 for npm and Node by Microsoft.\n');
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
