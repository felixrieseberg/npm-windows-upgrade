'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    TPromise = require('promise');

function _getFromConfig() {
    return new TPromise(function (resolve) {
        exec('npm config --global get prefix', function (err, stdout) {
            if (err) {
                console.log('Could not determine NodeJS location, will default to a Program Files directory.');
                return resolve(null);
            }

            var npmPath = stdout.replace(/\n/, '');
            return resolve(npmPath);
        });
    });
}

function _getFromCommand() {
    return new TPromise(function (resolve) {
        var spawnOptions = ['-NoProfile', '-NoLogo', 'Get-Command npm | Select-Object -ExpandProperty Definition'],
            child = spawn('powershell.exe', spawnOptions);

        var stdout = [],
            stderr = [],
            cmdPath = void 0;

        child.stdout.on('data', function (data) {
            return stdout.push(data.toString());
        });
        child.stderr.on('data', function (data) {
            return stderr.push(data.toString());
        });

        child.on('exit', function () {
            if (stderr.length > 0) {
                return _getFromConfig();
            }

            // Expecting npm.cmd path in stdout[0]
            cmdPath = stdout[0].trim();
            if (cmdPath && cmdPath.slice(cmdPath.length - 7) === 'npm.cmd') {
                // We're probably installed in a location like C:\Program Files\nodejs\npm.cmd,
                // meaning that we should not use the global prefix installation location
                var npmPath = cmdPath.slice(0, cmdPath.length - 8);
                resolve(npmPath);
            } else {
                // We're probably installed in %AppData%, but let's make sure
                _getFromConfig();
            }
        });

        child.stdin.end();
    });
}

/**
 * Attempts to get the current installation location of npm by looking up the global prefix.
 * @param  {string} npmPath - Input path if given by user
 * @return {string}      - NodeJS installation path
 */
module.exports = function get(npmPath) {
    var stats = void 0,
        error = void 0;

    return new TPromise(function (resolve, reject) {
        if (npmPath) {
            try {
                stats = fs.lstatSync(npmPath);
                if (!stats.isDirectory()) {
                    error = 'Given path ' + npmPath + ' is not a valid directory.\n';
                    error += 'Please ensure that you added the correct path and try again!';
                    return reject(error);
                }

                return resolve(npmPath);
            } catch (e) {
                if (e) {
                    error = 'Given path ' + npmPath + ' is not a valid directory.\n';
                    error += 'Please ensure that you added the correct path and try again!';
                    return reject(error);
                }
            }
        }

        _getFromCommand().then(function (result) {
            return resolve(result);
        });
    });
};