const exec        = require('child_process').exec,
      nwuVersion  = require('../package.json').version,
      TPromise    = require('promise');

/**
 * Gets the currently installed version of npm (npm -v)
 * @return {string}      - Installed version of npm
 */
function getInstalledNPMVersion() {
    return new TPromise((resolve, reject) => {
        let nodeVersion;

        exec('npm -v', (err, stdout) => {
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
    return new TPromise((resolve, reject) => {
        exec('npm view npm versions --json', (err, stdout) => {
            if (err) {
                let error = 'We could not show latest available versions. Try running this script again ';
                error += 'with the version you want to install (npm-windows-upgrade --version:3.0.0)';
                return reject(error);
            }

            resolve(JSON.parse(stdout));
        });
    });
}

/**
 * Get installed versions of virtually everything important
 */
function getVersions() {
    let versions = process.versions;
    versions.npm = require('npm').version;
    versions.os = process.platform + ' ' + process.arch;

    return versions;
}

module.exports = {
    nwuVersion,
    getInstalledNPMVersion,
    getAvailableNPMVersions,
    getVersions
};
