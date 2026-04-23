# Phase 2a: Migrate remaining pages
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

# Pages that haven't been copied yet
Copy-Item "pages\logistik\Analytics.tsx" "features\analytics\pages\AnalyticsPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\CustomerData.tsx" "features\customers\pages\CustomerDataPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\DriverPerformance.tsx" "features\drivers\pages\DriverPerformancePage.tsx" -Force 2>$null
Copy-Item "pages\logistik\FleetManagement.tsx" "features\fleet\pages\FleetManagementPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\TeamRoles.tsx" "features\team\pages\TeamRolesPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\LoadPlanner.tsx" "features\loadPlanner\pages\LoadPlannerPage.tsx" -Force 2>$null

Write-Host "[OK] Phase 2a completed: All pages migrated!" -ForegroundColor Green
Write-Host ""
Write-Host "Pages migrated:" -ForegroundColor Cyan
@('analytics', 'customers', 'drivers', 'fleet', 'team', 'loadPlanner') | ForEach-Object {
    $files = Get-ChildItem "features\$($_)\pages" -File -ErrorAction SilentlyContinue
    if ($files) {
        Write-Host "  - $_`: " -NoNewline
        Write-Host "$($files.Name)" -ForegroundColor Yellow
    }
}
