# Upgrade NPM on Windows <a href="http://badge.fury.io/js/npm-windows-upgrade"><img src="https://badge.fury.io/js/npm-windows-upgrade.svg" alt="npm version" align="right" height="18"></a><img src="https://david-dm.org/felixrieseberg/npm-windows-upgrade.svg" alt="dependencies" align="right" height="18">
Upgrading npm on Windows requires manual steps to ensure that PowerShell/CMD find the new version of npm. This is a small tool made by Microsoft DX engineers with :heart: for npm and Node, reducing the process to a simple command.

![](https://raw.githubusercontent.com/felixrieseberg/npm-windows-upgrade/gh-pages/screenshot.png)

## Usage
First, ensure that you can execute scripts on your system by running the following command from an elevated command prompt (either PowerShell or CMD.exe). To run PowerShell as Administrator, click Start, search for PowerShell, right-click PowerShell and select `Run as Administrator`.

```
Set-ExecutionPolicy Unrestricted -Scope CurrentUser
```

Then, to install and use this upgrader tool, run:

```
npm install -g npm-windows-upgrade
npm-windows-upgrade
```

The tool will show you a list of all the published and available versions of npm (including pre-release and beta versions). Choose the one you want to install and let it do its thing!

## Issues & Support
Please do [report your issues on GitHub](https://github.com/felixrieseberg/npm-windows-upgrade/issues). There are a bunch of Windows versions, hundreds of different ways to install Node and npm, and it's likely that this script won't work with a few of them. If you run into trouble and need npm upgraded as soon as possible, [please follow the manual instructions](https://github.com/npm/npm/wiki/Troubleshooting#upgrading-on-windows).

This tool was made by Microsoft with :heart: for npm and Node, but it is provided "as is", without warranty of any kind, express or
implied. For details, please consult the `LICENSE` file.

## Contributing
Contributions are extremely welcome! For JavaScript code, please run `grunt test` to check your code against JSCS and JSHint. There's no formal coding guideline for the PowerShell pieces of this tool, but do write code that is commented and comprehensible.
