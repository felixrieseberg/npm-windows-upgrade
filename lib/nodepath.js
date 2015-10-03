'use strict';

var spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    fs = require('fs'),
    RSVP = require('rsvp'),
    path = require('path');

function _getFromConfig(_cb) {
    return new RSVP.Promise(function (resolve, reject) {
        exec('npm config --global get prefix', function (err, stdout) {
            if (err) {
                console.log('Could not determine NodeJS location, will default to a Program Files directory.');
                resolve(null);
            } else {
                nodePath = stdout.replace(/\n/, '');
                resolve(nodePath);
            }
        });
    });
}

function _getFromCommand(_cb) {
    return new RSVP.Promise(function (resolve, reject) {
        var spawnOptions = ['-NoProfile', '-NoLogo', 'Get-Command npm | Select-Object -ExpandProperty Definition'],
            child = spawn('powershell.exe', spawnOptions),
            stdout = [],
            stderr = [],
            cmdPath;

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
                nodePath = cmdPath.slice(0, cmdPath.length - 8);
                return resolve(nodePath);
            } else {
                // We're probably installed in %AppData%, but let's make sure
                return _getFromConfig();
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
module.exports = function getNodePath(npmPath) {
    var nodePath, stats, error;

    return new RSVP.Promise(function (resolve, reject) {
        if (npmPath) {
            try {
                stats = fs.lstatSync(npmPath);
                if (!stats.isDirectory()) {
                    error = 'Given path ' + npmPath + ' is not a valid directory.\n';
                    error += 'Please ensure that you added the correct path and try again!';
                    return reject(error);
                } else {
                    return resolve(npmPath);
                }
            } catch (e) {
                if (e) {
                    error = 'Given path ' + npmPath + ' is not a valid directory.\n';
                    error += 'Please ensure that you added the correct path and try again!';
                    return reject(error);
                }
            }
            return;
        }

        return _getFromCommand();
    });
};