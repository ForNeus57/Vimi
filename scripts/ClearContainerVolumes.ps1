$originalDirectory = Get-Location
$projectRoot = "C:\Users\domin\PycharmProjects\Vimi"

$volumes = docker volume ls --format '{{.Name}}' | Where-Object { $_ -like "vimi*" }
$directoriesToRemove = @("\.containers\sftp-server\**", "\.containers\database\**", "\.containers\cache\**")

foreach ($volume in $volumes) {
    docker volume rm $volume
    if (-not $?) {
        Write-Host "Failed to remove Docker volume: $volume" -ForegroundColor Red
    }
}

foreach ($dir in $directoriesToRemove) {
    $fullPath = Join-Path -Path $projectRoot -ChildPath $dir

    if (Test-Path -Path $fullPath) {
        Remove-Item -Path $fullPath -Recurse -Force
        Write-Host "Removed directories: $fullPath"
    } else {
        Write-Host "Directories not found or empty: $fullPath" -ForegroundColor Yellow
    }
}
