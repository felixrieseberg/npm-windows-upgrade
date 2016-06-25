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
"Starting Upgrade to 3.5.1"
npm run build
node .\bin\npm-windows-upgrade --npm-version 3.5.1 --no-spinner

# Check Output
$npmVersion = npm -v
if ($npmVersion -Eq "3.5.1") {
    "Successfully upgraded npm to 3.5.1"
    exit 0
} else {
    "Could not upgrade npm, current version is" + $npmVersion
    exit 1
}
