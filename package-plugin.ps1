# Book It Fast Plugin Package Script
# Creates a zip file ready for WordPress.org submission

$pluginName = "bookitfast"
$version = "1.2.0"
$outputFile = "$pluginName-$version.zip"

Write-Host "Creating Book It Fast plugin package..." -ForegroundColor Green

# Remove old zip if it exists
if (Test-Path $outputFile) {
    Remove-Item $outputFile
    Write-Host "Removed old package" -ForegroundColor Yellow
}

# Create temporary directory
$tempDir = "temp-$pluginName"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy required files and directories
Write-Host "Copying files..." -ForegroundColor Cyan

Copy-Item -Recurse "build" "$tempDir\build"
Copy-Item -Recurse "includes" "$tempDir\includes"
Copy-Item -Recurse "assets" "$tempDir\assets"

# Create languages directory if it doesn't exist
if (Test-Path "languages") {
    Copy-Item -Recurse "languages" "$tempDir\languages"
} else {
    New-Item -ItemType Directory -Path "$tempDir\languages" | Out-Null
}

# Copy individual files
Copy-Item "bookitfast.php" "$tempDir\"
Copy-Item "readme.txt" "$tempDir\"
Copy-Item "uninstall.php" "$tempDir\"

# Create the zip file
Write-Host "Creating zip archive..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputFile -Force

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

Write-Host ""
Write-Host "✓ Package created successfully: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Files included:" -ForegroundColor White
Write-Host "  - build/" -ForegroundColor Gray
Write-Host "  - includes/" -ForegroundColor Gray
Write-Host "  - languages/" -ForegroundColor Gray
Write-Host "  - assets/" -ForegroundColor Gray
Write-Host "  - bookitfast.php" -ForegroundColor Gray
Write-Host "  - readme.txt" -ForegroundColor Gray
Write-Host "  - uninstall.php" -ForegroundColor Gray
Write-Host ""
Write-Host "Ready to upload to WordPress.org!" -ForegroundColor Green
Write-Host ""
