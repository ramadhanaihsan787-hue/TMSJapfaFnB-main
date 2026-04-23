# Migrate utilities and hooks to shared layer
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

Write-Host "Starting Phase 2c/2d: Move Utilities and Hooks" -ForegroundColor Cyan

# Move utilities
$utils = @('formatters.ts', 'validators.ts', 'helpers.ts')
foreach ($util in $utils) {
    if (Test-Path "utils\$util") {
        Copy-Item -Path "utils\$util" -Destination "shared\utils\$util" -Force
        Write-Host "  [OK] utils\$util >> shared\utils\$util" -ForegroundColor Green
    }
}

# Move hooks
$hooks = @('useApi.ts', 'useAuth.ts', 'useSidebar.ts')
foreach ($hook in $hooks) {
    if (Test-Path "hooks\$hook") {
        Copy-Item -Path "hooks\$hook" -Destination "shared\hooks\$hook" -Force
        Write-Host "  [OK] hooks\$hook >> shared\hooks\$hook" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[OK] Phase 2c/2d completed: Utils and hooks migrated!" -ForegroundColor Green
