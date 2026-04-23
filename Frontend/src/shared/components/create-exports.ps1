# Create barrel exports for shared components
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src\shared\components'

# Main components export
$mainExports = @(
    'export { default as Header } from "./Header.tsx";'
    'export { default as Sidebar } from "./Sidebar.tsx";'
    'export { default as ThemeToggle } from "./ThemeToggle.tsx";'
    'export { default as ErrorBoundary } from "./ErrorBoundary.tsx";'
    'export * from "./layouts";'
    'export * from "./ui";'
    'export * from "./3d/truck";'
)
$mainExports -join "`n" | Set-Content 'index.ts' -Encoding UTF8 -Force

# Layouts exports
$layoutFiles = Get-ChildItem 'layouts' -File -Include '*.ts', '*.tsx'
if ($layoutFiles) {
    $layoutExports = $layoutFiles | ForEach-Object { 
        $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        "export * from './$($_.Name)'"
    }
    $layoutExports -join "`n" | Set-Content 'layouts/index.ts' -Encoding UTF8 -Force
}

# UI exports
$uiFiles = Get-ChildItem 'ui' -File -Include '*.ts', '*.tsx'
if ($uiFiles) {
    $uiExports = $uiFiles | ForEach-Object { 
        $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        "export * from './$($_.Name)'"
    }
    $uiExports -join "`n" | Set-Content 'ui/index.ts' -Encoding UTF8 -Force
}

# 3D/Truck exports
$truckFiles = Get-ChildItem '3d/truck' -File -Include '*.ts', '*.tsx'
if ($truckFiles) {
    $truckExports = $truckFiles | ForEach-Object { 
        $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        "export * from './$($_.Name)'"
    }
    $truckExports -join "`n" | Set-Content '3d/truck/index.ts' -Encoding UTF8 -Force
}

Write-Host "[OK] Component barrel exports created!" -ForegroundColor Green
