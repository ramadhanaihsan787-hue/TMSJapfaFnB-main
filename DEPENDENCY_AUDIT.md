# DEPENDENCY & CONFIGURATION AUDIT REPORT

Generated: May 4, 2026

---

## 📋 BACKEND - requirements.txt ANALYSIS

### ✅ FOUND (Correct)
- FastAPI (web framework)
- SQLAlchemy (ORM)
- psycopg2-binary (PostgreSQL driver)
- Pydantic + pydantic_core (validation)
- uvicorn (ASGI server)
- python-jose + cryptography (JWT)
- passlib + bcrypt (password hashing)
- Alembic (migrations) - via sqlalchemy-utils
- pandas, numpy (data processing)
- requests (HTTP client)
- python-multipart (file uploads)
- ortools (VRP optimization)
- py3dbp (optimization utilities)

### ❌ MISSING - CRITICAL
1. **slowapi** - Rate limiting/DDoS protection
   - Used in: `main.py` line 13-14
   - Status: MISSING
   - Fix: Add to requirements.txt

2. **pydantic-settings** - Settings management
   - Used in: `core/config.py` line 2
   - Status: MISSING (but pydantic might include it)
   - Fix: Add explicitly

### ⚠️ MISSING - RECOMMENDED
1. **gunicorn** - Production WSGI server (Vercel compatible)
2. **python-dotenv** - .env file loading (better than relying on Pydantic)
3. **redis** - Caching for analytics (optional)
4. **celery** - Task queue for async jobs (optional)
5. **email-validator** - Email validation for schemas
6. **sqlalchemy-utils** - Additional SQLAlchemy utilities
7. **pytz** - Timezone handling

### 🔍 UNUSED/QUESTIONABLE
- absl-py, annotated-doc, immutabledict - might be dependencies of other packages
- passlib==1.7.4 - very old version (current is 1.7.4, not 1.7.4 still)

---

## 📋 FRONTEND - package.json ANALYSIS

### ❌ WRONG PACKAGES (Backend packages in Frontend)
These packages should ONLY be in Backend, not Frontend:

1. **express** (^4.18.2) - Backend web framework
2. **cors** (^2.8.6) - Backend middleware (Frontend uses Axios, not Express)
3. **helmet** (^8.1.0) - Backend security headers
4. **morgan** (^1.10.1) - Backend logging middleware
5. **pg** (^8.20.0) - PostgreSQL driver (Backend only)
6. **pg-hstore** (^2.3.4) - PostgreSQL extension (Backend only)
7. **jsonwebtoken** (^9.0.3) - Backend JWT (Frontend uses jwt-decode, not jsonwebtoken)
8. **bcryptjs** (^2.4.3) - Backend password hashing
9. **compression** (^1.8.1) - Backend middleware
10. **dotenv** (^16.3.1) - Frontend should use Vite env instead

**Action:** Remove these from dependencies

### ✅ FOUND (Correct)
- React, React-DOM (UI framework)
- TypeScript
- Vite + React plugin
- Tailwind CSS
- React Router
- Zustand (state management)
- Axios (HTTP client)
- Three.js + React Three Fiber (3D)
- Leaflet + React Leaflet (maps)
- Framer Motion (animations)
- Lucide React (icons)
- React Hot Toast, Sonner (notifications)
- JWT Decode (token parsing)
- React Signature Canvas (signatures)
- @supabase/supabase-js (optional auth)
- leva (debug UI)
- Mapbox GL (maps - optional)

### ❌ MISSING - CRITICAL
1. **react-query** or **@tanstack/react-query**
   - Purpose: Server state management & caching
   - Recommended for complex APIs

2. **recharts** or **chart.js** + **react-chartjs-2**
   - Purpose: Analytics charts/graphs
   - Used in: Dashboard analytics features

3. **react-hook-form**
   - Purpose: Form state management (better than useState for forms)
   - Used in: Login, POD capture, settings forms

### ⚠️ MISSING - RECOMMENDED
1. **zod** - Type-safe schema validation (better than Pydantic equivalent)
2. **clsx** - Conditional className utility
3. **date-fns** - Date manipulation library
4. **react-dropzone** - File upload handling
5. **react-hot-keys** - Keyboard shortcuts
6. **uuid** - UUID generation
7. **vitest** - Already present ✓
8. **@testing-library/user-event** - User interaction testing

### 📝 devDependencies - GOOD
- ESLint + TypeScript ESLint
- Tailwind CSS
- Vitest + jsdom
- Testing Library

---

## 🐳 DOCKERFILE ANALYSIS

### Backend Dockerfile (`Backend/Dockerfile`)
**Status:** ✅ CORRECT

```dockerfile
FROM python:3.11-slim        # ✅ Good minimal image
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt  # ✅ Good practice
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]  # ✅ Correct
```

**Recommendations:**
1. Add health check
2. Run as non-root user (security)

### Frontend Dockerfile (`Frontend/Dockerfile`)
**Status:** ⚠️ ISSUES FOUND

```dockerfile
FROM node:18-alpine AS builder  # ⚠️ Should be 20-alpine (per package.json)
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Issues:**
1. Node 18 should be Node 20 (per engines field)
2. React Router handling commented out (need nginx.conf)
3. No nginx.conf for SPA routing

**Required nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }
    
    location /static {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## .gitignore ANALYSIS

### ✅ CORRECTLY IGNORED
- node_modules/, dist/, venv/, __pycache__/
- .env (generic)
- *.pyc, npm-debug.log*
- static/uploads/ (POD images)
- route_geometries/ (VRP data)
- .DS_Store, .vscode/, .idea

### ⚠️ MISSING IMPORTANT ENTRIES
1. **`.env.local`** - Local environment overrides
2. **`.env.*.local`** - Environment-specific locals
3. **`Backend/.env.test`** - Test environment config
4. **`Frontend/.env.local`** - Frontend local config
5. **`.pytest_cache/`** - Pytest cache directory
6. **`htmlcov/`** - Pytest HTML coverage reports
7. **`.coverage`** - Coverage data file
8. **`*.pem`, `*.key`** - SSL certificates
9. **`*.log`** - All log files
10. **`__pycache__/`** - Already there ✓
11. **`.venv/`** - Should add alongside venv/
12. **`Backend/dist/`** - Build output if any
13. **`.mypy_cache/`** - Mypy type checking cache
14. **`site-packages/`** - Installed packages

---

## SUMMARY OF ACTIONS NEEDED

### Priority 1 - CRITICAL (Must Fix)
1. ✅ Add `slowapi` to Backend requirements.txt
2. ✅ Add `pydantic-settings` to Backend requirements.txt
3. ✅ Remove backend packages from Frontend package.json (9 packages)
4. ✅ Add critical packages to Frontend (react-query, recharts/chart.js, react-hook-form)
5. ✅ Update Frontend Dockerfile Node version to 20
6. ✅ Create nginx.conf for Frontend SPA routing

### Priority 2 - RECOMMENDED (Should Fix)
1. ✅ Add recommended packages to Backend (gunicorn, python-dotenv, email-validator)
2. ✅ Add recommended packages to Frontend (zod, clsx, date-fns)
3. ✅ Add health check to Backend Dockerfile
4. ✅ Update .gitignore with missing patterns
5. ✅ Add non-root user to Backend Dockerfile

### Priority 3 - OPTIONAL (Nice to Have)
1. Add redis/celery for async tasks
2. Add comprehensive logging configuration
3. Add database backup scripts
4. Add CI/CD configuration (.github/workflows)

---

## FILES TO BE FIXED
- Backend/requirements.txt
- Frontend/package.json
- Frontend/Dockerfile
- Frontend/nginx.conf (CREATE NEW)
- .gitignore
- Backend/Dockerfile (optional improvements)
