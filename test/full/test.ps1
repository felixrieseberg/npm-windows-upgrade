# First, display the current versions
Try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    "Current Node: " + $nodeVersion + " Current npm: " + $npmVersion
}
Catch [system.exception]
{
    "Could not grab Node & npm versions. Are they installed?"
    "Exiting test now"
    exit 1
}

# Set Execution Policy
"Setting Execution Policy"
Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force

# Run
"Starting Upgrade to 6.0.0"
node .\bin\npm-windows-upgrade --npm-version 6.0.0 --no-spinner

# Check Output
$npmVersion = npm -v
if ($npmVersion -Eq "6.0.0") {
    "Successfully upgraded npm to 6.0.0"
    exit 0
} else {
    "Could not upgrade npm, current version is" + $npmVersion
    exit 1
}
