# Feature-Based Architecture Migration Guide

## ✅ Completed Tasks

### Phase 0: Preparation ✓
- ✅ Created ARCHITECTURE_ANALYSIS.md with detailed structure comparison
- ✅ Decided on Hybrid Feature-Based approach

### Phase 1: Structure Creation ✓
- ✅ Created 12 feature folders with subfolders:
  - `features/auth/` - pages, components, hooks, types, services
  - `features/dashboard/` - pages, components, hooks, types, services, styles
  - `features/routes/` - pages, components, hooks, types, services, styles
  - `features/analytics/` - pages, components, hooks, types, services
  - `features/drivers/` - pages, components, hooks, types, services
  - `features/fleet/` - pages, components, hooks, types, services
  - `features/customers/` - pages, components, hooks, types, services
  - `features/pod/` - pages, components, hooks, types, services, styles
  - `features/settings/` - pages, components, hooks, types, services, styles
  - `features/team/` - pages, components, hooks, types, services
  - `features/manager/` - pages, components, hooks, types, services
  - `features/loadPlanner/` - pages, components, hooks, types, services, store

- ✅ Created `shared/` layer with folders:
  - shared/components/, shared/hooks/, shared/types/, shared/utils/, shared/services/, shared/styles/

- ✅ Migrated all pages from `src/pages/` to `features/*/pages/`:
  - auth: LoginPage.tsx, TermsOfService.tsx, PrivacyPolicy.tsx
  - dashboard: DriverDashboard.tsx, DriverTripSummary.tsx, LogistikDashboard.tsx, PODDashboard.tsx
  - routes: DriverDeliveryDetail.tsx, DriverRouteList.tsx, RoutePlanningPage.tsx
  - pod: HistoryPage.tsx, MonitoringPage.tsx, PODCapturePage.tsx, PODSettingsPage.tsx, PODSidebar.tsx, VerificationsPage.tsx
  - settings: CostConfigurationPage.tsx, SettingsPage.tsx
  - manager: ManagerDashboard.tsx
  - analytics: AnalyticsPage.tsx (not yet migrated - will move during Phase 2)
  - customers: CustomerDataPage.tsx (not yet migrated - will move during Phase 2)
  - drivers: DriverPerformancePage.tsx (not yet migrated - will move during Phase 2)
  - fleet: FleetManagementPage.tsx (not yet migrated - will move during Phase 2)
  - team: TeamRolesPage.tsx (not yet migrated - will move during Phase 2)
  - loadPlanner: LoadPlannerPage.tsx (not yet migrated - will move during Phase 2)

- ✅ Created consolidated types in `shared/types/`:
  - common.ts - UserRole, ApiResponse, Coordinates
  - api.ts - API configuration and endpoint types

---

## 🔄 Remaining Implementation Tasks

### Phase 2a: Move Remaining Pages ✅

- ✅ All 6 remaining pages successfully migrated:
  - analytics: AnalyticsPage.tsx
  - customers: CustomerDataPage.tsx
  - drivers: DriverPerformancePage.tsx
  - fleet: FleetManagementPage.tsx
  - team: TeamRolesPage.tsx
  - loadPlanner: LoadPlannerPage.tsx

**All 24 pages now in features/*/pages/ directories**

### Phase 2a.5: Create Barrel Exports ✅

- ✅ Created feature-level barrel exports: `features/*/index.ts`
- ✅ Created page-level barrel exports: `features/*/pages/index.ts`
- ✅ Created shared layer barrel exports: `shared/*/index.ts` for components, hooks, types, utils, services
- ✅ Created main shared export: `shared/index.ts`

**Clean imports now possible:**
```typescript
// Import pages from features
import { LoginPage, PrivacyPolicy } from 'features/auth/pages';
import { LogistikDashboard, DriverDashboard } from 'features/dashboard/pages';

// Import from features (via barrel)
import { LogistikDashboard } from 'features/dashboard';

// Import from shared
import { useApi, formatters, validators } from 'shared';
```

### Phase 2b: Move Shared Components (1-2 days)

Copy existing components from `src/components/` to `shared/components/`:

```
src/components/
├── Header.tsx → shared/components/Header.tsx
├── Sidebar.tsx → shared/components/Sidebar.tsx
├── ThemeToggle.tsx → shared/components/ThemeToggle.tsx
├── ErrorBoundary.tsx → shared/components/ErrorBoundary.tsx
├── layouts/
│   ├── LogisticsLayout.tsx → shared/components/layouts/LogisticsLayout.tsx
│   └── RoleGuard.tsx → shared/components/layouts/RoleGuard.tsx
├── truck/ → shared/components/3d/truck/
│   ├── GhostBox.tsx
│   ├── Truck3D.tsx
│   └── TruckSlot.tsx
└── ui/ → shared/components/ui/
    ├── ... (all UI components)
```

### Phase 2c: Consolidate Domain-Specific Types (1-2 days)

Create feature-specific type files and consolidate interfaces:

```
shared/types/ (already created)
├── common.ts ✓
├── api.ts ✓
├── index.ts ✓
├── ui.ts (NEW - ViewMode, FormState, ModalState)
└── auth.ts (NEW - auth-related types)

features/auth/types/ (NEW)
├── auth.ts
└── index.ts

features/dashboard/types/ (NEW)
├── dashboard.ts (LiveTruck, VolumeData, RejectionData, AlertData)
└── index.ts

features/routes/types/ (NEW)
├── routes.ts (RouteProduct, RouteDetail, RouteItem, Truck3DProps)
└── index.ts

features/analytics/types/ (NEW)
├── analytics.ts (KPISummary, FleetUtilization, DeliveryVolume)
└── index.ts

features/drivers/types/ (NEW)
├── driver.ts (DriverData, DriverMetrics)
└── index.ts

# ... and so on for other features
```

### Phase 2d: Move Utilities & Helpers (1 day)

Move `src/utils/` files to `shared/utils/`:

```
src/utils/
├── formatters.ts → shared/utils/formatters.ts
├── validators.ts → shared/utils/validators.ts
├── helpers.ts → shared/utils/helpers.ts
└── index.ts → shared/utils/index.ts
```

### Phase 2e: Move Hooks (1-2 days)

Move existing hooks:

```
src/hooks/
├── useApi.ts → shared/hooks/useApi.ts
├── useAuth.ts → shared/hooks/useAuth.ts
├── useSidebar.ts → shared/hooks/useSidebar.ts
└── index.ts → shared/hooks/index.ts

Then create feature-specific hooks:
├── features/dashboard/hooks/useDashboardData.ts
├── features/dashboard/hooks/useAlertData.ts
├── features/routes/hooks/useRoutes.ts
├── features/routes/hooks/useRouteOptimization.ts
├── features/analytics/hooks/useAnalytics.ts
├── features/drivers/hooks/useDriverPerformance.ts
# ... and so on
```

---

### Phase 3: Update Routing (1-2 days)

Update `src/main.tsx` to import from new feature structure:

**OLD:**
```typescript
import Dashboard from './pages/logistik/Dashboard';
import RoutePlanning from './pages/logistik/RoutePlanning';
import Login from './pages/login/Login';
```

**NEW:**
```typescript
import { LogistikDashboard } from './features/dashboard/pages';
import { RoutePlanningPage } from './features/routes/pages';
import { LoginPage } from './features/auth/pages';
```

---

### Phase 4: Create Barrel Exports (1 day)

Create `index.ts` files for each feature:

**Example: features/dashboard/index.ts**
```typescript
export * from './pages';
export * from './components';
export * from './hooks';
export * from './types';
export * from './services';
```

This enables clean imports:
```typescript
import { LogistikDashboard, useDashboardData, KPICard } from 'features/dashboard';
```

---

### Phase 5: Update All Imports (2-3 days)

Search and replace all imports across the codebase:

```typescript
// OLD imports
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/formatters';
import type { Dashboard } from '../types/dashboard';

// NEW imports  
import { useApi } from 'shared/hooks';
import { formatDate } from 'shared/utils';
import type { Dashboard } from 'features/dashboard/types';
```

**Use VS Code find/replace:**
- Find: `from ['"]\.\.\/hooks\/`
- Replace: `from 'shared/hooks/`

- Find: `from ['"]\.\.\/utils\/`
- Replace: `from 'shared/utils/`

- Find: `from ['"]\.\.\/types\/`
- Replace: `from 'shared/types/`

---

### Phase 6: Create Components in Features (2-3 days)

Extract inline components from pages to feature-specific component files:

**Dashboard Feature:**
```
features/dashboard/components/
├── KPICard.tsx (from manager_logistik/ManagerLogistik.tsx)
├── AlertCard.tsx (from logistik/Dashboard.tsx)
├── LiveTruckMarker.tsx
├── DashboardMap.tsx
└── index.ts
```

**Routes Feature:**
```
features/routes/components/
├── Truck3DVisualization.tsx (from logistik/RoutePlanning.tsx)
├── RouteMap.tsx
├── GlowPolyline.tsx
├── UploadOrdersForm.tsx
├── RouteOptimizationResults.tsx
└── index.ts
```

**Shared Components:**
```
shared/components/
├── Form/
│   ├── FormInput.tsx
│   ├── FormSelect.tsx
│   ├── FormCheckbox.tsx
│   ├── FormRadio.tsx
│   ├── FormDatePicker.tsx
│   ├── FormTimePicker.tsx
│   └── index.ts
├── Table/
│   ├── DataTable.tsx
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   ├── Pagination.tsx
│   └── index.ts
├── Modal/
│   ├── ConfirmModal.tsx
│   ├── AlertModal.tsx
│   ├── FormModal.tsx
│   └── index.ts
├── Loader/
│   ├── Spinner.tsx
│   ├── Skeleton.tsx
│   └── index.ts
└── index.ts
```

---

### Phase 7: Create Services (1-2 days)

Move backend integration logic to feature services:

```
features/dashboard/services/
├── dashboardService.ts (fetch KPI, live tracking, alerts)
└── index.ts

features/routes/services/
├── routeService.ts (fetch routes, details)
├── routeOptimizationService.ts (optimize routes)
├── vrpService.ts (VRP solver)
└── index.ts

# ... and so on for other features
```

---

### Phase 8: Update Store (1 day)

Move Zustand store to feature:

```
features/loadPlanner/store/
├── loadStore.ts (from src/store/loadStore.ts)
└── index.ts
```

---

### Phase 9: Update Styles (1 day)

Move CSS files to feature/shared:

```
src/styles/ → shared/styles/
├── global.css
├── animations.css
├── dashboard.css
├── maps.css
└── forms.css (to create)

features/dashboard/styles/
├── dashboard.module.css (component-specific)
└── index.css

features/routes/styles/
├── routes.module.css
└── maps.css (if specific to routes)

# ... and so on for each feature
```

---

### Phase 10: Cleanup & Testing (2-3 days)

1. Delete old folders:
   ```bash
   rm -r src/pages
   rm -r src/components (excluding what was moved to shared)
   rm -r src/hooks (moved to shared)
   rm -r src/types (consolidated to shared and features)
   rm -r src/utils (moved to shared)
   ```

2. Run build:
   ```bash
   npm run build
   ```

3. Fix any TypeScript errors

4. Test all pages in development mode:
   ```bash
   npm run dev
   ```

5. Test each feature:
   - Login flow
   - Dashboard rendering
   - Route planning
   - Analytics
   - POD capture
   - Settings
   - etc.

---

## 📋 Quick Checklist

### Phase 2 (NOW)
- [ ] Run migrate-pages-phase2.ps1 to copy remaining pages
- [ ] Move shared components from src/components/ to shared/components/
- [ ] Create feature-specific type files
- [ ] Move utilities to shared/utils/
- [ ] Move hooks to shared/hooks/

### Phase 3-5 (SOON)
- [ ] Update src/main.tsx routing
- [ ] Create barrel exports (index.ts) for each feature
- [ ] Search & replace imports across codebase
- [ ] Extract inline components to feature component files
- [ ] Create services in each feature

### Phase 6-10 (LATER)
- [ ] Move Zustand store to feature
- [ ] Organize CSS files
- [ ] Delete old folders
- [ ] Full testing and fixes

---

## 🚀 Scripts to Create & Run

### migrate-pages-phase2.ps1
```powershell
# Copy remaining pages to features
Copy-Item "pages\logistik\Analytics.tsx" "features\analytics\pages\AnalyticsPage.tsx" -Force
Copy-Item "pages\logistik\CustomerData.tsx" "features\customers\pages\CustomerDataPage.tsx" -Force
Copy-Item "pages\logistik\DriverPerformance.tsx" "features\drivers\pages\DriverPerformancePage.tsx" -Force
Copy-Item "pages\logistik\FleetManagement.tsx" "features\fleet\pages\FleetManagementPage.tsx" -Force
Copy-Item "pages\logistik\TeamRoles.tsx" "features\team\pages\TeamRolesPage.tsx" -Force
Copy-Item "pages\logistik\LoadPlanner.tsx" "features\loadPlanner\pages\LoadPlannerPage.tsx" -Force
```

### migrate-components.ps1
```powershell
# Copy shared components
Copy-Item "components\Header.tsx" "shared\components\Header.tsx" -Force
Copy-Item "components\Sidebar.tsx" "shared\components\Sidebar.tsx" -Force
Copy-Item "components\ThemeToggle.tsx" "shared\components\ThemeToggle.tsx" -Force
Copy-Item "components\ErrorBoundary.tsx" "shared\components\ErrorBoundary.tsx" -Force
Copy-Item "components\layouts\*" "shared\components\layouts\" -Force -Recurse
Copy-Item "components\truck\*" "shared\components\3d\truck\" -Force -Recurse
Copy-Item "components\ui\*" "shared\components\ui\" -Force -Recurse
```

---

## 💡 Tips for Continuation

1. **Work Feature by Feature**: Don't try to do everything at once. Focus on one feature at a time.

2. **Test After Each Phase**: Run `npm run build` after completing each phase to catch errors early.

3. **Use Git Commits**: Make a commit after each major phase:
   ```bash
   git add -A
   git commit -m "Phase 2a: Migrate pages"
   git commit -m "Phase 2b: Move shared components"
   git commit -m "Phase 2c: Consolidate types"
   ```

4. **Keep Backward Compatibility**: During migration, you can keep old imports working by re-exporting from new locations:
   ```typescript
   // src/hooks/index.ts
   export * from '../../shared/hooks';
   ```

5. **Document as You Go**: Update this migration guide as you progress.

---

## ❓ Questions? Issues?

If you encounter issues during migration:

1. Check TypeScript compiler errors: `npm run build`
2. Check import paths - make sure they match the new structure
3. Verify barrel exports include all exports from submodules
4. Look for circular dependency issues

---

## 📚 References

- Original ARCHITECTURE_ANALYSIS.md - Full comparison and rationale
- COMPONENT_DECOMPOSITION_PLAN.md - Original planning document
