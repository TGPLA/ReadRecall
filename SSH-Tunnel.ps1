# SSH Auto-Reconnect Tunnel Manager
# Usage: .\SSH-Tunnel.ps1
# Note: Requires SSH config file at C:\Users\Administrator\.ssh\config

$RemoteHost = "linyubo.top"
$RemotePort = "3306"
$LocalPort = "3307"

function Test-Port {
    param([string]$Address, [int]$Port, [int]$Timeout = 2)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $asyncResult = $tcpClient.BeginConnect($Address, $Port, $null, $null)
        $wait = $asyncResult.AsyncWaitHandle.WaitOne($Timeout * 1000)
        if ($wait) {
            try {
                $tcpClient.EndConnect($asyncResult)
                $tcpClient.Close()
                return $true
            } catch {
                return $false
            }
        }
        $tcpClient.Close()
        return $false
    } catch {
        return $false
    }
}

function Start-SSHTunnel {
    Write-Host "Starting SSH tunnel: localhost:$LocalPort -> $RemoteHost`:$RemotePort"
    Write-Host "Using SSH config: linyubo.top"

    Start-Process -FilePath "ssh" -ArgumentList "-F", "$env:USERPROFILE\.ssh\config", "-f", "-N", "-L", "$LocalPort`:127.0.0.1`:$RemotePort", "$RemoteHost" -PassThru -NoNewWindow

    Write-Host "SSH tunnel process started"
}

function Stop-SSHTunnel {
    $sshProcesses = Get-Process -Name "ssh" -ErrorAction SilentlyContinue
    if ($sshProcesses) {
        foreach ($proc in $sshProcesses) {
            Write-Host "Stopping ssh process: $($proc.Id)"
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "=============================================="
Write-Host "SSH Auto-Reconnect Tunnel Manager"
Write-Host "Target: $RemoteHost`:$RemotePort -> localhost:$LocalPort"
Write-Host "Requires: C:\Users\Administrator\.ssh\config"
Write-Host "=============================================="
Write-Host ""

Write-Host "Initial check..."
$portOpen = Test-Port -Address "127.0.0.1" -Port $LocalPort
if ($portOpen) {
    Write-Host "Port $LocalPort is already available"
} else {
    Write-Host "Port $LocalPort is not available, starting tunnel..."
    Start-SSHTunnel
    Start-Sleep -Seconds 5

    $portOpen = Test-Port -Address "127.0.0.1" -Port $LocalPort
    if ($portOpen) {
        Write-Host "Tunnel established successfully"
    } else {
        Write-Host "Tunnel failed to establish"
    }
}

$failCount = 0

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Checking port $LocalPort..."
    $portOpen = Test-Port -Address "127.0.0.1" -Port $LocalPort

    if ($portOpen) {
        if ($failCount -gt 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel restored: port $LocalPort available"
            $failCount = 0
        }
    } else {
        $failCount++
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Port $LocalPort unavailable (fail $failCount times)"

        Write-Host "Trying to reconnect..."

        Stop-SSHTunnel
        Start-Sleep -Seconds 2

        Start-SSHTunnel
        Start-Sleep -Seconds 5

        $portOpen = Test-Port -Address "127.0.0.1" -Port $LocalPort
        if ($portOpen) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Reconnect successful!"
            $failCount = 0
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Reconnect failed, retrying in 30s..."
            Start-Sleep -Seconds 30
            continue
        }
    }

    Start-Sleep -Seconds 30
}