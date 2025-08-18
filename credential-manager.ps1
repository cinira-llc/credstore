# _access-credential-manager.ps1
#
# Wrapper script for accessing the Windows Credential Manager.
#
# Usage: pwsh.exe -noninteractive -noprofile -file _access-credential-store-windows.ps1 get [service] [username] [password]
#
# DO NOT RUN THIS SCRIPT DIRECTLY. Use the access-credential-store.sh script instead, it will delegate here on Windows.
param (
	[Parameter(Position=0, Mandatory=$true)][string]$verb,
	[Parameter(Position=1, Mandatory=$true)][string]$service,
	[Parameter(Position=2, Mandatory=$true)][string]$username,
	[Parameter(Position=3)][string]$password
)
Add-Type -Path ./CredManagerLib.dll
try {
    if ($verb -eq "delete")
    {
        [CredManager.Util]::DeleteUserCredential("$service/$username")
    }
    elseif ($verb -eq "get")
    {
        [CredManager.Util]::GetUserCredential("$service/$username").password
    }
    elseif ($verb -eq "set")
    {
        [CredManager.Util]::SetUserCredential("$service/$username", $username, $password)
    }
} catch {
    exit 1;
}
