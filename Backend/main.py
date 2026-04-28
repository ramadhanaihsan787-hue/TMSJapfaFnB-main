"""
TMS JAPFA Backend - Main Application Entry Point
Arsitektur sudah dirapikan oleh CTO. Urutan inisialisasi:
1. Imports -> 2. FastAPI Init -> 3. Middleware -> 4. Static & Routers
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
import os

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
    driver as driver_router  # 🌟 Router Driver App lu
)

# ==========================================
# 1. CREATE TABLES (DATABASE)
# ==========================================
Base.metadata.create_all(bind=engine)

# ==========================================
# 2. INITIALIZE APP (WAJIB DI SINI!)
# ==========================================
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
)

# Pasang Jaring Pengaman Global
setup_exception_handlers(app)

# ==========================================
# 3. MIDDLEWARE & STATIC FILES
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
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
app.include_router(driver_router.router, tags=["Drivers"]) # 🌟 Router Driver App Hidup!

# ==========================================
# 6. SYSTEM ENDPOINTS
# ==========================================
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

@app.get("/", tags=["System"])
def read_root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }