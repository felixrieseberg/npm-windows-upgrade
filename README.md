# Upgrade NPM on Windows
Upgrading npm on Windows requires manual steps to ensure that PowerShell/CMD find the new version of npm. This is a small tool made by Microsoft DX engineers with :heart: for npm and Node, reducing the process to a simple command.

![](https://raw.githubusercontent.com/felixrieseberg/npm-windows-upgrade/gh-pages/screenshot.png)

## Usage
Run the following two commands from an elevated command prompt (either PowerShell or CMD.exe). To run PowerShell as Administrator, click Start, search for PowerShell, right-click PowerShell and select `Run as Administrator`.

```
npm install -g npm-windows-upgrade
npm-windows-upgrade
```

The tool will show you a list of all the published and available versions of npm (including pre-release and beta versions). Choose the one you want to install and let it do it's thing!

## Issues & Support
Please do [report your issues on GitHub](https://github.com/felixrieseberg/npm-windows-upgrade/issues). There are a bunch of Windows versions, hundreds of different ways to install Node and npm, and it's likely that this script won't work with a few of them. If you run into trouble and need npm upgraded as soon as possible, [please follow the manual instructions](https://github.com/npm/npm/wiki/Troubleshooting#upgrading-on-windows).

This tool was made by Microsoft with :heart: for npm and Node, but it is provided "as is", without warranty of any kind, express or
implied. For details, please consult the `LICENSE` file.

## Contributing
Contributions are extremely welcome! For JavScript code, please run `grunt test` to check your code against JSCS and JSHint. There's no formal coding guideline for the PowerShell pieces of this tool, but do write code that is commented and comprehensible.