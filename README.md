## Upgrade npm on Windows
<a href="https://ci.appveyor.com/project/felixrieseberg/npm-windows-upgrade/branch/master"><img src="https://ci.appveyor.com/api/projects/status/8mk8qvno71xt30if/branch/master?svg=true" alt="windows build status" height="18" /></a>
<a href="http://badge.fury.io/js/npm-windows-upgrade"><img src="https://badge.fury.io/js/npm-windows-upgrade.svg" alt="npm version" height="18"></a> <a href="https://david-dm.org/felixrieseberg/npm-windows-upgrade"><img src="https://david-dm.org/felixrieseberg/npm-windows-upgrade.svg" alt="dependencies" height="18px"></a> <img src="https://img.shields.io/npm/dm/npm-windows-upgrade.svg" height="18px" />
Upgrading npm on Windows requires manual steps to ensure that PowerShell/CMD find the new version of npm. This is a small tool made with :heart: for npm and Node, reducing the process to a simple command.

![](https://raw.githubusercontent.com/felixrieseberg/npm-windows-upgrade/gh-pages/screenshot.png)

### Usage
First, ensure that you can execute scripts on your system by running the following command from an elevated PowerShell. To run PowerShell as Administrator, click Start, search for PowerShell, right-click PowerShell and select `Run as Administrator`.

```
Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force
```

Then, to install and use this upgrader tool, run the following command (also from an elevated PowerShell or cmd.exe). Note: This tool requires at least Node v6. For Node versions lower than 4.0, please use `npm-windows-upgrade@3.1.1`, for Node versions lower than 6.0, please use `npm-windows-upgrade@4.1.1`.

```
npm install --global --production npm-windows-upgrade
npm-windows-upgrade
```

Want to just install the latest version? Sure:

```
npm-windows-upgrade --npm-version latest
```

The tool will show you a list of all the published and available versions of npm (including pre-release and beta versions). Choose the one you want to install and let it do its thing!

#### Advanced Usage
Usage: npm-windows-upgrade [options]

Options:
```
-h, --help                        Output usage information
-V, --version                     Output the version number
-d, --no-dns-check                Disable the internet connectivity test
-e, --no-execution-policy-check   Disable the PowerShell execution policy test
-p, --no-spinner                  Disable the spinner animation
-n, --npm-path <path>             (Optional) If passed, npm will be upgraded in the specified location
-v, --npm-version <version>       (Optional) If passed, npm will be upgraded/downgraded to the specified version
```

If you have trouble with the script, consider adding parameters manually. A common issue is that the script fails to find npm (and therefore doesn't know where to install it) - in that case, pass the location manually.

```
npm-windows-upgrade --npm-path "C:\nodejs"
```

To manually specify a version to install, pass the `version` parameter:

```
npm-windows-upgrade --npm-version 5.5.0
```

To override the internet connection check, pass `--no-dns-check`. To disable the initial prompt, pass `--no-prompt`.

#### Debug Mode
To see debug output, set a `DEBUG` environment variable (`$env:DEBUG="npm-windows-upgrade"`)

### Issues & Support
Please do [report your issues on GitHub](https://github.com/felixrieseberg/npm-windows-upgrade/issues). There are a bunch of Windows versions, hundreds of different ways to install Node and npm, and it's likely that this script won't work with a few of them. If you run into trouble and need npm upgraded as soon as possible, [please follow the manual instructions](https://github.com/npm/npm/wiki/Troubleshooting#upgrading-on-windows).

This tool was made with :heart: for npm and Node, but it is provided "as is", without warranty of any kind, expressed or
implied. For details, please consult the `LICENSE` file.

##### Fix an Attempted Upgrade
Chances are that you attempted to upgrade npm before, it somehow failed, and you then went looking for this tool. If the tool fails to upgrade, it may be troubled by partial changes done during `npm install npm` or `npm upgrade npm`. In that case, you will have to completely uninstall Node:

 * Uninstall Node.js (select `Uninstall`, not the `Repair` option).
 * Go into `%programfiles%\nodejs` and delete the entire folder.
 * Delete `%appdata%\npm` and `%appdata%\npm-cache`.
 * Edit your `PATH` and remove everything that references npm (to do so, hit "Start" and search for "Environment Variables").
 * Reinstall Node, then install this tool - and only use this tool to upgrade npm, do not attempt to run `npm install npm`.

> :memp: Used Chocolatey?
If you used Chocolatey (https://chocolatey.org/) to install Node.js, be sure to check if npm is removed from the `choco\bin` directory by running the following command: `where.exe npm`. Should it still be there, you will need to either `choco uninstall npm` or delete the files from this bin directory.

### More Useful Node.js Stuff
Microsoft is working hard to make sure that our users have the best possible experience with Node.js. For a helpful set of content that makes it easier to avoid any potential gotchas, [go check out our Node.js Guidelines](https://github.com/microsoft/nodejs-guidelines) - a collection of tips and advanced best practices!

### Contributing
Contributions are extremely welcome! For JavaScript code, please run `grunt test` to check your code against JSCS and JSHint. There's no formal coding guideline for the PowerShell pieces of this tool, but do write code that is commented and comprehensible.

### License
MIT, please see `LICENSE` for details. Copyright (c) 2015 - 2017 Felix Rieseberg.
