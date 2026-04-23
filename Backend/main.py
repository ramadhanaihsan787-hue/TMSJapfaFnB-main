"""
TMS JAPFA Backend - Main Application Entry Point

A clean, modular FastAPI application for Transport Management System.
All business logic is organized in routers and services.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi


# Core configuration
from core.config import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    UPLOAD_DIR,
)

# Database
from database import engine, Base

# Routers
from routers import auth as auth_router
from routers import orders as orders_router
from routers import vrp as vrp_router
from routers import fleet as fleet_router
from routers import analytics as analytics_router
from routers import dashboard as dashboard_router
from routers import settings as settings_router
from routers import customer as customer_router
from routers import auth, fleet, driver
from routers import customer

# ==========================================
# CREATE TABLES
# ==========================================
Base.metadata.create_all(bind=engine)

# ==========================================
# INITIALIZE APP
# ==========================================
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

# ==========================================
# CUSTOM OPENAPI - BEARER TOKEN SUPPORT
# ==========================================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=APP_NAME,
        version=APP_VERSION,
        description=APP_DESCRIPTION,
        routes=app.routes,
    )

    # Add Bearer token security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ==========================================
# MIDDLEWARE
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ==========================================
# INCLUDE ROUTERS
# ==========================================
app.include_router(auth_router.router, tags=["Authentication"])
app.include_router(orders_router.router, tags=["Orders"])
app.include_router(vrp_router.router, tags=["VRP & Routes"])
app.include_router(fleet_router.router, tags=["Fleet"])
app.include_router(analytics_router.router, tags=["Analytics"])
app.include_router(dashboard_router.router, tags=["Dashboard"])
app.include_router(settings_router.router, tags=["Settings"])
app.include_router(customer_router.router, tags=["Customers"])
app.include_router(driver.router, tags=["Drivers"])
app.include_router(customer.router)
# ==========================================
# HEALTH CHECK ENDPOINT
# ==========================================
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": APP_NAME,
        "version": APP_VERSION
    }

# ==========================================
# ROOT ENDPOINT
# ==========================================
@app.get("/")
def read_root():
    """API root endpoint"""
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "description": APP_DESCRIPTION,
        "docs": "/docs",
        "health": "/health"
    }