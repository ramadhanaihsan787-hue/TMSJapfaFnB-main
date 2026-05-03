# Frontend - Dokumentasi Lengkap

## 📋 Gambaran Umum

Frontend TMS Japfa adalah aplikasi React modern dengan arsitektur **Hybrid Feature-Based** yang di-design untuk skalabilitas dan maintainability. Aplikasi ini menyediakan dashboard dan tools manajemen logistics untuk 4 role berbeda:
- **Driver** - Tracking pengiriman real-time
- **Logistik Manager** - Perencanaan rute & fleet management
- **POD Admin** - Verifikasi proof-of-delivery
- **Manager Logistik Pusat** - Analytics & reporting

### Stack Teknologi
- **React 19** - UI framework dengan Hooks
- **TypeScript** - Type safety
- **Vite 5** - Fast build tool with HMR
- **Tailwind CSS 4** - Utility-first styling
- **React Router 7** - Client-side routing
- **Zustand** - State management (load planning)
- **Three.js + React Three Fiber** - 3D visualization
- **Leaflet + React Leaflet** - Interactive maps
- **Axios** - HTTP client with JWT injection
- **Framer Motion** - Animations
- **Lucide React** - Icons

---

## 🏗️ Arsitektur Hybrid Feature-Based

```
Frontend/src/
├── features/              # 12 Feature modules (independent)
│   ├── auth/             # Login, register, security
│   ├── dashboard/        # Role-based dashboards
│   ├── routes/           # Route planning & optimization
│   ├── analytics/        # KPI & reporting
│   ├── drivers/          # Driver management & performance
│   ├── fleet/            # Vehicle management
│   ├── customers/        # Customer data & orders
│   ├── pod/              # Proof of delivery capture & verification
│   ├── settings/         # User & system settings
│   ├── team/             # Team roles & permissions
│   ├── manager/          # Manager dashboard
│   └── loadPlanner/      # Load planning & optimization
│
├── shared/               # Reusable layer
│   ├── components/       # Shared UI components
│   │   ├── layouts/      # Layout wrappers (LogisticsLayout, RoleGuard)
│   │   ├── 3d/truck/     # 3D truck visualization
│   │   └── ui/           # UI utilities (progress bars, inspectors)
│   ├── hooks/            # Custom React hooks (useApi, useAuth, useSidebar)
│   ├── types/            # TypeScript types & interfaces
│   ├── utils/            # Helper functions (formatters, validators)
│   ├── services/         # API services
│   └── styles/           # Global styles & Tailwind
│
├── context/              # Global contexts (Auth, Sidebar)
├── store/                # Zustand stores (loadPlanner state)
└── main.tsx              # App entry point
```

### Struktur Setiap Feature
```
features/[feature]/
├── pages/                # Page components (dashboard views)
├── components/           # Feature-specific components
├── hooks/                # Feature-specific hooks (e.g., useDashboardData)
├── types/                # Feature-specific types/interfaces
├── services/             # API calls for feature
├── styles/               # Feature-specific styles (optional)
└── index.ts              # Barrel export untuk clean imports
```

---

## 📚 12 Feature Modules

### 1️⃣ **AUTH** - Autentikasi & Otorisasi
**Location:** `features/auth/`

**Fitur:**
- Login dengan username/password
- JWT token management
- Role-based access control (RBAC)
- Auto-logout on token expiration
- Terms of service & privacy policy pages

**Pages:**
- `LoginPage.tsx` - Login form
- `TermsOfService.tsx` - ToS display
- `PrivacyPolicy.tsx` - Privacy policy display

**Hooks:**
- `useLogin.ts` - Login logic & validation

**Services:**
- `authService.ts` - API calls (login, logout, refresh token)

---

### 2️⃣ **DASHBOARD** - Role-Specific Dashboards
**Location:** `features/dashboard/`

**Fitur:**
- **Driver Dashboard** - Trip summary, current location, delivery status
- **Logistik Dashboard** - Fleet overview, active orders, system alerts
- **POD Dashboard** - Verification stats, pending items queue
- **Manager Dashboard** - KPI summary, performance trends

**Pages:**
- `DriverDashboard.tsx` - Driver view (current route, stops)
- `DriverTripSummary.tsx` - Trip completion stats
- `LogistikDashboard.tsx` - Logistics operations overview
- `PODDashboard.tsx` - POD verification queue

**Components:**
- `LiveTruckTracker` - Real-time truck location on map
- `KPICard` - Metric display cards
- `AlertBanner` - System alerts & notifications
- `DeliveryStatus` - Order progress visualization

**Store:**
- `loadStore.ts` - Zustand persisted state for load planning

---

### 3️⃣ **ROUTES** - Route Planning & Optimization
**Location:** `features/routes/`

**Fitur:**
- Route planning interface
- Drag-and-drop order assignment
- 3D truck visualization (Three.js)
- Route optimization using backend VRP solver
- ETA & distance calculation
- Multiple route variations

**Pages:**
- `RoutePlanningPage.tsx` - Main planning interface
- `DriverRouteList.tsx` - Available routes for driver
- `DriverDeliveryDetail.tsx` - Stop-by-stop details

**Components:**
- `Truck3DVisualization` - 3D truck model with cargo
- `RouteMap` - Leaflet map with polylines & stops
- `OrderDragDropZone` - Drag-drop order assignment
- `RouteOptimizationPanel` - VRP parameters & solver
- `GlowPolyline` - Animated route polyline

**Types:**
- `RouteProduct` - Order item structure
- `RouteDetail` - Route metadata
- `Truck3DProps` - 3D visualization props

---

### 4️⃣ **ANALYTICS** - KPI & Business Intelligence
**Location:** `features/analytics/`

**Fitur:**
- KPI tracking (delivery rate, on-time %, cost/delivery)
- Fleet utilization analysis
- Driver performance ratings
- Cost breakdown & trends
- Time-series trends & forecasts

**Pages:**
- `AnalyticsPage.tsx` - Main analytics dashboard

**Charts:**
- Delivery volume trends
- Fleet utilization heatmap
- Driver performance rankings
- Cost analysis pie charts

**Types:**
- `KPISummary` - Summary metrics
- `FleetUtilization` - Vehicle usage stats
- `DeliveryVolume` - Order volume trends

---

### 5️⃣ **DRIVERS** - Driver Management & Performance
**Location:** `features/drivers/`

**Fitur:**
- Driver directory with contact info
- Performance metrics (ratings, safety, efficiency)
- Trip history & statistics
- Document management
- Incentive tracking & bonuses

**Pages:**
- `DriverPerformancePage.tsx` - Performance dashboard

**Types:**
- `DriverData` - Driver profile structure
- `DriverMetrics` - Performance indicators

---

### 6️⃣ **FLEET** - Vehicle & Asset Management
**Location:** `features/fleet/`

**Fitur:**
- Vehicle registry & specifications
- Capacity & dimension tracking
- Maintenance schedule tracking
- Vehicle status (available, in-use, maintenance, retired)
- Cost tracking (fuel, maintenance, insurance)
- GPS tracking integration

**Pages:**
- `FleetManagementPage.tsx` - Vehicle management dashboard

---

### 7️⃣ **CUSTOMERS** - Customer & Order Management
**Location:** `features/customers/`

**Fitur:**
- Customer directory
- Contact information
- Order history
- Delivery preferences
- Credit limit tracking
- SLA compliance

**Pages:**
- `CustomerDataPage.tsx` - Customer data dashboard

---

### 8️⃣ **POD** - Proof of Delivery System
**Location:** `features/pod/`

**Fitur:**
- Photo capture for deliveries (mobile camera)
- Digital signature capture (canvas)
- Verification workflow (pending → verified/rejected)
- Rejection handling with notes
- Manual verification by admin

**Pages:**
- `PODCapturePage.tsx` - Driver POD capture
- `VerificationsPage.tsx` - Admin verification queue
- `MonitoringPage.tsx` - Real-time POD monitoring
- `HistoryPage.tsx` - Historical POD records
- `PODSettingsPage.tsx` - POD configuration

**Components:**
- `PODCaptureForm` - Photo + signature input form
- `VerificationQueue` - Admin review interface
- `PODHistory` - Historical records display

---

### 9️⃣ **SETTINGS** - Configuration & Preferences
**Location:** `features/settings/`

**Fitur:**
- User preferences (theme, language)
- Cost configuration (per-km rate, per-item fee)
- Notification settings
- System configuration

**Pages:**
- `SettingsPage.tsx` - User settings
- `CostConfigurationPage.tsx` - Cost parameters

---

### 🔟 **TEAM** - Team & Roles Management
**Location:** `features/team/`

**Fitur:**
- Team member directory
- Role assignment
- Permission management
- Department organization
- Access control

**Pages:**
- `TeamRolesPage.tsx` - Team management dashboard

---

### 1️⃣1️⃣ **MANAGER** - Central Operations Dashboard
**Location:** `features/manager/`

**Fitur:**
- Operations overview
- Alert dashboard (high-priority items)
- Performance metrics summary
- Report generation & export
- Operational decisions

**Pages:**
- `ManagerDashboard.tsx` - Central dashboard

---

### 1️⃣2️⃣ **LOAD PLANNER** - Advanced Load Planning
**Location:** `features/loadPlanner/`

**Fitur:**
- Vehicle capacity optimization
- Order batching & grouping
- Route grouping & consolidation
- Cost estimation
- Route export & printing

**Pages:**
- `LoadPlannerPage.tsx` - Load planning interface

**Store:**
- Custom Zustand store with localStorage persistence
- State: orders, vehicles, planned routes, costs

---

## 🎨 Shared Layer Components

### Layouts
- **LogisticsLayout** - Main app wrapper with header & sidebar
- **RoleGuard** - Route protection based on user role

### Base Components
- **Header** - Navigation bar with user menu & logout
- **Sidebar** - Navigation with role-specific menu items
- **ThemeToggle** - Dark/light mode switcher
- **ErrorBoundary** - Error boundary wrapper

### 3D Components
- **TruckModel** - Mesh model of truck (Three.js)
- **TruckScene** - Three.js scene & camera setup
- **TruckSlot** - Individual cargo slot representation
- **GhostBox** - Drag preview for cargo placement

### UI Components
- **CapacityProgressBar** - Cargo capacity visualization
- **SidebarInspector** - Details panel

---

## 🔗 Shared Utilities & Hooks

### Hooks (`shared/hooks/`)
- **useApi** - Custom hook untuk API calls dengan JWT auto-injection
- **useAuth** - Access to auth context (user, token, login, logout)
- **useSidebar** - Sidebar state (isOpen, toggle, isMobile)
- **useIsAuthenticated** - Check auth status
- **useUserRole** - Get current user role
- **useHasRole** - Check if user has specific role

### Utilities (`shared/utils/`)

#### Formatters (`formatters.ts`)
- `formatDate()` - Indonesian date formatting
- `formatTime()` - Time formatting (HH:mm:ss)
- `formatDateTime()` - Combined date & time
- `formatCurrency()` - IDR currency formatting
- `formatDistance()` - Distance (km/m)
- `formatWeight()` - Weight (kg/g)
- `formatVolume()` - Volume (m³/L)
- `formatPhoneNumber()` - Indonesian phone formatting
- `formatOrderStatus()` - Status badge with color
- `formatRouteStatus()` - Route status formatting
- `truncateText()` - Text truncation with ellipsis

#### Validators (`validators.ts`)
- `validateEmail()` - Email validation
- `validatePhoneNumber()` - Indonesian phone validation
- `validatePassword()` - Password strength checking
- `validateCoordinates()` - GPS coordinate validation
- `validateTimeWindow()` - Time range validation
- `validateDateRange()` - Date range validation
- `validateWeight()` - Weight range validation
- `validateLicensePlate()` - Vehicle plate validation
- `validateFileSize()` - File upload size validation

#### Helpers (`helpers.ts`)
- `calculateHaversineDistance()` - GPS distance calculation
- `calculateTotalDistance()` - Multi-point distance
- `minutesToTime()` - Minute to HH:mm conversion
- `timeToMinutes()` - Time string to minutes
- `groupBy()` - Array grouping utility
- `chunk()` - Array chunking
- `unique()` - Array deduplication
- `sortBy()` - Array sorting utility
- `capitalize()`, `toCamelCase()`, `toKebabCase()` - String formatting
- `slugify()` - URL-safe string conversion
- `delay()` - Promise delay utility

### Types (`shared/types/`)
- **common.ts** - `UserRole`, `ApiResponse<T>`, `Coordinates`, `GeoPoint`
- **api.ts** - API configuration types
- **index.ts** - Barrel export

---

## 🚀 Development Setup

### Prerequisites
```bash
Node.js >= 20.x
npm or yarn
```

### Installation
```bash
cd Frontend
npm install
```

### Environment Variables
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=TMS Japfa
```

### Development Server
```bash
npm run dev
# Runs on http://localhost:5173
```

### Build & Preview
```bash
npm run build        # Production build
npm run preview      # Preview built app
```

### Code Quality
```bash
npm run lint         # ESLint check
npm run test         # Vitest
npm run test:watch   # Watch mode
```

---

## 🔐 Authentication & Authorization

**Roles:**
- `admin_distribusi` - Admin distribution center
- `manager_logistik` - Logistics manager
- `admin_pod` - POD verification admin
- `driver` - Delivery driver

**Flow:**
1. Login → JWT token in localStorage
2. Token auto-injected in API headers
3. Routes protected with `RoleGuard`
4. Token expiry → Auto-logout & redirect to login

---

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints:** 768px (tablet), 1024px (desktop)
- Sidebar collapses on mobile
- Touch-friendly spacing & buttons

---

## 🎯 Import Convention (After Refactoring)

```typescript
// Features
import { LoginPage } from 'features/auth/pages';
import { LogistikDashboard } from 'features/dashboard';

// Shared
import { Header, Sidebar } from 'shared/components';
import { useApi, useAuth } from 'shared/hooks';
import { formatCurrency, validateEmail } from 'shared/utils';
import type { UserRole } from 'shared/types';
```

---

## 🛠️ Development Best Practices

### File Naming
- Components: `PascalCase` (e.g., `OrderCard.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g., `useFetchOrders.ts`)
- Types: `camelCase.ts` (e.g., `dashboard.ts`)

### Code Organization
1. External library imports
2. Shared imports
3. Feature imports
4. Types
5. Styles

### TypeScript
- Always provide return types for functions
- Use types instead of interfaces (except for class extensions)
- Export types explicitly

---

## 📖 Related Documentation

- **ARCHITECTURE_ANALYSIS.md** - Detailed architecture comparison & decision
- **MIGRATION_GUIDE.md** - Refactoring progress & continuation steps
- **Backend README** - API endpoints & data models
- **Main README** - Project overview & system concept

---

## 🤝 Contributing

1. Create feature branch
2. Follow architecture patterns
3. Add TypeScript types
4. Test changes
5. Lint before commit
6. Submit PR with description

---

Made with ❤️ for TMS Japfa
- Delivery confirmation
- Historical POD data review
- Monitor and analytics

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 | UI library |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite 5 | Fast build & HMR |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Routing** | React Router 7 | SPA routing |
| **State Management** | Zustand, Context API | Global state |
| **HTTP Client** | Axios | API communication |
| **Maps** | Leaflet, React Leaflet | Map visualization |
| **3D Graphics** | Three.js, React Three Fiber | 3D truck visualization |
| **Animations** | Framer Motion | UI animations |
| **Authentication** | JWT (jwt-decode) | Token-based auth |
| **Code Quality** | ESLint | Linting |
| **Deployment** | Vercel | Cloud hosting |

---

## 📁 Project Structure

```
Frontend/
├── public/                          # Static assets
│   ├── japfa-logo.png
│   ├── japfa-bg.png
│   └── truck-model.glb             # 3D truck model
│
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Router configuration
│   ├── index.css & App.css         # Global styles
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── api.ts                  # API types & interfaces
│   │   ├── auth.ts                 # Auth types & permissions
│   │   ├── common.ts               # Common UI/form types
│   │   └── index.ts                # Type exports
│   │
│   ├── config/                     # Configuration
│   │   └── api.ts                  # API endpoints config
│   │
│   ├── context/                    # React Context (Global State)
│   │   ├── AuthContext.tsx         # Authentication state
│   │   └── SidebarContext.tsx      # Sidebar UI state
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useApi.ts               # Generic API hook
│   │   ├── useAuth.ts              # Auth context wrapper
│   │   ├── useSidebar.ts           # Sidebar context wrapper
│   │   └── index.ts                # Hook exports
│   │
│   ├── store/                      # Zustand State Management
│   │   └── loadStore.ts            # Load planner state
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── formatters.ts           # Data formatting functions
│   │   ├── validators.ts           # Validation functions
│   │   ├── helpers.ts              # General helper functions
│   │   └── index.ts                # Utils exports
│   │
│   ├── components/                 # Reusable React Components
│   │   ├── Header.tsx              # Top navigation
│   │   ├── Sidebar.tsx             # Left navigation
│   │   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   │   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   │   ├── layouts/
│   │   │   ├── LogisticsLayout.tsx # Layout wrapper for admin pages
│   │   │   └── RoleGuard.tsx       # Route protection component
│   │   ├── truck/                  # 3D visualization components
│   │   │   ├── TruckModel.tsx      # 3D model loader
│   │   │   ├── TruckScene.tsx      # Three.js scene
│   │   │   ├── TruckSlot.tsx       # Cargo slot component
│   │   │   └── GhostBox.tsx        # Load preview box
│   │   └── ui/                     # Generic UI components
│   │       ├── CapacityProgressBar.tsx
│   │       └── SidebarInspector.tsx
│   │
│   └── pages/                      # Page Components (Routes)
│       ├── NotFound.tsx            # 404 page
│       ├── login/
│       │   └── Login.tsx           # Login page
│       ├── driver/                 # Driver role pages
│       │   ├── Dashboard.tsx
│       │   ├── RouteList.tsx
│       │   ├── DeliveryDetail.tsx
│       │   ├── PodCapture.tsx
│       │   └── TripSummary.tsx
│       ├── logistik/               # Admin Distribusi pages
│       │   ├── Dashboard.tsx
│       │   ├── RoutePlanning.tsx
│       │   ├── DriverPerformance.tsx
│       │   ├── FleetManagement.tsx
│       │   ├── Analytics.tsx
│       │   ├── LoadPlanner.tsx
│       │   ├── Settings.tsx
│       │   ├── CustomerData.tsx
│       │   ├── TeamRoles.tsx
│       │   └── CostConfiguration.tsx
│       ├── pod/                    # Admin POD pages
│       │   ├── Dashboard.tsx
│       │   ├── Verifications.tsx
│       │   ├── Monitoring.tsx
│       │   ├── History.tsx
│       │   ├── Settings.tsx
│       │   └── Sidebar.tsx
│       └── manager_logistik/       # Manager Logistik pages
│           └── ManagerLogistik.tsx
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── eslint.config.mjs               # ESLint rules
├── .env.example                    # Environment variables template
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20.x or higher
- **npm** v10.x or higher
- Running Backend API (see Backend README)

### Installation

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd TMSJapfaFnB-main/Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```
   
   **Required variables:**
   - `VITE_API_URL`: Backend API URL (default: http://localhost:8000)
   - Other optional configs for third-party services

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5173`

---

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code (if configured)
npm run format
```

### Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes** in src/ folder
3. **Run dev server**: `npm run dev`
4. **Test locally**: http://localhost:5173
5. **Lint & type check**: `npm run lint`
6. **Build & verify**: `npm run build`
7. **Commit & push**: `git commit -m "feat: description" && git push`

### Useful Patterns

#### Using Auth Hook
```tsx
import { useAuth } from "@/hooks";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  return <div>Welcome, {user?.full_name}</div>;
}
```

#### Using API Hook
```tsx
import { useApi } from "@/hooks";

function DataList() {
  const { data, isLoading, error, refetch } = useApi("/api/orders");
  
  if (isLoading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return <OrderTable orders={data} />;
}
```

#### Type-Safe API Calls
```tsx
import { Order, CreateOrderRequest } from "@/types";
import api from "@/config/api";

const createOrder = async (data: CreateOrderRequest): Promise<Order> => {
  const response = await api.post<Order>("/orders", data);
  return response.data;
};
```

---

## 🏗️ Build & Deployment

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Output generated in dist/ folder
# Size: ~300-400 KB (gzipped)
```

### Deploy to Vercel

1. **Connect repository** to Vercel
2. **Configure build settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Set environment variables** in Vercel dashboard:
   - Copy all variables from `.env.example`
   - Update with production values
4. **Deploy**: Push to main branch (auto-deploys)

### Docker Deployment (Alternative)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ⚙️ Environment Configuration

### Required Variables

```env
# Backend API (required)
VITE_API_URL=http://localhost:8000
```

### Optional Variables

Refer to `.env.example` for all available configuration options:

- **API Configuration**: Timeout, refresh intervals
- **Third-party Services**: Google Maps, TomTom API keys
- **Feature Toggles**: Enable/disable specific features
- **UI Configuration**: Theme, animation, pagination
- **Security**: CORS, HTTPS settings

### Creating .env.local

```bash
# Production
cp .env.example .env.local

# Fill in production values:
VITE_API_URL=https://api.production.com
VITE_ENV=production
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
# ... other production values
```

---

## 🏛️ Architecture

### Data Flow

```
Component
    ↓
[useAuth/useApi Hook]
    ↓
[Context/State Management]
    ↓
[API Client (Axios)]
    ↓
[Backend API]
```

### State Management Strategy

- **Global Auth State**: AuthContext + useAuth hook
- **Global UI State**: SidebarContext + useSidebar hook
- **Load Planner State**: Zustand (loadStore)
- **Component Local State**: useState for component-specific data

### Authentication Flow

1. User logs in → `AuthContext.login()`
2. Backend returns JWT token
3. Token stored in `localStorage`
4. Axios interceptor adds token to all requests
5. Route protection via `<RoleGuard>` component
6. On token expiry → Refresh token or redirect to login

---

## 🔗 Available Routes

### Public Routes
- `/login` - Login page

### Admin Distribusi Routes (`/logistik`)
- `/logistik/dashboard` - KPI dashboard
- `/logistik/route-planning` - Route optimization
- `/logistik/driver-performance` - Driver analytics
- `/logistik/fleet-management` - Vehicle management
- `/logistik/analytics` - Detailed reports
- `/logistik/load-planner` - 3D load optimization
- `/logistik/settings` - System settings

### Driver Routes (`/driver`)
- `/driver/dashboard` - Driver dashboard
- `/driver/routes` - Route list
- `/driver/delivery/:id` - Delivery details
- `/driver/pod-capture` - POD camera
- `/driver/trip-summary` - End-of-day summary

### POD Admin Routes (`/pod`)
- `/pod/dashboard` - POD overview
- `/pod/verifications` - Photo verification
- `/pod/monitoring` - Real-time tracking
- `/pod/history` - Historical data

### Manager Logistik Routes (`/manager-logistik`)
- `/manager-logistik/dashboard` - Manager overview

---

## 🔌 API Integration

### Base Configuration

API endpoints are configured in `src/config/api.ts`. All requests:
- Use `VITE_API_URL` base URL
- Include JWT token in Authorization header (automatic)
- Use application/json content type
- Timeout after 30 seconds (configurable)

### Making API Calls

**Option 1: useApi Hook (Recommended)**
```tsx
const { data, isLoading, error } = useApi("/orders");
```

**Option 2: Direct Axios Call**
```tsx
import axios from "axios";

const response = await axios.get("/api/orders", {
  baseURL: import.meta.env.VITE_API_URL
});
```

**Option 3: API Config**
```tsx
import api from "@/config/api";

const response = await api.get("/orders");
```

### Error Handling

```tsx
try {
  const response = await api.post("/orders", orderData);
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 400) {
    // Handle validation error
  }
}
```

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Axios Documentation](https://axios-http.com)

---

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add type annotations for function parameters and returns
4. Test components locally before committing
5. Keep components focused and reusable
6. Document complex logic with comments
7. Use semantic commit messages

### Code Style

- **Components**: PascalCase filenames
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Imports**: Group as: React imports → External libs → Internal imports
- **Exports**: Use named exports for utils, default export for components/pages

---

## 📄 License

This project is part of the TMS Japfa FnB system. All rights reserved.

---

## 🆘 Support

For issues, bugs, or questions:
1. Check existing [Issues](../../issues)
2. Review [Documentation](#project-structure)
3. Contact development team

---

**Last Updated**: April 2026  
**Frontend Version**: 1.0.0  
**Node.js Required**: v20.x or higher
import reactDom from 'eslint-plugin-react-dom'


Deployment heartbeat (unblock)
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
