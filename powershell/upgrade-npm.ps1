# npm-windows-upgrade
# This script updates npm on Windows, making sure that the npm installed
# with `npm install -g npm@latest` is actually the first npm found in PATH
# (C) Copyright 2015 Microsoft, developed by Felix Rieseberg
# felix.rieseberg@microsoft.com

# ----------------------------------------------------------------------
# Usage: ./upgrade-npm.ps1
# ----------------------------------------------------------------------
[CmdletBinding()]
Param(
    [Parameter(Mandatory=$True)]
    [string]$version,
    [string]$NodePath=(Join-Path $env:ProgramFiles nodejs)
)

$ErrorActionPreference = "Stop"

Write-Debug "PowerShell received $NodePath as the nodejs path."

#
# Self-Elevate
#
function IsAdministrator
{
    $Identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $Principal = New-Object System.Security.Principal.WindowsPrincipal($Identity)
    $Principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

function IsUacEnabled
{
    (Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Policies\System).EnableLua -ne 0
}

if (!(IsAdministrator))
{
    if (IsUacEnabled)
    {
        [string[]]$argList = @('-NoProfile', '-NoExit', '-File', $MyInvocation.MyCommand.Path)
        $argList += $MyInvocation.BoundParameters.GetEnumerator() | Foreach {"-$($_.Key)", "$($_.Value)"}
        $argList += $MyInvocation.UnboundArguments
        Start-Process PowerShell.exe -Verb Runas -WorkingDirectory $pwd -ArgumentList $argList
        return
    }
    else
    {
        "You must be administrator to run this script"
        return
    }
}

#
# Upgrade
#
if ((Test-Path $NodePath) -ne $True) {
    $NodePath = {env:ProgramFiles(x86)} + "\nodejs"
}

$NpmPath = $NodePath + "\node_modules\npm"
"Assuming npm in " + $NpmPath

if (Test-Path $NpmPath)
{
    # Create tmp directory, delete files if they exist
    $TempPath = $env:temp + "\npm_upgrade"
    if ((Test-Path $TempPath) -ne $True)
    {
        New-Item -ItemType Directory -Force -Path $TempPath
    }

    # Copy away .npmrc
    cd $NpmPath
    $Npmrc = $False
    if (Test-Path .npmrc)
    {
        $Npmrc = $True
        "Saving .npmrc"
        Copy-Item .npmrc $TempPath
    }

    # Upgrade npm
    cd $NodePath
    "Upgrading npm in " + $NodePath
    .\npm install npm@$version

    # Copy .npmrc back
    if ($Npmrc)
    {
        "Restoring .npmrc"
        $TempFile = $TempPath + "\.npmrc"
        Copy-Item $TempFile $NpmPath -Force
    }

    "All done!"
} else
{
    "Could not find NPM in " + $env:ProgramFiles  + "\nodejs\node_modules\npm - aborting upgrade"
}
