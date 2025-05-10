# Deployment script for Soundmaster website to Cloudflare
# PowerShell script for Windows environments

param (
    [Parameter()]
    [ValidateSet('production', 'staging', 'development')]
    [string]$Environment = 'development',
    
    [Parameter()]
    [switch]$AdminOnly,
    
    [Parameter()]
    [switch]$PublicOnly
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot

Write-Host "Soundmaster Cloudflare Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan

# Function to check for errors and exit if any occurred
function Test-LastExitCode {
    param (
        [string]$ErrorMessage = "Command failed with exit code $LASTEXITCODE"
    )
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host $ErrorMessage -ForegroundColor Red
        Set-Location -Path $rootDir
        exit $LASTEXITCODE
    }
}

# Check if Wrangler is installed
try {
    $wranglerVersion = npx wrangler --version
    Write-Host "Wrangler CLI found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "Wrangler CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g wrangler
    Test-LastExitCode "Failed to install Wrangler CLI"
}

# No secrets setup needed - using static credentials

# Deploy admin panel
if (!$PublicOnly) {
    Write-Host "`nDeploying Admin Panel" -ForegroundColor Cyan
    Set-Location -Path "admin"
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Test-LastExitCode "Failed to install admin panel dependencies"
    
    Write-Host "Deploying to Cloudflare Workers..." -ForegroundColor Yellow
    if ($Environment -eq "production") {
        npx wrangler deploy
    } else {
        npx wrangler deploy --env $Environment
    }
    Test-LastExitCode "Failed to deploy admin panel"
    
    # Return to root directory
    Set-Location -Path $rootDir
}

# Deploy public website
if (!$AdminOnly) {
    Write-Host "`nDeploying Public Website" -ForegroundColor Cyan
    Set-Location -Path "public"
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Test-LastExitCode "Failed to install public website dependencies"
    
    Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    $deployCommand = "npx wrangler pages deploy ."
    
    # Add environment if not production
    if ($Environment -ne "production") {
        $deployCommand += " --branch $Environment"
    }
    
    Invoke-Expression $deployCommand
    Test-LastExitCode "Failed to deploy public website"
    
    # Return to root directory
    Set-Location -Path $rootDir
}

Write-Host "`nDeployment Complete" -ForegroundColor Green
Write-Host "Your admin panel and public website have been deployed to Cloudflare." -ForegroundColor Green

if (!$PublicOnly) {
    if ($Environment -eq "production") {
        Write-Host "Admin Panel: https://varkie-soundmaster-admin.workers.dev" -ForegroundColor Green
        Write-Host "Custom Domain (if configured): https://admin.soundmaster.com" -ForegroundColor Green
    } else {
        Write-Host "Admin Panel: https://varkie-soundmaster-admin-$Environment.workers.dev" -ForegroundColor Green
    }
}

if (!$AdminOnly) {
    if ($Environment -eq "production") {
        Write-Host "Public Website: https://varkie-soundmaster-public.pages.dev" -ForegroundColor Green
    } else {
        Write-Host "Public Website: https://$Environment.varkie-soundmaster-public.pages.dev" -ForegroundColor Green
    }
}

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domains in the Cloudflare dashboard" -ForegroundColor Yellow
Write-Host "2. Set up Cloudflare Access for additional security (optional)" -ForegroundColor Yellow
Write-Host "3. Update DNS settings for your domains" -ForegroundColor Yellow
Write-Host "4. Test the admin login at the URL above" -ForegroundColor Yellow
