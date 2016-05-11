'use strict';

var exec = require('child_process').exec,
    nwuVersion = require('../package.json').version,
    TPromise = require('promise');

/**
 * Gets the currently installed version of npm (npm -v)
 * @return {string}      - Installed version of npm
 */
function getInstalledNPMVersion() {
    return new TPromise(function (resolve, reject) {
        var nodeVersion = void 0;

        exec('npm -v', function (err, stdout) {
            if (err) {
                reject('Could not determine npm version.');
            } else {
                nodeVersion = stdout.replace(/\n/, '');
                resolve(nodeVersion);
            }
        });
    });
}

/**
 * Fetches the published versions of npm from the npm registry
 * @return {versions[]}  - Array of the available versions
 */
function getAvailableNPMVersions() {
    return new TPromise(function (resolve, reject) {
        exec('npm view npm versions --json', function (err, stdout) {
            if (err) {
                var error = 'We could not show latest available versions. Try running this script again ';
                error += 'with the version you want to install (npm-windows-upgrade --version:3.0.0)';
                return reject(error);
            }

            resolve(JSON.parse(stdout));
        });
    });
}

/**
 * Fetches the published versions of npm from the npm registry
 * @return {versions[]}  - Array of the available versions
 */
function getLatestNPMVersion() {
    return new TPromise(function (resolve, reject) {
        exec('npm show npm version', function (err, stdout) {
            if (err) {
                var error = 'We could not show latest available versions. Try running this script again ';
                error += 'with the version you want to install (npm-windows-upgrade --version:3.0.0)';
                return reject(error);
            }

            var latest = stdout.replace(/(\r\n|\n|\r)/gm, '');

            resolve(latest.trim());
        });
    });
}

/**
 * Get the current name and version of Windows
 */
function _getWindowsVersion() {
    return new TPromise(function (resolve) {
        var command = 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"';
        exec(command, function (error, stdout) {
            if (stdout) {
                resolve(stdout);
            }
        });
    });
}

/**
 * Get installed versions of virtually everything important
 */
function getVersions() {
    return new TPromise(function (resolve) {
        var versions = process.versions;
        var prettyVersions = '';
        versions.os = process.platform + ' ' + process.arch;

        for (var variable in versions) {
            if (versions.hasOwnProperty(variable)) {
                prettyVersions += variable + ': ' + versions[variable] + '\n';
            }
        }

        _getWindowsVersion().then(function (windowsVersion) {
            prettyVersions += windowsVersion.replace(/  +/g, ' '); // eslint-disable-line no-regex-spaces
            resolve(prettyVersions);
        });
    });
}

module.exports = {
    nwuVersion: nwuVersion,
    getInstalledNPMVersion: getInstalledNPMVersion,
    getLatestNPMVersion: getLatestNPMVersion,
    getAvailableNPMVersions: getAvailableNPMVersions,
    getVersions: getVersions
};