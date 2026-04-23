# TMS Japfa FnB - Frontend

A modern, role-based Transport Management System (TMS) frontend built with React, TypeScript, Vite, and Tailwind CSS. Provides comprehensive logistics management for drivers, administrators, and managers with real-time tracking, route optimization, and proof-of-delivery (POD) features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Environment Configuration](#environment-configuration)
- [Architecture](#architecture)
- [Available Routes](#available-routes)
- [API Integration](#api-integration)
- [Contributing](#contributing)

---

## ✨ Features

### Core Features
- 🔐 **Role-Based Access Control**: 4 user roles with specific permissions (Admin Distribusi, Manager Logistik, Admin POD, Driver)
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🗺️ **Real-time Map Integration**: Leaflet for route visualization and tracking
- 📊 **Analytics Dashboard**: KPI monitoring and performance metrics
- 🚚 **Route Planning & Optimization**: Interactive route optimization with visualization
- 🎥 **POD (Proof of Delivery)**: Photo capture and verification system
- 📦 **3D Load Planner**: Three.js-based truck cargo optimization using Zustand state management
- 🎨 **Dark/Light Theme**: Theme toggle with persistent preferences
- 🔄 **Real-time Updates**: WebSocket support for live status updates
- ♿ **Accessibility**: WCAG compliance considerations

### Admin Features
- Fleet management and vehicle tracking
- Driver performance analytics
- Cost analysis and billing
- User role management
- System settings and configuration

### Driver Features
- Daily route overview
- Stop-by-stop navigation
- Delivery status updates
- POD capture and submission
- Trip summary and completion

### POD Admin Features
- Photo verification workflow
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
