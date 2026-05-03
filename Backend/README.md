# Backend - Dokumentasi Lengkap

## 📋 Gambaran Umum

Backend TMS Japfa adalah REST API yang di-build dengan **FastAPI** (Python) dan **SQLAlchemy ORM**. System ini adalah "otak" dari seluruh operasi logistics, menangani:
- Autentikasi & Autorisasi (JWT)
- Order management & tracking
- Route optimization (VRP - Vehicle Routing Problem)
- Fleet management
- Analytics & reporting
- POD verification
- Real-time updates

### Stack Teknologi
- **FastAPI** - Modern async Python web framework
- **SQLAlchemy** - ORM untuk database abstraction
- **PostgreSQL** - Database relational
- **Alembic** - Database migration tool
- **JWT** - Token-based authentication
- **SlowAPI** - Rate limiting (DDoS protection)
- **Pydantic** - Data validation
- **CORS** - Cross-origin resource sharing
- **Orjson** - Fast JSON serialization

---

## 🏗️ Arsitektur

```
Backend/
├── main.py                 # FastAPI app initialization & middleware
├── database.py             # SQLAlchemy engine & session setup
├── dependencies.py         # DI (Dependency Injection) functions
├── models.py               # SQLAlchemy ORM models
├── schemas.py              # Pydantic request/response schemas
├── core/
│   ├── config.py           # Configuration & environment variables
│   ├── security.py         # JWT & password hashing
│   ├── constants.py        # App-wide constants
│   └── exceptions.py       # Custom exception handlers
│
├── routers/                # Endpoint modules (organized by feature)
│   ├── auth.py             # Login, logout, token refresh
│   ├── orders.py           # Order CRUD & tracking
│   ├── routes.py           # Route creation & optimization
│   ├── vrp.py              # Vehicle Routing Problem solver
│   ├── fleet.py            # Vehicle management
│   ├── analytics.py        # KPI & metrics
│   ├── dashboard.py        # Dashboard data
│   ├── settings.py         # System configuration
│   ├── customer.py         # Customer management
│   ├── driver.py           # Driver management
│   ├── finance.py          # Cost analysis
│   └── __init__.py         # Router imports
│
├── services/               # Business logic layer
│   ├── auth_service.py     # Authentication logic
│   ├── order_service.py    # Order operations
│   ├── route_service.py    # Route creation & management
│   ├── vrp_service.py      # VRP solver service
│   ├── map_service.py      # Geolocation & mapping
│   ├── analytics_service.py # Metrics & calculations
│   └── __init__.py
│
├── utils/                  # Helper functions
│   ├── distance_calc.py    # Haversine & routing calculations
│   ├── formatters.py       # Data formatting utilities
│   ├── helpers.py          # General helpers
│   └── validators.py       # Validation functions
│
├── scripts/                # Utility scripts
│   ├── init_db.py          # Database initialization
│   ├── seed_data.py        # Sample data seeding
│   ├── seed_customer.py    # Customer seed data
│   ├── seed_armada.py      # Fleet seed data
│   └── create_admin.py     # Admin user creation
│
├── alembic/                # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/           # Migration files
│       ├── 001_initial.py
│       └── 002_add_fields.py
│
├── test/                   # Test suites
│   ├── conftest.py         # Pytest configuration
│   ├── auth/
│   ├── orders/
│   ├── routes/
│   ├── drivers/
│   ├── pod/
│   └── customers/
│
├── static/uploads/epod/    # POD image storage
├── requirements.txt        # Python dependencies
├── alembic.ini             # Alembic configuration
├── .env                    # Environment variables
└── vercel.json             # Vercel deployment config
```

---

## 🗄️ Database Models

### Core Models

#### 1. **User** - User accounts & authentication
```python
- id: UUID
- username: String (unique)
- email: String (unique)
- password_hash: String
- role: UserRole (admin_distribusi, manager_logistik, admin_pod, driver)
- is_active: Boolean
- created_at: DateTime
- updated_at: DateTime
```

#### 2. **Customer** - Customer information
```python
- id: UUID
- name: String
- email: String
- phone: String
- address: String
- city: String
- province: String
- coordinates: JSON (latitude, longitude)
- credit_limit: Decimal
- created_at: DateTime
```

#### 3. **Order** - Delivery orders
```python
- id: UUID
- customer_id: FK(Customer)
- origin_address: String
- destination_address: String
- origin_coords: JSON
- destination_coords: JSON
- items: JSON (product, qty, weight, volume)
- total_weight: Decimal
- total_volume: Decimal
- status: OrderStatus (pending, assigned, in_transit, delivered, failed)
- assigned_vehicle_id: FK(Vehicle)
- assigned_driver_id: FK(Driver)
- assigned_route_id: FK(Route)
- scheduled_date: Date
- actual_delivery_date: Date
- cost: Decimal
- notes: String
- created_at: DateTime
```

#### 4. **Vehicle** (Armada) - Fleet vehicles
```python
- id: UUID
- plate_number: String (unique)
- vehicle_type: String (truck, van, bike)
- capacity_weight: Decimal (kg)
- capacity_volume: Decimal (m³)
- capacity_items: Integer
- status: VehicleStatus (available, in_use, maintenance, retired)
- current_location: JSON
- driver_id: FK(Driver)
- created_at: DateTime
```

#### 5. **Driver** - Driver information
```python
- id: UUID
- user_id: FK(User)
- name: String
- phone: String
- license_number: String
- license_expiry: Date
- status: DriverStatus (active, inactive, on_leave, terminated)
- rating: Decimal (1-5)
- trip_count: Integer
- completed_delivery: Integer
- failed_delivery: Integer
- created_at: DateTime
```

#### 6. **Route** - Delivery routes
```python
- id: UUID
- vehicle_id: FK(Vehicle)
- driver_id: FK(Driver)
- orders: Relationship([Order])
- origin: JSON
- destination: JSON
- waypoints: JSON (array of coordinates)
- status: RouteStatus (planned, in_progress, completed, cancelled)
- scheduled_date: Date
- actual_start_time: DateTime
- actual_end_time: DateTime
- total_distance: Decimal (km)
- total_duration: Integer (minutes)
- total_cost: Decimal
- created_at: DateTime
```

#### 7. **POD** (Proof of Delivery) - Delivery verification
```python
- id: UUID
- order_id: FK(Order)
- driver_id: FK(Driver)
- photo_urls: JSON (array of image URLs)
- signature_data: String (base64 or URL)
- recipient_name: String
- status: PODStatus (pending, captured, verified, rejected)
- verification_notes: String
- verified_by: FK(User)
- verified_at: DateTime
- created_at: DateTime
```

#### 8. **Analytics** - KPI data cache
```python
- id: UUID
- metric_type: String (delivery_rate, on_time_pct, cost_per_delivery)
- metric_value: Decimal
- period: Date
- breakdown: JSON (by route, by driver, by vehicle)
- created_at: DateTime
```

---

## 🔌 API Endpoints

### Authentication (`/auth`)

```
POST   /auth/login
       Request: { username, password }
       Response: { access_token, token_type, user: { id, role, name } }

POST   /auth/logout
       Headers: Authorization: Bearer {token}
       Response: { message: "Logged out" }

POST   /auth/refresh
       Headers: Authorization: Bearer {token}
       Response: { access_token, token_type }

GET    /auth/me
       Headers: Authorization: Bearer {token}
       Response: { id, username, email, role }
```

### Orders (`/orders`)

```
GET    /orders
       Query: ?skip=0&limit=100&status=pending&date=2024-01-15
       Response: PaginatedResponse<Order>

POST   /orders
       Request: { customer_id, items, scheduled_date, notes }
       Response: Order (newly created)

GET    /orders/{order_id}
       Response: Order (with full details)

PUT    /orders/{order_id}
       Request: { status, notes }
       Response: Order (updated)

DELETE /orders/{order_id}
       Response: { message: "Order deleted" }

GET    /orders/{order_id}/tracking
       Response: { status, current_location, eta }

POST   /orders/{order_id}/assign
       Request: { vehicle_id, driver_id, route_id }
       Response: Order (with assignment)
```

### Routes (`/routes`)

```
GET    /routes
       Query: ?status=planned&date=2024-01-15
       Response: PaginatedResponse<Route>

POST   /routes
       Request: { vehicle_id, driver_id, orders: [order_ids], scheduled_date }
       Response: Route (created)

GET    /routes/{route_id}
       Response: Route (with waypoints, orders, distance, cost)

PUT    /routes/{route_id}/status
       Request: { status: "in_progress" | "completed" | "cancelled" }
       Response: Route (updated)

GET    /routes/{route_id}/optimize
       Response: Route (optimized with VRP solver)

POST   /routes/{route_id}/waypoints
       Request: { waypoints: [coordinates] }
       Response: { distance, duration, cost }
```

### VRP Solver (`/vrp`)

```
POST   /vrp/solve
       Request: {
         vehicles: [{ id, capacity_weight, capacity_volume }],
         orders: [{ id, weight, volume, origin, destination }],
         optimization_goal: "cost" | "time" | "distance"
       }
       Response: {
         routes: [Route],
         total_distance: km,
         total_cost: IDR,
         utilization_pct: %
       }
```

### Fleet (`/fleet`)

```
GET    /fleet
       Response: PaginatedResponse<Vehicle>

POST   /fleet
       Request: { plate_number, vehicle_type, capacity_weight, capacity_volume }
       Response: Vehicle (created)

GET    /fleet/{vehicle_id}
       Response: Vehicle (with current status, driver, location)

PUT    /fleet/{vehicle_id}
       Request: { status, location, driver_id }
       Response: Vehicle (updated)

GET    /fleet/{vehicle_id}/location
       Response: { current_location, speed, heading }

GET    /fleet/{vehicle_id}/maintenance
       Response: [MaintenanceRecord]
```

### Drivers (`/driver`)

```
GET    /driver
       Response: PaginatedResponse<Driver>

POST   /driver
       Request: { name, phone, license_number, license_expiry }
       Response: Driver (created)

GET    /driver/{driver_id}
       Response: Driver (with rating, trip stats)

GET    /driver/{driver_id}/trips
       Response: [Trip] (recent trips)

GET    /driver/{driver_id}/performance
       Response: {
         rating: 4.5,
         completed_trips: 250,
         on_time_rate: 95.2,
         damage_rate: 1.2
       }
```

### POD (`/pod`)

```
GET    /pod
       Query: ?status=pending&date=2024-01-15
       Response: PaginatedResponse<POD>

POST   /pod/{order_id}
       Request: { photo_urls: [urls], signature_data, recipient_name }
       Response: POD (created)

GET    /pod/{pod_id}
       Response: POD (with photos, signature)

PUT    /pod/{pod_id}/verify
       Request: { status: "verified" | "rejected", notes }
       Response: POD (verified/rejected)

GET    /pod/{order_id}/history
       Response: [POD] (all PODs for order)
```

### Analytics (`/analytics`)

```
GET    /analytics/kpi
       Query: ?period=month&date=2024-01-01
       Response: {
         delivery_rate: 98.5,
         on_time_pct: 95.2,
         cost_per_delivery: 45000,
         avg_distance: 12.5
       }

GET    /analytics/fleet-utilization
       Response: {
         total_capacity: 500,
         used_capacity: 425,
         utilization_pct: 85
       }

GET    /analytics/driver-performance
       Response: [{ driver_id, name, rating, trips, on_time_pct }]

GET    /analytics/cost-breakdown
       Query: ?period=month
       Response: {
         fuel_cost: 5000000,
         maintenance: 1000000,
         labor: 8000000,
         other: 500000
       }
```

### Dashboard (`/dashboard`)

```
GET    /dashboard/driver
       Response: { current_route, next_stops, trip_progress }

GET    /dashboard/logistik
       Response: {
         active_orders: 150,
         in_transit: 45,
         pending: 105,
         fleet_status: { available: 20, in_use: 15, maintenance: 5 },
         alerts: [...]
       }

GET    /dashboard/pod
       Response: {
         pending_verification: 50,
         verified_today: 120,
         rejected: 5
       }

GET    /dashboard/manager
       Response: {
         kpi_summary: {...},
         top_drivers: [...],
         critical_orders: [...],
         fleet_health: {...}
       }
```

### Settings (`/settings`)

```
GET    /settings
       Response: SystemConfiguration

PUT    /settings
       Request: { cost_per_km, cost_per_item, max_weight, max_volume }
       Response: SystemConfiguration (updated)
```

---

## 🔐 Authentication & Security

### JWT Token Structure
```python
{
  "sub": user_id,
  "username": username,
  "role": UserRole,
  "exp": expiration_timestamp,
  "iat": issued_at_timestamp
}
```

### Password Security
- Hashed with bcrypt
- Minimum 8 characters, uppercase, lowercase, digit, special char
- Never stored as plain text

### Rate Limiting
- 100 requests/minute per IP (SlowAPI)
- Configurable per endpoint
- Protects against DDoS

### CORS Configuration
```python
ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://tms-japfa.com"
]
```

---

## 🚀 Development Setup

### Prerequisites
```bash
Python 3.9+
PostgreSQL 12+
pip & virtualenv
```

### Installation
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### Environment Variables
Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tms_japfa
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=true
APP_NAME=TMS Japfa
APP_VERSION=1.0.0
```

### Database Setup
```bash
# Create database
createdb tms_japfa

# Run migrations
alembic upgrade head

# Seed data (optional)
python scripts/init_db.py
python scripts/seed_data.py
python scripts/create_admin.py
```

### Development Server
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
# API: http://127.0.0.1:8000
# Docs: http://127.0.0.1:8000/docs
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Add new field"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=.

# Specific test
pytest test/auth/test_auth.py

# Watch mode
pytest-watch
```

---

## 📊 Data Flow

### Order Processing Flow
```
1. Customer creates order → Order(status=pending)
2. Logistics assigns → Order(status=assigned)
3. Driver picks up → Order(status=picked_up)
4. Driver in transit → Order(status=in_transit)
5. Driver arrives → Order(status=arrived)
6. Driver delivers & captures POD
7. Admin verifies POD
8. Order(status=delivered) or rejected
```

### Route Optimization Flow
```
1. Input: Orders, Vehicles, Constraints
2. Call VRP Solver
3. Output: Optimized routes with:
   - Order sequence
   - Waypoints
   - Distance & time estimates
   - Cost calculation
4. Assign routes to drivers
5. Monitor real-time progress
```

---

## 🛠️ Key Services

### `auth_service.py`
- User login & authentication
- Token generation & validation
- Password hashing & verification
- User role checking

### `order_service.py`
- Order CRUD operations
- Order status transitions
- Order validation (weight, volume, capacity)
- Delivery tracking

### `route_service.py`
- Route creation
- Route optimization via VRP
- Waypoint calculation
- ETA estimation

### `vrp_service.py`
- Vehicle Routing Problem solver
- Constraint handling (capacity, time windows)
- Cost optimization
- Alternative routes

### `map_service.py`
- Haversine distance calculation
- Route polyline generation
- Geocoding support
- ETA calculation

### `analytics_service.py`
- KPI calculation
- Metric aggregation
- Report generation
- Trend analysis

---

## 📈 Performance Optimization

- **Database Indexing:** Indexed on frequently queried fields
- **Connection Pooling:** SQLAlchemy session pooling
- **Async Operations:** FastAPI async endpoints
- **Caching:** Redis caching for analytics
- **Pagination:** Always paginate list endpoints
- **Query Optimization:** Selective field loading with `select()`

---

## 🔄 Real-time Updates

### WebSocket Support (Optional)
For real-time tracking, implement:
- `/ws/tracking/{order_id}` - Order status updates
- `/ws/fleet/{vehicle_id}` - Vehicle location updates
- `/ws/alerts` - System alerts

---

## 📝 Code Conventions

### Service Layer Pattern
```python
# services/order_service.py
class OrderService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_order(self, data: OrderCreate) -> Order:
        # Validation
        # Persistence
        # Return
        pass
```

### Router Pattern
```python
# routers/orders.py
@router.post("/")
async def create_order(order: OrderCreate, current_user: User = Depends(get_current_user)):
    service = OrderService(db)
    return service.create_order(order)
```

---

## 🚢 Deployment

### Vercel (Serverless)
- FastAPI is compatible with Vercel Functions
- See `vercel.json` for configuration
- Database must be externally hosted (PostgreSQL on AWS RDS, etc)

### Docker
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📖 Related Documentation

- **Frontend README** - UI implementation
- **Main README** - System overview
- **API Documentation** - `/docs` endpoint (auto-generated)

---

Made with ❤️ for TMS Japfa
