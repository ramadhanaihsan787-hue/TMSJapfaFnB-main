# Create barrel exports for pages in all features
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

$features = @('auth', 'dashboard', 'routes', 'analytics', 'drivers', 'fleet', 'customers', 'pod', 'settings', 'team', 'manager', 'loadPlanner')

foreach ($feature in $features) {
    $pagesDir = "features\$feature\pages"
    if (Test-Path $pagesDir) {
        $pages = Get-ChildItem $pagesDir -File -Filter '*.tsx'
        if ($pages) {
            $exports = $pages | ForEach-Object { 
                $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
                "export { default as $name } from './$($_.Name)'"
            }
            $exports -join "`n" | Set-Content "$pagesDir\index.ts" -Encoding UTF8 -Force
        }
    }
}

Write-Host "[OK] Created pages barrel exports" -ForegroundColor Green
