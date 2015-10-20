var spawn = require('child_process').spawn,
    RSVP = require('rsvp'),
    path = require('path');

/**
 * Executes the PS1 script upgrading npm
 * @param  {string}   version     - The version to be installed (npm install npm@{version})
 * @param  {string}   npmPath    - Path to Node installation (optional)
 * @return {stderr[], stdout[]}   - stderr and stdout received from the PS1 process
 */
function run(version, npmPath) {
    return new RSVP.Promise(function (resolve, reject) {
        var scriptPath = path.resolve(__dirname, '../powershell/upgrade-npm.ps1'),
            specialArgs = npmPath === null ? '& {& \'' + scriptPath + '\' -version \'' + version + '\' }' : '& {& \'' + scriptPath + '\' -version \'' + version + '\' -NodePath "' + npmPath + '" }',
            psArgs = ['-NoProfile', '-NoLogo', specialArgs],
            stdout = [],
            stderr = [],
            child;

        try {
            child = spawn('powershell.exe', psArgs);
        } catch (error) {
            reject(error);
        }
        
        child.stdout.on('data', function (data) {
            stdout.push(data.toString());
        });

        child.stderr.on('data', function (data) {
            console.log('Error: ', data.toString());
            stderr.push(data.toString());
        });

        child.on('exit', function () {
            resolve({stderr: stderr, stdout: stdout});
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
    return new RSVP.Promise(function (resolve, reject) {
        var output = [], unrestricted, child, i;

        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', 'Get-ExecutionPolicy']);
        } catch (error) {
            reject(error);
        }

        child.stdout.on('data', function (data) {
            output.push(data.toString());
        });

        child.stderr.on('data', function (data) {
            output.push(data.toString());
        });

        child.on('exit', function () {
            unrestricted = false;

            for (i = output.length - 1; i >= 0; i = i - 1) {
                if (output[i].indexOf('Unrestricted') > -1) {
                    unrestricted = true;
                    break;
                }
            }

            if (!unrestricted) {
                resolve(false);
            } else {
                resolve(true);
            }
        });

        child.stdin.end();
    });
}

module.exports = {
    checkExecutionPolicy: checkExecutionPolicy,
    runUpgrade: run
}
