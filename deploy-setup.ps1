# Alexandria Ecommerce - Vercel Deployment Setup (Windows)
# Run this script: powershell -ExecutionPolicy Bypass -File deploy-setup.ps1

Write-Host "🚀 Alexandria Ecommerce - Vercel Deployment Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check Git
Write-Host "✓ Checking Git setup..." -ForegroundColor Blue
$gitCheck = (Get-Command git -ErrorAction SilentlyContinue) -ne $null
if (-not $gitCheck) {
    Write-Host "✗ Git not installed. Please install Git first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git is installed" -ForegroundColor Green

# Check Node
Write-Host "✓ Checking Node.js..." -ForegroundColor Blue
$nodeCheck = (Get-Command node -ErrorAction SilentlyContinue) -ne $null
if (-not $nodeCheck) {
    Write-Host "✗ Node.js not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green

# Check npm
Write-Host "✓ Checking npm..." -ForegroundColor Blue
$npmCheck = (Get-Command npm -ErrorAction SilentlyContinue) -ne $null
if (-not $npmCheck) {
    Write-Host "✗ npm not installed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ npm installed" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
Set-Location backend
Write-Host "Installing backend dependencies..." -ForegroundColor Blue
npm install
Set-Location ../frontend
Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
npm install
Set-Location ..
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Blue
Set-Location frontend
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host ""

# Check environment files  
Write-Host "✓ Checking environment files..." -ForegroundColor Blue
if (-not (Test-Path "backend\.env.production.template")) {
    Write-Host "⚠ backend\.env.production.template not found" -ForegroundColor Yellow
}
if (-not (Test-Path "frontend\.env.production.template")) {
    Write-Host "⚠ frontend\.env.production.template not found" -ForegroundColor Yellow
}
Write-Host ""

# Check Vercel config
Write-Host "✓ Checking Vercel configuration..." -ForegroundColor Blue
if (-not (Test-Path "backend\vercel.json")) {
    Write-Host "✗ backend\vercel.json not found" -ForegroundColor Red
} else {
    Write-Host "✓ backend\vercel.json found" -ForegroundColor Green
}
if (-not (Test-Path "frontend\vercel.json")) {
    Write-Host "✗ frontend\vercel.json not found" -ForegroundColor Red
} else {
    Write-Host "✓ frontend\vercel.json found" -ForegroundColor Green
}
Write-Host ""

# Initialize git if needed
Write-Host "✓ Checking git repository..." -ForegroundColor Blue
if (-not (Test-Path ".git")) {
    Write-Host "⚠ Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository already exists" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Create/Setup MongoDB Atlas account"
Write-Host "2. Get MongoDB connection string"
Write-Host "3. Copy environment templates:"
Write-Host "   - backend\.env.production.template → Add to Vercel"
Write-Host "   - frontend\.env.production.template → Add to Vercel"
Write-Host "4. Push code to GitHub:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Initial commit'"
Write-Host "   git push -u origin main"
Write-Host "5. Read VERCEL_DEPLOYMENT_GUIDE.md for detailed steps"
Write-Host ""
Write-Host "Happy Deploying! 🚀" -ForegroundColor Green
