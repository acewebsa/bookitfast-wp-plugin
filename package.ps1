# Create zip package inline
$source = "I:\laragon\www\holidayhouse\wp-content\plugins\bookitfast"
$tempDir = Join-Path $source "temp-bookitfast"
$destination = Join-Path $source "bookitfast-1.0.4.zip"

# Remove old files
if (Test-Path $destination) { Remove-Item $destination -Force }
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

# Create temp and copy files
New-Item -ItemType Directory -Path $tempDir | Out-Null
Copy-Item -Path "$source\build" -Destination "$tempDir\build" -Recurse
Copy-Item -Path "$source\includes" -Destination "$tempDir\includes" -Recurse
if (Test-Path "$source\languages") {
    Copy-Item -Path "$source\languages" -Destination "$tempDir\languages" -Recurse
}
Copy-Item -Path "$source\bookitfast.php" -Destination $tempDir
Copy-Item -Path "$source\readme.txt" -Destination $tempDir
Copy-Item -Path "$source\uninstall.php" -Destination $tempDir

# Create zip
Add-Type -Assembly "System.IO.Compression.FileSystem"
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $destination)

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "Package created: bookitfast-1.0.4.zip" -ForegroundColor Green
