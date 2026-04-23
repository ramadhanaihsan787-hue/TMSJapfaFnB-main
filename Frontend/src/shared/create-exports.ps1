# Create barrel exports for shared layer
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src\shared'

$folders = @('components', 'hooks', 'types', 'utils', 'services')

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $files = Get-ChildItem $folder -File -Include '*.ts', '*.tsx' | Where-Object { $_.Name -ne 'index.ts' }
        if ($files) {
            $exports = $files | ForEach-Object { 
                $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
                "export * from './$($_.Name)'"
            }
            $exports -join "`n" | Set-Content "$folder\index.ts" -Encoding UTF8 -Force
        }
    }
}

# Create main shared index
$mainExports = @(
    'export * from "./components";'
    'export * from "./hooks";'
    'export * from "./types";'
    'export * from "./utils";'
    'export * from "./services";'
)
$mainExports -join "`n" | Set-Content "index.ts" -Encoding UTF8 -Force

Write-Host "[OK] Created shared layer barrel exports" -ForegroundColor Green
Write-Host ""
Write-Host "Created:" -ForegroundColor Cyan
@('components', 'hooks', 'types', 'utils', 'services', 'main') | ForEach-Object { 
    if ($_ -eq 'main') { 
        Write-Host "  - shared/index.ts"
    } else {
        Write-Host "  - shared/$_/index.ts"
    }
}
