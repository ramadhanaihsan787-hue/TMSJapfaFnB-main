"""
TMS JAPFA Backend - Main Application Entry Point
Arsitektur sudah dirapikan oleh CTO. Urutan inisialisasi:
1. Imports -> 2. FastAPI Init -> 3. Middleware (CORS & Rate Limit) -> 4. Static & Routers
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
import os

# 🌟 IMPORT SATPAM ANTI-DDoS (SLOWAPI)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Core & Config
from core.config import settings
from core.exceptions import setup_exception_handlers

# Database
from database import engine, Base

# Routers
from routers import (
    auth as auth_router,
    orders as orders_router,
    vrp as vrp_router,
    fleet as fleet_router,
    analytics as analytics_router,
    dashboard as dashboard_router,
    settings as settings_router,
    customer as customer_router,
    driver as driver_router,
    finance as finance_router
)

# ==========================================
# 1. CREATE TABLES (DATABASE)
# ==========================================
Base.metadata.create_all(bind=engine)

# ==========================================
# 2. INITIALIZE APP & RATE LIMITER (SATPAM)
# ==========================================
# Satpam bakal nyatet IP Address. Default: 100 request per menit per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)

# Daftarin Satpam ke dalem aplikasi
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Pasang Jaring Pengaman Global
setup_exception_handlers(app)

# ==========================================
# 3. MIDDLEWARE (CORS) & STATIC FILES
# ==========================================
# 🌟 FIX SECURITY: Jangan pake "*". Daftarin alamat Frontend lu!
# Tambahin port lain kalau lu pake Vite (5173) atau IP Local LAN HP Supir.
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    # "https://tms-japfa.com", # Buka komen ini kalau udah naik ke server asli
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS, 
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Jangan kasih "*", definisikan jelas!
    allow_headers=["*"],
)

# Pastikan folder static ada biar ngga error pas mount
os.makedirs("static/uploads/epod", exist_ok=True)

# Mount folder static & uploads
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ==========================================
# 4. CUSTOM OPENAPI (BEARER TOKEN)
# ==========================================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    openapi_schema["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ==========================================
# 5. INCLUDE ROUTERS
# ==========================================
app.include_router(auth_router.router, tags=["Authentication"])
app.include_router(orders_router.router, tags=["Orders"])
app.include_router(vrp_router.router, tags=["VRP & Routes"])
app.include_router(fleet_router.router, tags=["Fleet"])
app.include_router(analytics_router.router, tags=["Analytics"])
app.include_router(dashboard_router.router, tags=["Dashboard"])
app.include_router(settings_router.router, tags=["Settings"])
app.include_router(customer_router.router, tags=["Customers"])
app.include_router(driver_router.router, tags=["Drivers"])
app.include_router(finance_router.router, tags=["Finance & Expenses"])

# ==========================================
# 6. SYSTEM ENDPOINTS
# ==========================================
@app.get("/health", tags=["System"])
@limiter.limit("5/minute") # 🌟 CONTOH: Endpoint ini cuma boleh dipanggil 5x per menit!
def health_check(request: Request):
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

@app.get("/", tags=["System"])
def read_root(request: Request):
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }