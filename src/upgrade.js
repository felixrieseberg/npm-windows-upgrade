'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    RSVP = require('rsvp'),
    path = require('path'),
    chalk = require('chalk'),
    inquirer = require('inquirer'),
    Spinner = require('cli-spinner').Spinner;

// Internal Modules
var versions = require('./versions'),
    powershell = require('./powershell'),
    npmpathfinder = require('./npmpathfinder');

/**
 * Prepares the upgrade by checking execution policy, internet, and
 * checking for parameters.
 */
async function prepareUpgrade() {
    var noPrompt, help, npmPath, chosenVersion;

    // Print version
    console.log(chalk.yellow.bold('npm-windows-upgrade ' + versions.nwuVersion));

    // Check for command line arguments
    for (let i = 1; i < process.argv.length; i = i + 1) {
        noPrompt = process.argv[i].indexOf('--no-prompt') > -1 ? true : noPrompt;
        help = process.argv[i].indexOf('--help') > -1 ? true : help;
        npmPath = process.argv[i].indexOf('--npm-path:') > -1 ? process.argv[i].slice(11) : npmPath;
        chosenVersion = process.argv[i].indexOf('--version:') > -1 ? process.argv[i].slice(10) : chosenVersion;
    }

    // See if the user is just calling for help
    if (help) {
        return displayHelp();
    }

    // Let's make sure that the user wants to upgrade
    if (!noPrompt && !(await askForConfirmation())) {
        return;
    }

    // Check Execution Policy
    let canExecute = await powershell.checkExecutionPolicy();
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
    if (!chosenVersion) {
        let availableVersions = await versions.getAvailableNPMVersions();
        var versionList = [{
            type: 'list',
            name: 'version',
            message: 'Which version do you want to install?',
            choices: availableVersions.reverse()
        }];

        inquirer.prompt(versionList, (answer) => upgrade(answer.version, npmPath));
    } else {
        upgrade(chosenVersion, npmPath);
    }
}

/**
 * The actual upgrade method, utilizing all the helper methods above
 * @param  {string} version - Version that should be installed
 * @param  {string} npmPath - Version that should be installed
 */
async function upgrade(version, npmPath) {
    var spinner = new Spinner('Upgrading... %s');
    spinner.start();

    npmpathfinder(npmPath).then((confirmedPath) => {
        powershell.runUpgrade(version, npmPath).then(async function (output) {
            spinner.stop(false);
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
                info = 'You wanted to install npm ' + version + ', but the installed version is' + installedVersion + '.\n';
                info += 'Please consider reporting your trouble to http://aka.ms/npm-issues.';
                console.log(chalk.bold.red(info));
                console.log('Here is the output from the upgrader script:');
                console.log(stdout, output.stderr);
                return process.exit(1);
            }
        });
    });
}

/**
 * Prints helpful information to console
 */
function displayHelp() {
    let help = '\n';
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
    return new RSVP.Promise(function (resolve, reject) {
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
    return new RSVP.Promise(function (resolve, reject) {
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
