# Setup Feature-Based Architecture
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

# Define all features
$features = @('auth', 'dashboard', 'routes', 'analytics', 'drivers', 'fleet', 'customers', 'pod', 'settings', 'team', 'manager', 'loadPlanner')

# Define standard subfolders
$standardSubfolders = @('pages', 'components', 'hooks', 'types', 'services')

# Create features with subfolders
foreach ($feature in $features) {
    foreach ($subfolder in $standardSubfolders) {
        $path = "features\$feature\$subfolder"
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
    
    # Special case: some features need 'styles'
    if ($feature -in @('dashboard', 'routes', 'pod', 'settings')) {
        New-Item -ItemType Directory -Path "features\$feature\styles" -Force | Out-Null
    }
    
    # Special case: loadPlanner needs 'store'
    if ($feature -eq 'loadPlanner') {
        New-Item -ItemType Directory -Path "features\$feature\store" -Force | Out-Null
    }
}

# Create shared layer
$sharedFolders = @('components', 'hooks', 'types', 'utils', 'services', 'styles')
foreach ($folder in $sharedFolders) {
    New-Item -ItemType Directory -Path "shared\$folder" -Force | Out-Null
}

# Display result
Write-Host "✅ Feature structure created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Features:" -ForegroundColor Cyan
Get-ChildItem features -Directory | ForEach-Object { Write-Host "  📦 $_" }

Write-Host ""
Write-Host "Shared layer:" -ForegroundColor Cyan
Get-ChildItem shared -Directory | ForEach-Object { Write-Host "  🔗 $_" }
