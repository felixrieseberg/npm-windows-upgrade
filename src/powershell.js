const spawn   = require('child_process').spawn,
      path    = require('path'),
      TPromise = require('promise');

/**
 * Executes the PS1 script upgrading npm
 * @param  {string}   version     - The version to be installed (npm install npm@{version})
 * @param  {string}   npmPath    - Path to Node installation (optional)
 * @return {stderr[], stdout[]}   - stderr and stdout received from the PS1 process
 */
function runUpgrade(version, npmPath) {
    return new TPromise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, '../powershell/upgrade-npm.ps1'),
              specialArgs = npmPath === null ? '& {& \'' + scriptPath + '\' -version \'' + version + '\' }' : '& {& \'' + scriptPath + '\' -version \'' + version + '\' -NodePath "' + npmPath + '" }',
              psArgs = ['-NoProfile', '-NoLogo', specialArgs];

        let stdout = [],
            stderr = [],
            child;

        try {
            child = spawn('powershell.exe', psArgs);
        } catch (error) {
            return reject(error);
        }

        child.stdout.on('data', (data) => stdout.push(data.toString()));

        child.stderr.on('data', (data) => {
            console.log('Error: ', data.toString());
            stderr.push(data.toString());
        });

        child.on('exit', () => resolve({ stderr: stderr, stdout: stdout }));

        child.stdin.end();
    });
}

/**
 * Checks the current Windows PS1 execution policy. The upgrader requires an unrestricted policy.
 * @param  {Function} cb - Callback
 * @return {[type]}      - True if unrestricted, false if it isn't
 */
function checkExecutionPolicy() {
    return new TPromise((resolve) => {
        let output = [], unrestricted, child, i;

        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', 'Get-ExecutionPolicy']);
        } catch (error) {
            // This is dirty, but the best way for us to try/catch right now
            resolve({ error: error });
        }

        child.stdout.on('data', (data) => {
            output.push(data.toString());
        });

        child.stderr.on('data', (data) => {
            output.push(data.toString());
        });

        child.on('exit', () => {
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

/**
 * Executes 'npm install -g npm' upgrading npm
 * @param  {string}   version     - The version to be installed (npm install npm@{version})
 * @return {stderr[], stdout[]}   - stderr and stdout received from the PS1 process
 */
function runSimpleUpgrade(version) {
    return new TPromise((resolve) => {
        let npmCommand = (version) ? `npm install -g npm@${version}` : 'npm install -g npm',
            stdout = [],
            stderr = [],
            child;

        try {
            child = spawn('powershell.exe', ['-NoProfile', '-NoLogo', npmCommand]);
        } catch (error) {
            // This is dirty, but the best way for us to try/catch right now
            resolve({ error: error });
        }

        child.stdout.on('data', (data) => stdout.push(data.toString()));
        child.stderr.on('data', (data) => stderr.push(data.toString()));

        child.on('exit', () => resolve({ stderr: stderr, stdout: stdout }));

        child.stdin.end();
    });
}

module.exports = {
    checkExecutionPolicy: checkExecutionPolicy,
    runUpgrade: runUpgrade,
    runSimpleUpgrade: runSimpleUpgrade
};
