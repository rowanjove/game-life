param(
  [Parameter(Mandatory = $true)]
  [string]$Url,
  [int]$TimeoutSeconds = 60
)

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 1
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      Start-Process $Url
      exit 0
    }
  } catch {
    # still starting
  }
  Start-Sleep -Milliseconds 400
}

# open anyway so user sees the address even if probe failed
Start-Process $Url
exit 0
