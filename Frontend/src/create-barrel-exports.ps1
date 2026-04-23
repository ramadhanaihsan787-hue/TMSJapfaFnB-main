# Create barrel exports for all features
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

$features = @('dashboard', 'routes', 'analytics', 'drivers', 'fleet', 'customers', 'pod', 'settings', 'team', 'manager', 'loadPlanner')

$barrelTemplate = @'
// {0} feature barrel export
export * from './pages';
export * from './components';
export * from './hooks';
export * from './types';
export * from './services';
'@

foreach ($feature in $features) {
    $content = $barrelTemplate -f $feature
    Set-Content -Path "features\$feature\index.ts" -Value $content -Encoding UTF8 -Force
}

Write-Host "[OK] Created barrel exports for all features" -ForegroundColor Green
Write-Host ""
Write-Host "Barrel exports created:" -ForegroundColor Cyan
$features | ForEach-Object { Write-Host "  - features\$_\index.ts" }
