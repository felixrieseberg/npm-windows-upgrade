'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    inquirer = require('inquirer'),
    Promise = require('promise'),
    Spinner = require('cli-spinner').Spinner,
    version = require('../package.json').version;

/**
 * Gets the currently installed version of npm (npm -v)
 * @return {string}      - Installed version of npm
 */
function getInstalledNPMVersion() {
    return new Promise(function (resolve, reject) {
        var nodeVersion;

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
    return new Promise(function (resolve, reject) {
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

module.exports = {
    nwuVersion: version,
    getInstalledNPMVersion: getInstalledNPMVersion,
    getAvailableNPMVersions: getAvailableNPMVersions
};