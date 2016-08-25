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

# SIG # Begin signature block
# MIINQAYJKoZIhvcNAQcCoIINMTCCDS0CAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUQnBuS6qQWuLc1Irczexambto
# M0Ogggp+MIIFJzCCBA+gAwIBAgIQBicsjH4LxacitIAMXdcrMDANBgkqhkiG9w0B
# AQsFADB2MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYD
# VQQLExB3d3cuZGlnaWNlcnQuY29tMTUwMwYDVQQDEyxEaWdpQ2VydCBTSEEyIEhp
# Z2ggQXNzdXJhbmNlIENvZGUgU2lnbmluZyBDQTAeFw0xNjA3MjkwMDAwMDBaFw0x
# NzExMDIxMjAwMDBaMGYxCzAJBgNVBAYTAlVTMQswCQYDVQQIEwJDQTEWMBQGA1UE
# BxMNU2FuIEZyYW5jaXNjbzEYMBYGA1UEChMPRmVsaXggUmllc2ViZXJnMRgwFgYD
# VQQDEw9GZWxpeCBSaWVzZWJlcmcwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
# AoIBAQDes7XIX/iojJzc5bEQH+mG23t9iaAceti856llFiwmUn+sYFKLrwOsa4Tb
# L2IOHQq6TvyMi3IGk2JgmOVJm8+Ge1apHuUl0TY+Mc7gmEMTcSFPTf1bwRzbVy9n
# WV7N42kCKHnYSL81SE36FVyUwBAfilmAl7laWpeXs3vq58VyVYo7y2G/TqOnlJgF
# j4zvJ8yQZ1en1VoO89PoxCyXBcgwYJHdWaLtSieH8b5A0Ee1uas0wpx1w0V+kPKn
# 0CmBAPHzeFM9SX5FHSKCbCyZW2Tg9wkIBNs9ddVcEWq187nC/lzAUo/jbzdKAYBr
# Qi3VmXsi9akgspKTW0MeL0Gdgpm5AgMBAAGjggG/MIIBuzAfBgNVHSMEGDAWgBRn
# nQ8gCQzMijrlgkZyYvzxzJDlQDAdBgNVHQ4EFgQU2O0vzu/SWHPgwaCtyWbDl2aH
# UBwwDgYDVR0PAQH/BAQDAgeAMBMGA1UdJQQMMAoGCCsGAQUFBwMDMG0GA1UdHwRm
# MGQwMKAuoCyGKmh0dHA6Ly9jcmwzLmRpZ2ljZXJ0LmNvbS9zaGEyLWhhLWNzLWcx
# LmNybDAwoC6gLIYqaHR0cDovL2NybDQuZGlnaWNlcnQuY29tL3NoYTItaGEtY3Mt
# ZzEuY3JsMEwGA1UdIARFMEMwNwYJYIZIAYb9bAMBMCowKAYIKwYBBQUHAgEWHGh0
# dHBzOi8vd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwCAYGZ4EMAQQBMIGIBggrBgEFBQcB
# AQR8MHowJAYIKwYBBQUHMAGGGGh0dHA6Ly9vY3NwLmRpZ2ljZXJ0LmNvbTBSBggr
# BgEFBQcwAoZGaHR0cDovL2NhY2VydHMuZGlnaWNlcnQuY29tL0RpZ2lDZXJ0U0hB
# MkhpZ2hBc3N1cmFuY2VDb2RlU2lnbmluZ0NBLmNydDAMBgNVHRMBAf8EAjAAMA0G
# CSqGSIb3DQEBCwUAA4IBAQAzrd3bUmtQp/JyRiYwD3C4tYDwIKZTCCeNrAzrEMut
# IKwVrzzrqg+977hem1tGhCev6FPeDvBYhgvREngbD3KlSv8fPuVZKZTnBw6ADGBj
# ntldXbHtA9w7C9PizvvS0pqrIycGnnEIFKxc5YeJoJwFSleCGndmp7ps933FmfpI
# jQdnEFQmtVuNvHdFIZBm0D279ivUFuSRkqd5tZ68Z2W4JWxzt/j1CCxsFWh5tmNN
# yAfKcKsNDusB6G9nse41p2D09a9bo6ktdqW4B46tSCUVOVa5p99OLswNdAA7mjYa
# +5Gk5c8H4dBnK9F4pAnnzN1cuy7timNXHAN1Aqsu3yRuMIIFTzCCBDegAwIBAgIQ
# C34QkDw4SQ/6L2eah6GnuTANBgkqhkiG9w0BAQsFADBsMQswCQYDVQQGEwJVUzEV
# MBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29t
# MSswKQYDVQQDEyJEaWdpQ2VydCBIaWdoIEFzc3VyYW5jZSBFViBSb290IENBMB4X
# DTEzMTAyMjEyMDAwMFoXDTI4MTAyMjEyMDAwMFowdjELMAkGA1UEBhMCVVMxFTAT
# BgNVBAoTDERpZ2lDZXJ0IEluYzEZMBcGA1UECxMQd3d3LmRpZ2ljZXJ0LmNvbTE1
# MDMGA1UEAxMsRGlnaUNlcnQgU0hBMiBIaWdoIEFzc3VyYW5jZSBDb2RlIFNpZ25p
# bmcgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC0Sl59Bw9B3sT1
# dhY2vXH/zz9Pc0uc0Q3+SstXWF6FFt0CFVSZ8I88L00CeBBoyNg1Sz/B92fOmByu
# M7ktHaQKVJPEhaLfNbH18TynszT7XUjJRsliRLxImesoSVPDPY/ADt41mOliUd89
# a0Bh7gRB2s+nXFaW0flMt0SEh5hp5YK5E+ZVv8iScJIKMW9/izKrz2tan2LEPu6+
# 7VmkU38L8VKIinsKZyTLkM3s0k00TLDhtZ+cxvZvLM3mylN0AZ9nNd44SS3O7TlE
# ghl5Thqytfu7ePBJZqfP+lyWdZKLGnLZ/1CSU8w+wkMyCRqGE2k8+4EyMzJkdXMo
# Jh0IMDsHAgMBAAGjggHhMIIB3TASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB
# /wQEAwIBhjATBgNVHSUEDDAKBggrBgEFBQcDAzB/BggrBgEFBQcBAQRzMHEwJAYI
# KwYBBQUHMAGGGGh0dHA6Ly9vY3NwLmRpZ2ljZXJ0LmNvbTBJBggrBgEFBQcwAoY9
# aHR0cDovL2NhY2VydHMuZGlnaWNlcnQuY29tL0RpZ2lDZXJ0SGlnaEFzc3VyYW5j
# ZUVWUm9vdENBLmNydDCBjwYDVR0fBIGHMIGEMECgPqA8hjpodHRwOi8vY3JsNC5k
# aWdpY2VydC5jb20vRGlnaUNlcnRIaWdoQXNzdXJhbmNlRVZSb290Q0EuY3JsMECg
# PqA8hjpodHRwOi8vY3JsMy5kaWdpY2VydC5jb20vRGlnaUNlcnRIaWdoQXNzdXJh
# bmNlRVZSb290Q0EuY3JsME8GA1UdIARIMEYwOAYKYIZIAYb9bAACBDAqMCgGCCsG
# AQUFBwIBFhxodHRwczovL3d3dy5kaWdpY2VydC5jb20vQ1BTMAoGCGCGSAGG/WwD
# MB0GA1UdDgQWBBRnnQ8gCQzMijrlgkZyYvzxzJDlQDAfBgNVHSMEGDAWgBSxPsNp
# A/i/RwHUmCYaCALvY2QrwzANBgkqhkiG9w0BAQsFAAOCAQEAag7/fhN8BqVLwC6M
# +VNkCeK6WJEwUOzMn+HTqC9IRjYYKdB4KF+YVkAPHrq9sTuHXNxb2CAN7RoWTdUR
# JCFL8SdpkBPrEaEB2v21TnlZdb04KmrD9o5BK4qii9csUVHZnKDI4066bKhH0k7R
# aB+MAlc7sylqjmogKrnyAGJkusjpAPnMpNS6mjXYryxlbBZ8WCHeSjDQ+uskXQbJ
# nRa3rUpF0yXiDPBAqlxNrH7NBoK5dkZpCNgytoL+46lYNEMbjmdnlz9oMRY2OJU+
# h/fHw6+dencZ2d6Ttf1uK/yU+T23TBI1LDC+6I2eBXCaSBP0jNbnHqw456jzrQy3
# euxn7TGCAiwwggIoAgEBMIGKMHYxCzAJBgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdp
# Q2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5jb20xNTAzBgNVBAMTLERp
# Z2lDZXJ0IFNIQTIgSGlnaCBBc3N1cmFuY2UgQ29kZSBTaWduaW5nIENBAhAGJyyM
# fgvFpyK0gAxd1yswMAkGBSsOAwIaBQCgeDAYBgorBgEEAYI3AgEMMQowCKACgACh
# AoAAMBkGCSqGSIb3DQEJAzEMBgorBgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAM
# BgorBgEEAYI3AgEVMCMGCSqGSIb3DQEJBDEWBBQP8gx8yxuvwdWtdwIcIhyoHSq5
# hzANBgkqhkiG9w0BAQEFAASCAQCtDqRpyQ6ioBw5ZVtTAHZ0AdgU13ytCq9BXOap
# I6cBqbaI3jfAlIS8Zty7uZfSFAfVw53HAq2ig6vfzMjt/3M3xmrVmnvSpj0Ts5X9
# fkyDs1MnAyDv4e7+Ce+THu3rB2WS+0m+clp8kTnoZ4Lfu/uq81U+Z3GJHXfNXJOk
# ukK0nVRBGcwDTCUrZMah6HdTfpuckVF+kV4uJgoQGRoSyuUl3PB8Q+uUFVl/VG/A
# W+YbDMd8Lqp+YEN3AIgakAET+2axzDSHfa6YY+9SaTVvqnn4lcvpIaxqRUZ7e/gK
# CETsAsu9TGKht8Nj73byep8GmAK9HcvdztZp81UIo0xzKbtD
# SIG # End signature block
