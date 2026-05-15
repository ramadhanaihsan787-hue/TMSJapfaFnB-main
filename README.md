# TMS TIN - Transportasi Management System

## 🎯 Konsep & Visi Proyek

**TMS TIN** adalah Sistem Manajemen Transportasi (Transportation Management System) yang menintegrasikan operasi logistik end-to-end untuk perusahaan distribusi F&B (Food & Beverage). Sistem ini menghubungkan:

- **Pusat Distribusi** - Perencanaan & pengoptimalan rute
- **Armada Kendaraan** - Tracking & manajemen fleet
- **Driver** - Navigasi & delivery tracking
- **Customer** - Pengiriman tepat waktu
- **Admin POD** - Verifikasi proof-of-delivery
- **Management** - Real-time analytics & reporting

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│              Hybrid Feature-Based Architecture               │
│  Auth │ Dashboard │ Routes │ Analytics │ POD │ ... (12 feat) │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI + Python)                 │
│               Layered Service Architecture                   │
│  Router → Service → SQLAlchemy ORM → PostgreSQL Database    │
│  ├── Auth Service (JWT)                                     │
│  ├── Order Service                                          │
│  ├── VRP Solver (Route Optimization)                        │
│  ├── Analytics Engine                                       │
│  ├── POD Verification                                       │
│  └── Real-time Services                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
  PostgreSQL        Redis Cache        File Storage
   (Main DB)        (Analytics)        (POD Images)
```

---

## 💼 Use Cases & Workflow

### 1️⃣ **Order Creation Flow**
```
Customer/Sales
   ↓
Create Order (item details, destination)
   ↓
System validates (weight, volume, capacity)
   ↓
Order status: PENDING
   ↓ (Next day)
Logistics assigns to vehicle/driver
   ↓
Order status: ASSIGNED
```

### 2️⃣ **Route Planning & Optimization**
```
Morning at Distribution Center
   ↓
Load Planner batches orders by destination
   ↓
Run VRP Solver (optimization algorithm)
   ↓
Generate optimal routes (minimize cost/distance/time)
   ↓
Assign routes to vehicles & drivers
   ↓
Driver receives route on mobile app
```

### 3️⃣ **Delivery & POD Capture**
```
Driver navigates to each stop
   ↓
Arrives at customer location
   ↓
Capture photos of goods
   ↓
Get customer signature (digital)
   ↓
Submit POD (Proof of Delivery)
   ↓
Upload to backend
```

### 4️⃣ **POD Verification**
```
POD Admin dashboard shows pending PODs
   ↓
Admin reviews photos & signature
   ↓
Verify (accept) or Reject with notes
   ↓
If verified → Order status: DELIVERED
   ↓
If rejected → Order status: PENDING_REDELIVERY
```

### 5️⃣ **Analytics & Reporting**
```
Real-time tracking on Manager Dashboard
   ↓
Live KPIs (delivery rate, on-time %, cost/delivery)
   ↓
Driver performance ratings
   ↓
Fleet utilization analysis
   ↓
Cost breakdown & trends
```

---

## 🔑 Key Features

### For Drivers
- ✅ Daily route overview
- ✅ Turn-by-turn navigation (Leaflet maps)
- ✅ Stop-by-stop delivery checklist
- ✅ POD capture (photo + signature)
- ✅ Real-time location tracking
- ✅ Trip summary & completion status

### For Logistics Managers
- ✅ Load planning & optimization
- ✅ Route creation & assignment
- ✅ Fleet monitoring (location, status)
- ✅ Order tracking in real-time
- ✅ Driver performance metrics
- ✅ Cost analysis & billing

### For POD Admins
- ✅ Pending POD review queue
- ✅ Photo verification
- ✅ Signature validation
- ✅ Reject with notes for redelivery
- ✅ Historical POD records
- ✅ Delivery confirmation

### For Central Management
- ✅ Operations dashboard (KPIs)
- ✅ Fleet performance analysis
- ✅ Driver rankings
- ✅ Cost breakdown
- ✅ Alert system (high-priority issues)
- ✅ Report generation & export

---

## 🏢 User Roles & Permissions

### 1. **Admin Distribusi** (Distribution Center Admin)
- Create/edit orders
- Plan & optimize routes
- Manage fleet
- Assign drivers
- View analytics

### 2. **Manager Logistik** (Logistics Manager)
- Route planning
- Load optimization
- Driver assignment
- Performance monitoring
- Cost management

### 3. **Admin POD** (POD Verification Admin)
- Review POD photos
- Verify signatures
- Accept/reject deliveries
- Handle exceptions
- Generate reports

### 4. **Driver** (Delivery Driver)
- View assigned routes
- Navigate to stops
- Capture POD photos
- Get customer signatures
- Submit delivery confirmations

---

## 📊 Data Models Overview

### Core Entities

**Order**
- Customer info, delivery address
- Items (product, qty, weight, volume)
- Status tracking (pending → delivered)
- Cost calculation

**Vehicle** (Armada)
- Plate number, type (truck/van)
- Capacity (weight, volume, items)
- Current location & status
- Driver assignment

**Driver**
- License information
- Performance rating
- Trip statistics
- Assigned routes

**Route**
- Assigned orders & waypoints
- Optimized sequence
- Distance & time estimates
- Status tracking

**POD** (Proof of Delivery)
- Order reference
- Photos (array)
- Digital signature
- Verification status

**Analytics**
- KPIs (delivery rate, on-time %)
- Fleet utilization
- Driver performance
- Cost breakdown

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS** - Styling
- **React Router 7** - Routing
- **Three.js** - 3D visualization
- **Leaflet** - Maps
- **Zustand** - State management

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Pydantic** - Validation
- **Alembic** - Migrations

### Deployment
- **Vercel** - Frontend hosting
- **Cloud Server** - Backend hosting
- **PostgreSQL Cloud** - Database
- **Object Storage** - POD images

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 20    # Frontend
Python >= 3.9   # Backend
PostgreSQL 12+  # Database
Git
```

### Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Configure .env
DATABASE_URL=postgresql://user:pass@localhost:5432/tms_japfa
SECRET_KEY=your-secret-key

# Initialize database
alembic upgrade head
python scripts/init_db.py
python scripts/create_admin.py

# Start server
uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend Setup
```bash
cd Frontend
npm install

# Configure .env
VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev
# App: http://localhost:5173
```

---

## 🗂️ Project Structure

```
TMSJapfaFnB-main/
│
├── Frontend/                      # React app
│   ├── src/
│   │   ├── features/              # 12 feature modules
│   │   ├── shared/                # Reusable components & hooks
│   │   ├── context/               # Global contexts
│   │   ├── store/                 # Zustand stores
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md                  # Frontend documentation
│
├── Backend/                       # FastAPI app
│   ├── main.py                    # App initialization
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── database.py                # DB configuration
│   ├── dependencies.py            # DI setup
│   │
│   ├── routers/                   # API endpoints
│   │   ├── auth.py, orders.py, routes.py, ...
│   │   └── __init__.py
│   │
│   ├── services/                  # Business logic
│   │   ├── auth_service.py, order_service.py, ...
│   │   └── __init__.py
│   │
│   ├── utils/                     # Helpers
│   │   ├── distance_calc.py, formatters.py, ...
│   │   └── __init__.py
│   │
│   ├── core/                      # Configuration
│   │   ├── config.py, security.py, exceptions.py
│   │   └── __init__.py
│   │
│   ├── scripts/                   # Utilities
│   │   ├── init_db.py, seed_data.py, create_admin.py
│   │   └── __init__.py
│   │
│   ├── alembic/                   # Migrations
│   │   ├── env.py, script.py.mako
│   │   └── versions/
│   │
│   ├── test/                      # Tests
│   ├── requirements.txt
│   ├── alembic.ini
│   └── README.md                  # Backend documentation
│
├── README.md                      # This file
├── ARCHITECTURE_ANALYSIS.md       # Architecture decisions
└── MIGRATION_GUIDE.md             # Frontend refactoring progress
```

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ CORS configuration (whitelist origins)
- ✅ Rate limiting (DDoS protection)
- ✅ SQL injection prevention (ORM)
- ✅ HTTPS enforcement (production)
- ✅ Secure token expiration

---

## 📈 Performance & Scalability

### Frontend
- Hybrid Feature-Based architecture for team scalability
- Lazy loading of routes & components
- Optimized 3D rendering (WebGL)
- Efficient state management (Zustand)
- Production build optimization

### Backend
- Async FastAPI endpoints
- Database connection pooling
- Query optimization with ORM
- Caching for analytics
- Rate limiting to prevent abuse

### Database
- Indexed foreign keys & common queries
- Proper normalization
- Pagination for large datasets
- Regular backups

---

## 📞 API Documentation

### Development
- **Auto-generated Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Endpoints Summary
- `/auth/*` - Authentication
- `/orders/*` - Order management
- `/routes/*` - Route operations
- `/vrp/*` - Route optimization
- `/fleet/*` - Vehicle management
- `/driver/*` - Driver info
- `/pod/*` - Proof of delivery
- `/analytics/*` - KPIs & metrics
- `/dashboard/*` - Dashboard data
- `/settings/*` - Configuration

---

## 🧪 Testing

### Frontend
```bash
cd Frontend
npm run test              # Run tests
npm run test:watch       # Watch mode
npm run lint             # ESLint
```

### Backend
```bash
cd Backend
pytest                   # Run all tests
pytest --cov           # With coverage
pytest -v test/auth/   # Specific test file
```

---

## 🔄 Continuous Integration

Recommended CI/CD pipeline:
1. **Code Quality:** ESLint (Frontend), Pylint (Backend)
2. **Testing:** Vitest (Frontend), Pytest (Backend)
3. **Build:** `npm run build`, `python -m pytest`
4. **Deploy:** Vercel (Frontend), Cloud VM (Backend)

---

## 📚 Documentation Files

1. **Frontend/README.md** - Complete Frontend architecture & features
2. **Backend/README.md** - Complete Backend architecture & API docs
3. **ARCHITECTURE_ANALYSIS.md** - Architecture decision & comparison
4. **MIGRATION_GUIDE.md** - Frontend refactoring progress

---

## 🤝 Contributing

### Guidelines
1. Follow existing code patterns
2. Add TypeScript types (Frontend) & type hints (Backend)
3. Write tests for new features
4. Document changes
5. Create feature branches
6. Submit PR with description

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation update
refactor: Code refactoring
test: Test addition
chore: Build/dependency updates
```

---

## 📋 Development Roadmap

### Phase 1: Core System ✅
- Authentication & authorization
- Order management
- Route planning & optimization
- POD capture & verification

### Phase 2: Analytics & Reporting 🔄
- KPI dashboards
- Driver performance tracking
- Fleet utilization analysis
- Cost breakdown & trends

### Phase 3: Advanced Features (Planned)
- Real-time WebSocket updates
- Mobile app (native)
- AI-powered route optimization
- Predictive analytics
- Customer self-service portal

### Phase 4: Scaling (Planned)
- Multi-region deployment
- Database sharding
- Caching layer (Redis)
- Message queue (Kafka)
- Microservices architecture

---

## 🐛 Troubleshooting

### Common Issues

**Frontend won't connect to Backend**
- Check `.env` has correct `VITE_API_BASE_URL`
- Verify Backend is running on port 8000
- Check CORS configuration in `main.py`

**Database connection error**
- Verify PostgreSQL is running
- Check `.env` `DATABASE_URL` is correct
- Run `alembic upgrade head` for migrations

**Port already in use**
- Frontend: Change Vite port in `vite.config.ts`
- Backend: Use `--port 8001` in uvicorn command

---

## 📞 Support & Contact

For questions or issues:
1. Check relevant README files
2. Review API docs at `/docs`
3. Check test files for usage examples
4. Create GitHub issue with details

---

## 📝 License

This project is proprietary software for TMS Japfa.

---

## 🙏 Acknowledgments

Built with modern technologies and best practices for:
- **Scalability** - Feature-based architecture
- **Maintainability** - Clear separation of concerns
- **User Experience** - Intuitive dashboards & navigation
- **Performance** - Optimized algorithms & caching
- **Security** - JWT, RBAC, rate limiting

---

**Last Updated:** May 3, 2026  
**Version:** 1.0.0

Made with ❤️ for Japfa Transportation
