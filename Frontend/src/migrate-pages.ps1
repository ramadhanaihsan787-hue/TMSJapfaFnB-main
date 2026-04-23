# Phase 1: Move pages to features
Set-Location 'd:\IPB Document\TMSJapfa\TMSJapfaFnB-main\Frontend\src'

# Copy login pages to auth feature
Copy-Item "pages\login\Login.tsx" "features\auth\pages\LoginPage.tsx" -Force 2>$null
Copy-Item "pages\login\Login.tsx" "features\auth\pages\TermsOfService.tsx" -Force 2>$null
Copy-Item "pages\login\Login.tsx" "features\auth\pages\PrivacyPolicy.tsx" -Force 2>$null

# Driver pages -> dashboard and routes features
Copy-Item "pages\driver\Dashboard.tsx" "features\dashboard\pages\DriverDashboard.tsx" -Force 2>$null
Copy-Item "pages\driver\RouteList.tsx" "features\routes\pages\DriverRouteList.tsx" -Force 2>$null
Copy-Item "pages\driver\DeliveryDetail.tsx" "features\routes\pages\DriverDeliveryDetail.tsx" -Force 2>$null
Copy-Item "pages\driver\PodCapture.tsx" "features\pod\pages\PODCapturePage.tsx" -Force 2>$null
Copy-Item "pages\driver\TripSummary.tsx" "features\dashboard\pages\DriverTripSummary.tsx" -Force 2>$null

# Logistik pages -> multiple features
Copy-Item "pages\logistik\Dashboard.tsx" "features\dashboard\pages\LogistikDashboard.tsx" -Force 2>$null
Copy-Item "pages\logistik\RoutePlanning.tsx" "features\routes\pages\RoutePlanningPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\Analytics.tsx" "features\analytics\pages\AnalyticsPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\DriverPerformance.tsx" "features\drivers\pages\DriverPerformancePage.tsx" -Force 2>$null
Copy-Item "pages\logistik\FleetManagement.tsx" "features\fleet\pages\FleetManagementPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\CustomerData.tsx" "features\customers\pages\CustomerDataPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\Settings.tsx" "features\settings\pages\SettingsPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\CostConfiguration.tsx" "features\settings\pages\CostConfigurationPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\TeamRoles.tsx" "features\team\pages\TeamRolesPage.tsx" -Force 2>$null
Copy-Item "pages\logistik\LoadPlanner.tsx" "features\loadPlanner\pages\LoadPlannerPage.tsx" -Force 2>$null

# POD pages
Copy-Item "pages\pod\Dashboard.tsx" "features\dashboard\pages\PODDashboard.tsx" -Force 2>$null
Copy-Item "pages\pod\Sidebar.tsx" "features\pod\pages\PODSidebar.tsx" -Force 2>$null
Copy-Item "pages\pod\History.tsx" "features\pod\pages\HistoryPage.tsx" -Force 2>$null
Copy-Item "pages\pod\Verifications.tsx" "features\pod\pages\VerificationsPage.tsx" -Force 2>$null
Copy-Item "pages\pod\Monitoring.tsx" "features\pod\pages\MonitoringPage.tsx" -Force 2>$null
Copy-Item "pages\pod\Settings.tsx" "features\pod\pages\PODSettingsPage.tsx" -Force 2>$null

# Manager dashboard
Copy-Item "pages\manager_logistik\ManagerLogistik.tsx" "features\manager\pages\ManagerDashboard.tsx" -Force 2>$null

# NotFound page
Copy-Item "pages\NotFound.tsx" "NotFound.tsx" -Force 2>$null

Write-Host "✅ All pages copied to features!" -ForegroundColor Green

# Verify
Write-Host ""
Write-Host "Pages in dashboard:" -ForegroundColor Cyan
Get-ChildItem features\dashboard\pages -File | Select-Object Name

Write-Host ""
Write-Host "Pages in routes:" -ForegroundColor Cyan
Get-ChildItem features\routes\pages -File | Select-Object Name

Write-Host ""
Write-Host "Pages in auth:" -ForegroundColor Cyan
Get-ChildItem features\auth\pages -File | Select-Object Name
