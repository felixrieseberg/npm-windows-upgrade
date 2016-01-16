'use strict';

var spawn = require('child_process').spawn,
    path = require('path'),
    TPromise = require('promise'),
    debug = require('./debug');

/**
 * Executes the PS1 script upgrading npm
 * @param  {string}   version     - The version to be installed (npm install npm@{version})
 * @param  {string}   npmPath    - Path to Node installation (optional)
 * @return {stderr[], stdout[]}   - stderr and stdout received from the PS1 process
 */
function runUpgrade(version, npmPath) {
    return new TPromise(function (resolve, reject) {
        var scriptPath = path.resolve(__dirname, '../powershell/upgrade-npm.ps1'),
            specialArgs = npmPath === null ? '& {& \'' + scriptPath + '\' -version \'' + version + '\' }' : '& {& \'' + scriptPath + '\' -version \'' + version + '\' -NodePath "' + npmPath + '" }',
            psArgs = ['-NoProfile', '-NoLogo', specialArgs];

        if (process.env.DEBUG) {
            psArgs.push('-debug');
        }

        var stdout = [],
            stderr = [],
            child = undefined;

        try {
            child = spawn('powershell.exe', psArgs);
        } catch (error) {
            return reject(error);
        }

        child.stdout.on('data', function (data) {
            return stdout.push(data.toString());
        });

        child.stderr.on('data', function (data) {
            console.log('Error: ', data.toString());
            stderr.push(data.toString());
        });

        child.on('exit', function () {
            return resolve({ stderr: stderr, stdout: stdout });
        });

        child.stdin.end();
    });
}

/**
 * Checks the current Windows PS1 execution policy. The upgrader requires an unrestricted policy.
 * @param  {Function} cb - Callback
 * @return {[type]}      - True if unrestricted, false if it isn't
 */
function checkExecutionPolicy() {
    debug('PowerShell: Checking execution policy');

    return new TPromise(function (resolve) {
        var output = [],
            unrestricted = undefined,
            child = undefined,
            i = undefined;

        try {
            debug('Powershell: Attempting to spawn PowerShell child');
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', 'Get-ExecutionPolicy']);
        } catch (error) {
            debug('Powershell: Could not spawn PowerShell child');
            // This is dirty, but the best way for us to try/catch right now
            resolve({ error: error });
        }

        child.stdout.on('data', function (data) {
            debug('PowerShell: Stdout received: ' + data.toString());
            output.push(data.toString());
        });

        child.stderr.on('data', function (data) {
            debug('PowerShell: Stderr received: ' + data.toString());
            output.push(data.toString());
        });

        child.on('exit', function () {
            unrestricted = false;

            for (i = output.length - 1; i >= 0; i = i - 1) {
                if (output[i].indexOf('Unrestricted') > -1) {
                    debug('PowerShell: Execution Policy seems unrestricted');
                    unrestricted = true;
                    break;
                }
            }

            if (!unrestricted) {
                debug('PowerShell: Resolving restricted (false)');
                resolve(false);
            } else {
                debug('PowerShell: Resolving unrestricted (true)');
                resolve(true);
            }
        });

        child.stdin.end();
    });
}

/**
 * Executes 'npm install -g npm' upgrading npm
 * @param  {string}   version     - The version to be installed (npm install npm@{version})
 * @return {stderr[], stdout[]}   - stderr and stdout received from the PS1 process
 */
function runSimpleUpgrade(version) {
    return new TPromise(function (resolve) {
        var npmCommand = version ? 'npm install -g npm@' + version : 'npm install -g npm',
            stdout = [],
            stderr = [],
            child = undefined;

        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', npmCommand]);
        } catch (error) {
            // This is dirty, but the best way for us to try/catch right now
            resolve({ error: error });
        }

        child.stdout.on('data', function (data) {
            return stdout.push(data.toString());
        });
        child.stderr.on('data', function (data) {
            return stderr.push(data.toString());
        });

        child.on('exit', function () {
            return resolve({ stderr: stderr, stdout: stdout });
        });

        child.stdin.end();
    });
}

module.exports = {
    checkExecutionPolicy: checkExecutionPolicy,
    runUpgrade: runUpgrade,
    runSimpleUpgrade: runSimpleUpgrade
};