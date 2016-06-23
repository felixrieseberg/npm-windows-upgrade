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

# Returns whether or not the current user has administrative privileges
function IsAdministrator
{
    $Identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $Principal = New-Object System.Security.Principal.WindowsPrincipal($Identity)
    $Principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Returns whether or not UAC is enabled on Windows
function IsUacEnabled
{
    (Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Policies\System).EnableLua -ne 0
}

# Ensures that npm is on the $PATH (and there before NodeJS)
function EnsurePath
{
    # Is %appdata%/npm part of the path?
    if ($env:Path -NotLike '*%appdata%\npm*')
    {
        $env:Path = "%appdata%\npm;" + $env:Path
    } elseif ($env:Path -Like '*nodejs*')
    {
        $npmOnPathIndex = $env:Path.IndexOf("%appdata%\npm")
        $nodeOnPathIndex = $env:Path.IndexOf("nodejs")
        
        # If NodeJS is on the path before npm, move npm up
        if ($npmOnPathIndex > $nodeOnPathIndex)
        {
            $env:Path = "%appdata%\npm;" + $env:Path
        }
    }
}

# Executes the npm upgrade
function UpdateNpm($PassedNodePath)
{
    $NpmPath = (Join-Path $PassedNodePath "node_modules\npm")
    "Assuming npm in $NpmPath"

    if (Test-Path $PassedNodePath)
    {
        # Create tmp directory, delete files if they exist
        $TempPath = "$env:temp\npm_upgrade"
        if ((Test-Path $TempPath) -ne $True)
        {
            New-Item -ItemType Directory -Force -Path $TempPath
        }

        # Copy away npmrc
        $Npmrc = $False
        if (Test-Path $NpmPath)
        {
            cd $NpmPath

            if (Test-Path npmrc)
            {
                $Npmrc = $True
                Write-Debug "Saving npmrc"
                Copy-Item npmrc $TempPath
            }
        }

        # Upgrade npm
        cd $PassedNodePath
        Write-Debug "Upgrading npm in $PassedNodePath"
        .\npm install npm@$version --loglevel win

        # Copy npmrc back
        if ($Npmrc)
        {
            Write-Debug "Restoring npmrc"
            $TempFile = "$TempPath\npmrc"
            Copy-Item $TempFile $NpmPath -Force
        }

        "All done!"
    } else
    {
        "Could not find installation location (assumed in $PassedNodePath) - aborting upgrade."
    }
}

#
# Check Elevation
# ---------------------------------------------------------------------------------------------------------
if (!(IsAdministrator))
{
    "NOTADMIN"
    "Please restart this script from an administrative PowerShell!"
    "NPM cannot be upgraded without administrative rights. To run PowerShell as Administrator,"
    "right-click PowerShell and select 'Run as Administrator'"
    return
}

#
# Upgrade
# ---------------------------------------------------------------------------------------------------------
$AssumedNpmPath = (Join-Path $NodePath "node_modules\npm")
$AssumedPathExists = (Test-Path $AssumedNpmPath -ErrorAction SilentlyContinue)

if ($AssumedPathExists -ne $True)
{
    $NodePath = (Join-Path $env:ProgramFiles nodejs)
    $NodePathExists = (Test-Path $NodePath -ErrorAction SilentlyContinue)
    # If the user installed an x86 version of NodeJS on an x64 system, the NodeJS installation will be found
    # in env:ProgramFiles(x86)
    if ($NodePathExists -ne $True) {
        if (Test-Path "Env:ProgramFiles(x86)" -ErrorAction SilentlyContinue)
        {
            $NodePath = (Join-Path ${env:ProgramFiles(x86)} nodejs)
        }
        else
        {
            "We could not find npm - aborting upgrade."
            "To manually tell npm-version-upgrade where to install npm,"
            'run this script with the parameter --npmPath:"C:\MyNPMLocation\"'
            return
        }
    }
}

EnsurePath;
UpdateNpm($NodePath)
