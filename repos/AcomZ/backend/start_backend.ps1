$PocketBaseVersion = "0.22.12"
$ZipName = "pocketbase_${PocketBaseVersion}_windows_amd64.zip"
$DownloadUrl = "https://github.com/pocketbase/pocketbase/releases/download/v${PocketBaseVersion}/${ZipName}"

if (-not (Test-Path "pocketbase.exe")) {
    Write-Host "Downloading PocketBase v$PocketBaseVersion..."
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipName
    
    Write-Host "Extracting..."
    Expand-Archive -Path $ZipName -DestinationPath . -Force
    
    Write-Host "Cleaning up zip file..."
    Remove-Item $ZipName
}

Write-Host "Starting PocketBase. The migration script will automatically create your database schema!"
Write-Host "Admin UI available at: http://localhost:8090/_/"
.\pocketbase.exe serve
