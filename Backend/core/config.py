"""
Configuration module - Load settings from environment variables
"""
from dotenv import load_dotenv
import os

load_dotenv()

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:captainzhyper@localhost:5432/tms_japfa"
)

# ==========================================
# SECURITY & JWT CONFIGURATION
# ==========================================
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_ganti_ini")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
APP_NAME = "TMS JAPFA - AI Engine"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = "Transport Management System dengan CVRPTW Optimization"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# ==========================================
# EXTERNAL API CONFIGURATION
# ==========================================
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY", "xUy50YsjmbRexLalxX3ThDpmC1lOzElP")

# ==========================================
# FILE UPLOAD CONFIGURATION
# ==========================================
UPLOAD_DIR = "uploads"
EPOD_DIR = os.path.join(UPLOAD_DIR, "epod")
GEOMETRY_DIR = "route_geometries"

# Create directories if not exist
os.makedirs(EPOD_DIR, exist_ok=True)
os.makedirs(GEOMETRY_DIR, exist_ok=True)
