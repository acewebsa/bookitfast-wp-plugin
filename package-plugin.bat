@echo off
REM Book It Fast Plugin Package Script
REM Creates a zip file ready for WordPress.org submission

echo Creating Book It Fast plugin package...

REM Set the plugin directory
set PLUGIN_DIR=%~dp0
set PLUGIN_NAME=bookitfast
set VERSION=1.0.3
set OUTPUT_FILE=%PLUGIN_NAME%-%VERSION%.zip

REM Remove old zip if it exists
if exist "%OUTPUT_FILE%" del "%OUTPUT_FILE%"

REM Create the zip file using PowerShell
powershell -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('%PLUGIN_DIR%', '%OUTPUT_FILE%'); }"

REM Alternative: Use 7-Zip if installed
REM "C:\Program Files\7-Zip\7z.exe" a -tzip "%OUTPUT_FILE%" build includes languages assets *.php *.txt

echo.
echo Package created: %OUTPUT_FILE%
echo.
echo Files included:
echo - build/
echo - includes/
echo - languages/
echo - assets/
echo - bookitfast.php
echo - readme.txt
echo - uninstall.php
echo.
echo Ready to upload to WordPress.org!
pause
