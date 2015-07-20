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

#
# Self-Elevate
# ---------------------------------------------------------------------------------------------------------
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

function UpdateNpm($PassedNodePath)
{
    $NpmPath = (Join-Path $PassedNodePath "node_modules\npm")
    Write-Debug "Assuming npm in $NpmPath"

    if (Test-Path $PassedNodePath)
    {
        # Create tmp directory, delete files if they exist
        $TempPath = "$env:temp\npm_upgrade"
        if ((Test-Path $TempPath) -ne $True)
        {
            New-Item -ItemType Directory -Force -Path $TempPath
        }

        # Copy away .npmrc
        $Npmrc = $False
        if (Test-Path $NpmPath)
        {
            cd $NpmPath

            if (Test-Path .npmrc)
            {
                $Npmrc = $True
                Write-Debug "Saving .npmrc"
                Copy-Item .npmrc $TempPath
            }
        }

        # Upgrade npm
        cd $PassedNodePath
        Write-Debug "Upgrading npm in $PassedNodePath"
        .\npm install npm@$version

        # Copy .npmrc back
        if ($Npmrc)
        {
            Write-Debug "Restoring .npmrc"
            $TempFile = "$TempPath\.npmrc"
            Copy-Item $TempFile $NpmPath -Force
        }

        "All done!"
    } else
    {
        "Could not find installation location (assumed in $PassedNodePath) - aborting upgrade"
    }
}

if (!(IsAdministrator))
{
    if (IsUacEnabled)
    {
        "We need to relaunch this script as administrator"
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
# ---------------------------------------------------------------------------------------------------------
$AssumedNpmPath = (Join-Path $NodePath "node_modules\npm")

if ((Test-Path $AssumedNpmPath) -ne $True)
{
    $NodePath = (Join-Path $env:ProgramFiles nodejs)
    # If the user installed an x86 version of NodeJS on an x64 system, the NodeJS installation will be found
    # in env:ProgramFiles(x86)
    if ((Test-Path $NodePath) -ne $True) {
        if (Test-Path "Env:ProgramFiles(x86)")
        {
            $NodePath = (Join-Path {env:ProgramFiles(x86)} nodejs)
        }
        else
        {
            "We could not find npm - aborting upgrade"
            return
        }
    }
}

UpdateNpm($NodePath)