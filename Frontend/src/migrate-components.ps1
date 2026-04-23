# Migrate shared components from src/components/ to shared/components/
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

Write-Host "Starting Phase 2b: Move Shared Components" -ForegroundColor Cyan

# Define components to migrate
$componentsToMove = @{
    'components/Header.tsx' = 'shared/components/Header.tsx'
    'components/Sidebar.tsx' = 'shared/components/Sidebar.tsx'
    'components/ThemeToggle.tsx' = 'shared/components/ThemeToggle.tsx'
    'components/ErrorBoundary.tsx' = 'shared/components/ErrorBoundary.tsx'
}

# Move individual components
foreach ($source in $componentsToMove.Keys) {
    $dest = $componentsToMove[$source]
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "  [OK] $source >> $dest" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $source not found" -ForegroundColor Red
    }
}

# Move layouts folder
if (Test-Path 'components/layouts') {
    Copy-Item -Path 'components/layouts' -Destination 'shared/components/layouts' -Recurse -Force
    Write-Host "  [OK] components/layouts/ >> shared/components/layouts/" -ForegroundColor Green
}

# Move truck folder (3D visualization components)
if (Test-Path 'components/truck') {
    if (-not (Test-Path 'shared/components/3d')) { New-Item -ItemType Directory -Path 'shared/components/3d' -Force | Out-Null }
    Copy-Item -Path 'components/truck' -Destination 'shared/components/3d/truck' -Recurse -Force
    Write-Host "  [OK] components/truck/ >> shared/components/3d/truck/" -ForegroundColor Green
}

# Move ui folder
if (Test-Path 'components/ui') {
    Copy-Item -Path 'components/ui' -Destination 'shared/components/ui' -Recurse -Force
    Write-Host "  [OK] components/ui/ >> shared/components/ui/" -ForegroundColor Green
}

Write-Host ""
Write-Host "[OK] Phase 2b completed: Shared components migrated!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update all component imports in features/ to use shared/components/"
Write-Host "2. Verify no broken imports"
Write-Host "3. Delete old components/ folder once verified"
