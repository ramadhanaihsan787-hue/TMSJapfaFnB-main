# Architecture Structure Analysis: Layered vs Feature-Based

## 🎯 Overview

Analisis perbandingan dua architectural approach untuk refactoring Frontend TMSJapfa:
1. **Layered Architecture** (Horizontal Layering)
2. **Feature-Based Architecture** (Domain-Driven)

Kedua struktur memiliki trade-offs yang signifikan untuk tim dan project scale kami.

---

## 📐 STRUKTUR 1: LAYERED ARCHITECTURE (Currently Proposed)

### Struktur Folder

```
src/
├── components/              ← LAYER: Presentation
│   ├── dashboard/          (KPI cards, metrics)
│   ├── forms/              (Form inputs, components)
│   ├── tables/             (DataTable, pagination)
│   ├── menus/              (ActionMenu, dropdowns)
│   ├── cards/              (Card wrappers)
│   ├── maps/               (Map components)
│   ├── 3d/                 (3D visualizations)
│   ├── filters/            (Filter components)
│   ├── loaders/            (Spinners, skeletons)
│   ├── modals/             (Modal/dialog components)
│   └── layouts/            (Layout containers)
│
├── hooks/                   ← LAYER: Logic
│   ├── dashboard/          (useDashboardData, useAlertData)
│   ├── routes/             (useRoutes, useRouteOptimization)
│   ├── analytics/          (useAnalytics, useKPISummary)
│   ├── driver/             (useDriverPerformance)
│   ├── customer/           (useCustomers)
│   ├── pod/                (usePODData)
│   ├── form/               (useFormState, useFormValidation)
│   ├── useApi.ts           (Generic API hook)
│   ├── useAuth.ts          (Auth context)
│   └── useSidebar.ts       (UI state)
│
├── types/                   ← LAYER: Data Contracts
│   ├── dashboard.ts        (Live trucks, volumes, rejections)
│   ├── analytics.ts        (KPI, utilization, performance)
│   ├── routes.ts           (Route items, products, details)
│   ├── driver.ts           (Driver data, metrics, performance)
│   ├── users.ts            (Members, roles, teams)
│   ├── ui.ts               (UI state, forms, modals)
│   ├── api.ts              (API responses)
│   ├── auth.ts             (Auth types)
│   ├── common.ts           (Shared types)
│   └── index.ts            (Re-exports)
│
├── pages/                   ← LAYER: Page Assembly
│   ├── driver/             (5 pages)
│   ├── logistik/           (10 pages)
│   ├── pod/                (6 pages)
│   ├── login/              (3 pages)
│   ├── manager_logistik/   (1 page)
│   └── NotFound.tsx
│
├── services/               ← LAYER: API & Business Logic
│   ├── auth_service.ts
│   ├── order_service.ts
│   ├── route_service.ts
│   ├── vrp_service.ts
│   ├── geocoding.ts
│   └── ... (Backend services)
│
├── utils/                  ← LAYER: Utilities
│   ├── formatters.ts       (Date, currency, distance formatting)
│   ├── validators.ts       (Input validation)
│   ├── helpers.ts          (Common helpers)
│   └── index.ts
│
├── store/                  ← LAYER: State Management
│   └── loadStore.ts        (Zustand load planning store)
│
├── styles/                 ← LAYER: Styling
│   ├── animations.css
│   ├── dashboard.css
│   ├── maps.css
│   ├── forms.css
│   └── global.css
│
└── (rest: config, context, assets, etc.)
```

### Karakteristik Layered

✅ **Kelebihan**:
- **Separation of Concerns**: Setiap layer punya tanggung jawab jelas
- **Reusability**: Components dari satu feature bisa dipakai di feature lain
- **Easier Testing**: Setiap layer bisa di-test independently
- **Scalability untuk Tim Kecil**: Mudah untuk dev baru memahami struktur
- **Code Sharing**: Dashboard components bisa dipakai di multiple pages
- **Gradual Migration**: Mudah migrate dari old code ke new components

❌ **Kekurangan**:
- **Feature Dependency**: Perubahan di satu feature bisa mempengaruhi feature lain
- **Circular Dependencies**: Mudah terjadi if not careful (components → hooks → services → types)
- **Scattered Code**: Untuk satu feature, kode tersebar di 5+ folder
- **Navigation Complexity**: Developer perlu "navigate" ke multiple folders untuk memahami flow
- **Scalability untuk Tim Besar**: Bottleneck saat team bertambah (many developers modifying same files)
- **Merge Conflicts**: High probability of conflicts di shared layers (components, hooks)
- **Cross-Feature Logic**: Sulit manage reusable logic yang melibatkan multiple features

### Cocok Untuk:

- ✅ Tim kecil (3-5 developers)
- ✅ Projects dengan banyak component reuse
- ✅ Arsitektur MVC/MVP style
- ✅ Rapid prototyping
- ✅ Admin dashboards (lots of shared UI patterns)

---

## 📦 STRUKTUR 2: FEATURE-BASED ARCHITECTURE (Domain-Driven)

### Struktur Folder

```
src/
├── features/                ← ORGANIZED BY FEATURES
│
│   ├── auth/               ← FEATURE: Authentication
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── TermsOfService.tsx
│   │   │   └── PrivacyPolicy.tsx
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   ├── useLogout.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   └── index.ts        (barrel export)
│   │
│   ├── dashboard/          ← FEATURE: Dashboard
│   │   ├── components/
│   │   │   ├── KPICard.tsx
│   │   │   ├── AlertCard.tsx
│   │   │   ├── LiveTruckMarker.tsx
│   │   │   ├── DashboardMap.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── LogistikDashboard.tsx
│   │   │   ├── DriverDashboard.tsx
│   │   │   ├── PODDashboard.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDashboardData.ts
│   │   │   ├── useAlertData.ts
│   │   │   ├── useLiveTracking.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── dashboard.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── dashboardService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── dashboard.module.css
│   │   │   ├── animations.css
│   │   │   └── index.css
│   │   └── index.ts
│   │
│   ├── routes/             ← FEATURE: Route Planning & Optimization
│   │   ├── components/
│   │   │   ├── RoutePlanner.tsx
│   │   │   ├── RouteCard.tsx
│   │   │   ├── Truck3DVisualization.tsx
│   │   │   ├── RouteMap.tsx
│   │   │   ├── GlowPolyline.tsx
│   │   │   ├── UploadOrdersForm.tsx
│   │   │   ├── RouteOptimizationResults.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── RoutePlanningPage.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useRoutes.ts
│   │   │   ├── useRouteOptimization.ts
│   │   │   ├── useRouteDetails.ts
│   │   │   ├── useUploadOrders.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── routes.ts
│   │   │   ├── routeOptimization.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── routeService.ts
│   │   │   ├── routeOptimizationService.ts
│   │   │   ├── vrpService.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── calculations.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── routes.module.css
│   │   │   ├── maps.css
│   │   │   └── index.css
│   │   └── index.ts
│   │
│   ├── analytics/          ← FEATURE: Analytics & Reporting
│   │   ├── components/
│   │   │   ├── KPISummary.tsx
│   │   │   ├── FleetUtilizationChart.tsx
│   │   │   ├── DriverPerformanceTable.tsx
│   │   │   ├── DeliveryVolumeTrend.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   └── AnalyticsPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAnalytics.ts
│   │   │   ├── useKPISummary.ts
│   │   │   ├── useFleetUtilization.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── analytics.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── analyticsService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── analytics.module.css
│   │   └── index.ts
│   │
│   ├── drivers/            ← FEATURE: Driver Management
│   │   ├── components/
│   │   │   ├── DriverPerformanceCard.tsx
│   │   │   ├── DriverTable.tsx
│   │   │   ├── DriverDetailModal.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── DriverListPage.tsx
│   │   │   ├── DriverDashboard.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDrivers.ts
│   │   │   ├── useDriverPerformance.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── driver.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── driverService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── drivers.module.css
│   │   └── index.ts
│   │
│   ├── fleet/              ← FEATURE: Fleet Management
│   │   ├── components/
│   │   │   ├── VehicleCard.tsx
│   │   │   ├── VehicleTable.tsx
│   │   │   ├── MaintenanceSchedule.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   └── FleetManagementPage.tsx
│   │   ├── hooks/
│   │   │   ├── useVehicles.ts
│   │   │   ├── useMaintenance.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── fleet.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── fleetService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── fleet.module.css
│   │   └── index.ts
│   │
│   ├── customers/          ← FEATURE: Customer Management
│   │   ├── components/
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerDetailModal.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   └── CustomerDataPage.tsx
│   │   ├── hooks/
│   │   │   ├── useCustomers.ts
│   │   │   ├── useCreateCustomer.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── customer.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── customerService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── customers.module.css
│   │   └── index.ts
│   │
│   ├── pod/                ← FEATURE: Proof of Delivery
│   │   ├── components/
│   │   │   ├── PODCapture.tsx
│   │   │   ├── PODHistory.tsx
│   │   │   ├── PODVerification.tsx
│   │   │   ├── SignaturePad.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── PODDashboard.tsx
│   │   │   ├── PODCaptureModal.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── usePOD.ts
│   │   │   ├── usePODCapture.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── pod.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── podService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── pod.module.css
│   │   └── index.ts
│   │
│   ├── settings/           ← FEATURE: Configuration & Settings
│   │   ├── components/
│   │   │   ├── SettingsForm.tsx
│   │   │   ├── CostConfiguration.tsx
│   │   │   ├── AlertConfiguration.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── CostConfigPage.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useSettings.ts
│   │   │   ├── useCostConfig.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── settings.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── settingsService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── settings.module.css
│   │   └── index.ts
│   │
│   ├── team/               ← FEATURE: Team Management
│   │   ├── components/
│   │   │   ├── TeamRolesTable.tsx
│   │   │   ├── RoleForm.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   └── TeamRolesPage.tsx
│   │   ├── hooks/
│   │   │   ├── useTeamRoles.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── team.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── teamService.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   └── team.module.css
│   │   └── index.ts
│   │
│   └── manager/            ← FEATURE: Manager Dashboard
│       ├── components/
│       │   ├── ManagerKPISection.tsx
│       │   ├── ReturnsTable.tsx
│       │   ├── AlertsPanel.tsx
│       │   └── index.ts
│       ├── pages/
│       │   └── ManagerDashboard.tsx
│       ├── hooks/
│       │   ├── useManagerMetrics.ts
│       │   ├── useReturns.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── manager.ts
│       │   └── index.ts
│       ├── services/
│       │   ├── managerService.ts
│       │   └── index.ts
│       ├── styles/
│       │   └── manager.module.css
│       └── index.ts
│
├── shared/                 ← SHARED ACROSS FEATURES
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Layout.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Table/
│   │   ├── Form/
│   │   ├── Modal/
│   │   ├── Loader/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useAuth.ts
│   │   ├── useSidebar.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── services/
│   │   └── apiClient.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── animations.css
│   │   └── tailwind.css
│   └── index.ts
│
└── (rest: config, context, store, assets, etc.)
```

### Karakteristik Feature-Based

✅ **Kelebihan**:
- **Single Responsibility**: Setiap feature bertanggung jawab atas domain sendiri
- **Easy to Navigate**: Semua yang berhubungan dengan feature di satu folder
- **Team Scalability**: Setiap team bisa handle feature terpisah → minimal conflict
- **Feature Independence**: Fitur bisa di-develop, test, dan deploy independently
- **Clear Boundaries**: Feature interfaces jelas, mengurangi coupling
- **Better for Large Teams**: 3+ developers bisa work on different features
- **Micro-frontend Ready**: Mudah extract feature menjadi micro-frontend
- **Onboarding**: Developer baru bisa langsung fokus ke satu feature

❌ **Kekurangan**:
- **Code Duplication**: Components yang reusable bisa terduplikasi di multiple features
- **Shared Logic Complexity**: Perlu careful management untuk shared utilities
- **Learning Curve**: Developer perlu understand feature boundaries
- **Over-Engineering**: Bisa menjadi over-complicated untuk simple projects
- **Extra Folder Navigation**: Lebih banyak folder levels
- **Shared Component Management**: Sulit track components yang truly shared vs. feature-specific
- **Testing Complexity**: Integration testing antar features lebih kompleks

### Cocok Untuk:

- ✅ Tim besar (5+ developers)
- ✅ Long-term projects
- ✅ Projects dengan clear domain boundaries
- ✅ Microservices/Modular architecture
- ✅ Multi-product platforms
- ✅ Domain-Driven Design (DDD) approach

---

## 🔄 PERBANDINGAN DETAIL

| Aspek | Layered | Feature-Based |
|-------|---------|---------------|
| **Code Duplication** | Low (shared components) | Medium-High (per-feature) |
| **Navigation Complexity** | Medium (5+ folders) | High (many nested folders) |
| **Team Scalability** | 3-5 devs max | 5+ devs optimal |
| **Learning Curve** | Easy | Medium |
| **Merge Conflicts** | High (shared layers) | Low (feature-isolated) |
| **Feature Coupling** | High (shared dependencies) | Low (feature-isolated) |
| **Code Sharing** | Excellent | Good (needs abstraction) |
| **Performance** | Good | Good |
| **Testability** | Good | Excellent |
| **Deployment** | All-or-nothing | Feature-by-feature |
| **Onboarding** | Fast | Medium |
| **Refactoring** | Complex | Easier (per-feature) |
| **Circular Dependencies** | Risky | Prevented by design |
| **Setup Time** | Low | Medium-High |

---

## 🎯 REKOMENDASI UNTUK TMSJAPFA

### Current Context:
- Team: 1-2 developers (small team)
- Project Complexity: High (10 major features)
- Timeline: Medium-term (ongoing maintenance)
- Growth: Likely to add team members

### 🏆 HYBRID RECOMMENDATION: **Feature-Based with Shared Layer**

Kombinasi terbaik dari kedua:

```
src/
├── features/               ← Feature modules (independent)
│   ├── dashboard/
│   ├── routes/
│   ├── analytics/
│   ├── drivers/
│   ├── fleet/
│   ├── customers/
│   ├── pod/
│   ├── settings/
│   ├── team/
│   └── manager/
│
├── shared/                 ← Truly shared code ONLY
│   ├── components/         (Header, Sidebar, Layout, Tables, Forms, Modals)
│   ├── hooks/              (useApi, useAuth, useSidebar, form hooks)
│   ├── types/              (common.ts, api.ts)
│   ├── utils/              (formatters, validators, helpers)
│   ├── services/           (apiClient, auth, base services)
│   └── styles/             (global.css, animations.css, theme)
│
├── config/
├── context/
├── store/
├── assets/
└── App.tsx
```

### Alasan Hybrid:

✅ **Sesuai untuk Tim Kecil**: Saat ini 1-2 devs tidak perlu full feature-based complexity
✅ **Scalable untuk Pertumbuhan**: Ready ketika team bertambah
✅ **Code Sharing Optimal**: Shared layer untuk truly reusable components
✅ **Feature Independence**: Clear boundaries untuk future contributors
✅ **Backward Compatible**: Mudah migrate dari current layered structure
✅ **Best of Both Worlds**: Flexibility dari layered + scalability dari feature-based

---

## 📍 MIGRATION PLAN: Current Structure → Hybrid Feature-Based

### Phase 0: Preparation (Day 1)
```
CURRENT src/pages/
├── driver/         → features/dashboard/pages/ (driver dashboard content)
├── logistik/       → Multiple features (dashboard, routes, analytics, fleet, customers, settings)
├── pod/            → features/pod/pages/
├── login/          → features/auth/pages/
├── manager_logistik/ → features/manager/pages/
└── NotFound.tsx    → root level
```

### Phase 1: Create Feature Folders & Move Pages (Day 2-3)

#### Step 1a: Auth Feature
```
features/auth/
├── pages/
│   ├── LoginPage.tsx        ← src/pages/login/Login.tsx
│   ├── TermsOfService.tsx   ← src/pages/login/TermsOfService.tsx
│   └── PrivacyPolicy.tsx    ← src/pages/login/PrivacyPolicy.tsx
├── components/
│   ├── LoginForm.tsx
│   └── index.ts
├── hooks/
│   ├── useLogin.ts
│   └── index.ts
├── types/
│   ├── auth.ts              ← MOVED from src/types/auth.ts
│   └── index.ts
├── services/
│   ├── authService.ts
│   └── index.ts
└── index.ts
```

#### Step 1b: Dashboard Feature
```
features/dashboard/
├── pages/
│   ├── LogistikDashboard.tsx  ← src/pages/logistik/Dashboard.tsx
│   ├── DriverDashboard.tsx    ← src/pages/driver/Dashboard.tsx
│   ├── PODDashboard.tsx       ← src/pages/pod/Dashboard.tsx
│   └── index.ts
├── components/
│   ├── KPICard.tsx            (from manager_logistik/ManagerLogistik.tsx)
│   ├── AlertCard.tsx          (from logistik/Dashboard.tsx)
│   ├── LiveTruckMarker.tsx
│   ├── DashboardMap.tsx
│   └── index.ts
├── hooks/
│   ├── useDashboardData.ts
│   ├── useAlertData.ts
│   ├── useLiveTracking.ts
│   └── index.ts
├── types/
│   ├── dashboard.ts           ← MOVED from src/types/dashboard.ts
│   └── index.ts
├── services/
│   ├── dashboardService.ts
│   └── index.ts
├── styles/
│   ├── animations.css
│   └── index.css
└── index.ts
```

#### Step 1c: Routes Feature
```
features/routes/
├── pages/
│   ├── RoutePlanningPage.tsx  ← src/pages/logistik/RoutePlanning.tsx
│   └── index.ts
├── components/
│   ├── Truck3DVisualization.tsx
│   ├── RouteMap.tsx
│   ├── GlowPolyline.tsx
│   ├── UploadOrdersForm.tsx
│   ├── RouteOptimizationResults.tsx
│   └── index.ts
├── hooks/
│   ├── useRoutes.ts
│   ├── useRouteOptimization.ts
│   ├── useRouteDetails.ts
│   └── index.ts
├── types/
│   ├── routes.ts              ← MOVED from src/types/routes.ts
│   └── index.ts
├── services/
│   ├── routeService.ts
│   ├── routeOptimizationService.ts
│   ├── vrpService.ts
│   └── index.ts
├── styles/
│   ├── maps.css
│   └── index.css
└── index.ts
```

#### Step 1d: Analytics Feature
```
features/analytics/
├── pages/
│   └── AnalyticsPage.tsx       ← src/pages/logistik/Analytics.tsx
├── components/
│   ├── KPISummary.tsx
│   ├── FleetUtilizationChart.tsx
│   ├── DriverPerformanceTable.tsx
│   └── index.ts
├── hooks/
│   ├── useAnalytics.ts
│   ├── useKPISummary.ts
│   ├── useFleetUtilization.ts
│   └── index.ts
├── types/
│   ├── analytics.ts            ← MOVED from src/types/analytics.ts
│   └── index.ts
├── services/
│   ├── analyticsService.ts
│   └── index.ts
└── index.ts
```

#### Step 1e: Drivers Feature
```
features/drivers/
├── pages/
│   ├── DriverPerformance.tsx   ← src/pages/logistik/DriverPerformance.tsx
│   └── index.ts
├── components/
│   ├── DriverPerformanceCard.tsx
│   ├── DriverTable.tsx
│   └── index.ts
├── hooks/
│   ├── useDrivers.ts
│   ├── useDriverPerformance.ts
│   └── index.ts
├── types/
│   ├── driver.ts               ← MOVED from src/types/driver.ts
│   └── index.ts
├── services/
│   ├── driverService.ts
│   └── index.ts
└── index.ts
```

#### Step 1f: Fleet Feature
```
features/fleet/
├── pages/
│   └── FleetManagementPage.tsx ← src/pages/logistik/FleetManagement.tsx
├── components/
│   ├── VehicleCard.tsx
│   ├── VehicleTable.tsx
│   └── index.ts
├── hooks/
│   ├── useVehicles.ts
│   ├── useMaintenance.ts
│   └── index.ts
├── types/
│   ├── fleet.ts
│   └── index.ts
├── services/
│   ├── fleetService.ts
│   └── index.ts
└── index.ts
```

#### Step 1g: Customers Feature
```
features/customers/
├── pages/
│   └── CustomerDataPage.tsx    ← src/pages/logistik/CustomerData.tsx
├── components/
│   ├── CustomerForm.tsx
│   ├── CustomerTable.tsx
│   ├── ActionMenu.tsx          (from CustomerData.tsx)
│   └── index.ts
├── hooks/
│   ├── useCustomers.ts
│   ├── useCreateCustomer.ts
│   └── index.ts
├── types/
│   ├── customer.ts
│   └── index.ts
├── services/
│   ├── customerService.ts
│   └── index.ts
└── index.ts
```

#### Step 1h: POD Feature
```
features/pod/
├── pages/
│   ├── PODDashboard.tsx        ← src/pages/pod/Dashboard.tsx
│   ├── PODCapturePage.tsx      ← src/pages/pod/Sidebar.tsx + PodCapture.tsx
│   ├── HistoryPage.tsx         ← src/pages/pod/History.tsx
│   ├── VerificationsPage.tsx   ← src/pages/pod/Verifications.tsx
│   ├── SettingsPage.tsx        ← src/pages/pod/Settings.tsx
│   ├── MonitoringPage.tsx      ← src/pages/pod/Monitoring.tsx
│   └── index.ts
├── components/
│   ├── PODCapture.tsx
│   ├── PODHistory.tsx
│   ├── SignaturePad.tsx
│   ├── ActionMenu.tsx          (from History.tsx)
│   └── index.ts
├── hooks/
│   ├── usePOD.ts
│   ├── usePODCapture.ts
│   └── index.ts
├── types/
│   ├── pod.ts
│   └── index.ts
├── services/
│   ├── podService.ts
│   └── index.ts
└── index.ts
```

#### Step 1i: Settings Feature
```
features/settings/
├── pages/
│   ├── SettingsPage.tsx        ← src/pages/logistik/Settings.tsx
│   └── CostConfigPage.tsx      ← src/pages/logistik/CostConfiguration.tsx
├── components/
│   ├── SettingsForm.tsx
│   ├── CostConfigurationForm.tsx
│   └── index.ts
├── hooks/
│   ├── useSettings.ts
│   ├── useCostConfig.ts
│   └── index.ts
├── types/
│   ├── settings.ts
│   └── index.ts
├── services/
│   ├── settingsService.ts
│   └── index.ts
└── index.ts
```

#### Step 1j: Team Feature
```
features/team/
├── pages/
│   └── TeamRolesPage.tsx       ← src/pages/logistik/TeamRoles.tsx
├── components/
│   ├── TeamRolesTable.tsx
│   ├── RoleForm.tsx
│   └── index.ts
├── hooks/
│   ├── useTeamRoles.ts
│   └── index.ts
├── types/
│   ├── team.ts
│   └── index.ts
├── services/
│   ├── teamService.ts
│   └── index.ts
└── index.ts
```

#### Step 1k: Manager Feature
```
features/manager/
├── pages/
│   └── ManagerDashboard.tsx    ← src/pages/manager_logistik/ManagerLogistik.tsx
├── components/
│   ├── ManagerKPISection.tsx
│   ├── ReturnsTable.tsx
│   ├── AlertsPanel.tsx
│   └── index.ts
├── hooks/
│   ├── useManagerMetrics.ts
│   ├── useReturns.ts
│   └── index.ts
├── types/
│   ├── manager.ts
│   └── index.ts
├── services/
│   ├── managerService.ts
│   └── index.ts
└── index.ts
```

#### Step 1l: LoadPlanner Feature (Special Case)
```
features/loadPlanner/
├── pages/
│   └── LoadPlannerPage.tsx     ← src/pages/logistik/LoadPlanner.tsx
├── components/
│   ├── TruckScene.tsx
│   ├── TruckSlot.tsx
│   ├── GhostBox.tsx
│   └── index.ts
├── hooks/
│   ├── useLoadPlanner.ts
│   ├── useTruckLoading.ts
│   └── index.ts
├── types/
│   ├── loadPlanner.ts
│   └── index.ts
├── services/
│   ├── loadPlannerService.ts
│   └── index.ts
├── store/
│   └── loadStore.ts            ← MOVED from src/store/loadStore.ts
└── index.ts
```

### Phase 2: Create Shared Layer (Day 3-4)

```
shared/
├── components/
│   ├── Header.tsx              ← COPIED from src/components/
│   ├── Sidebar.tsx
│   ├── ThemeToggle.tsx
│   ├── ErrorBoundary.tsx
│   ├── Layout/
│   ├── Table/
│   │   ├── DataTable.tsx
│   │   ├── TableHeader.tsx
│   │   └── index.ts
│   ├── Form/
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormCheckbox.tsx
│   │   ├── FormRadio.tsx
│   │   ├── FormDatePicker.tsx
│   │   └── index.ts
│   ├── Modal/
│   │   ├── ConfirmModal.tsx
│   │   ├── AlertModal.tsx
│   │   └── index.ts
│   ├── Loader/
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   ├── Cards/
│   │   ├── InfoCard.tsx
│   │   ├── StatCard.tsx
│   │   └── index.ts
│   └── index.ts
│
├── hooks/
│   ├── useApi.ts               ← MOVED from src/hooks/useApi.ts
│   ├── useAuth.ts              ← MOVED from src/hooks/useAuth.ts
│   ├── useSidebar.ts           ← MOVED from src/hooks/useSidebar.ts
│   ├── useFormState.ts         (new)
│   ├── useFormValidation.ts    (new)
│   └── index.ts
│
├── types/
│   ├── common.ts               ← MOVED from src/types/common.ts
│   ├── api.ts                  ← MOVED from src/types/api.ts
│   ├── ui.ts                   ← MOVED from src/types/ui.ts
│   └── index.ts
│
├── utils/
│   ├── formatters.ts           ← MOVED from src/utils/formatters.ts
│   ├── validators.ts           ← MOVED from src/utils/validators.ts
│   ├── helpers.ts              ← MOVED from src/utils/helpers.ts
│   └── index.ts
│
├── services/
│   ├── apiClient.ts            (wrapper around axios)
│   └── index.ts
│
├── styles/
│   ├── global.css
│   ├── animations.css
│   ├── tailwind.css
│   └── index.css
│
├── constants/
│   ├── colors.ts
│   ├── routes.ts
│   └── index.ts
│
└── index.ts (barrel export)
```

### Phase 3: Update Router & Navigation (Day 4)

File struktur routing akan berubah dari:
```typescript
// OLD - src/main.tsx
import Dashboard from './pages/logistik/Dashboard';
import RoutePlanning from './pages/logistik/RoutePlanning';
import Login from './pages/login/Login';
```

Menjadi:
```typescript
// NEW - src/main.tsx
import { Dashboard } from './features/dashboard/pages';
import { RoutePlanningPage } from './features/routes/pages';
import { LoginPage } from './features/auth/pages';
```

### Phase 4: Update Imports Across All Features (Day 5-6)

Search & replace untuk semua imports:

```typescript
// OLD
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/formatters';
import type { Dashboard KPIData } from '../types/dashboard';

// NEW
import { useApi } from '@shared/hooks';
import { formatDate } from '@shared/utils';
import type { DashboardKPIData } from './types';
```

### Phase 5: Create Feature Barrel Exports (Day 6)

Each feature's `index.ts`:
```typescript
// features/dashboard/index.ts
export * from './pages';
export * from './components';
export * from './hooks';
export * from './types';
export * from './services';
```

Enables clean imports:
```typescript
import { LogistikDashboard, KPICard, useDashboardData } from '@features/dashboard';
```

### Phase 6: Remove Old Folders (Day 7)

```bash
rm -r src/pages/
rm -r src/components/dashboard/
rm -r src/components/forms/
rm -r src/components/tables/
rm -r src/hooks/dashboard/
rm -r src/hooks/routes/
# ... etc
```

### Timeline Summary:
- **Phase 0**: 1 day (preparation)
- **Phase 1**: 3-4 days (create features, move pages)
- **Phase 2**: 1-2 days (setup shared layer)
- **Phase 3**: 1 day (update routing)
- **Phase 4**: 2-3 days (update imports)
- **Phase 5**: 1 day (barrel exports)
- **Phase 6**: 1 day (cleanup)
- **Testing & Fixes**: 2-3 days

**Total: 2-3 weeks with careful testing**

---

## 🚀 FINAL RECOMMENDATION

### Choose **Hybrid Feature-Based** Because:

1. ✅ **Team Size**: Current 1-2 devs can start simple, ready to scale
2. ✅ **Project Complexity**: 10+ major features need clear boundaries
3. ✅ **Future Growth**: When team grows, no need to restructure again
4. ✅ **Maintenance**: Each feature can evolve independently
5. ✅ **Testing**: Feature-level testing is easier and more logical
6. ✅ **Onboarding**: New team members quickly find what they need
7. ✅ **Deployment**: Can deploy features independently in future
8. ✅ **No Over-Engineering**: Shared layer handles true reusable code

### Implementation Strategy:

**Start with 80/20 approach:**
- Do Phase 1-3 carefully (main features structure)
- Phase 4 can be gradual (update imports as you work)
- Don't rush Phase 5-6 (cleanup can happen incrementally)

This gives you the best balance for your current situation and future growth!
