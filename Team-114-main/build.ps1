# Build script for Resourcify deployment (PowerShell)

Write-Host "===================================" -ForegroundColor Green
Write-Host "Building Resourcify for Production" -ForegroundColor Green  
Write-Host "===================================" -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed!" -ForegroundColor Red
    exit 1
}

# Build the React app
Write-Host "Building React application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Check if build was successful
if (Test-Path "dist") {
    Write-Host "Build successful! Output in 'dist' directory" -ForegroundColor Green
    Write-Host "Build files:" -ForegroundColor Cyan
    Get-ChildItem dist\ | Format-Table Name, Length, LastWriteTime
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "===================================" -ForegroundColor Green
Write-Host "Build complete! Ready for deployment" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green