# Fix npm PATH issue - Run this in your PowerShell terminal
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify it works
Write-Host "Checking npm..." -ForegroundColor Yellow
npm --version
node --version

Write-Host "`n✓ If you see version numbers above, npm is now working!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Green

