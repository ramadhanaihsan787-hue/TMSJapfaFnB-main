"""
Enums module - Enumeration types used across the application
"""
import enum

# ==========================================
# USER ROLE ENUM
# ==========================================
class UserRole(enum.Enum):
    """User roles in the system"""
    manager_logistik = "manager_logistik"
    admin_distribusi = "admin_distribusi"
    admin_pod = "admin_pod"
    driver = "driver"


# ==========================================
# DELIVERY ORDER STATUS ENUM
# ==========================================
class DOStatus(enum.Enum):
    """Delivery Order statuses"""
    so_waiting_verification = "SO_WAITING_VERIFICATION"
    do_verified = "DO_VERIFIED"
    do_assigned_to_route = "DO_ASSIGNED_TO_ROUTE"
    delivered_success = "DELIVERED_SUCCESS"
    delivered_partial = "DELIVERED_PARTIAL"
    billed = "BILLED"


# ==========================================
# SERVICE TYPE ENUM
# ==========================================
class ServiceType(enum.Enum):
    """Types of delivery service"""
    regular = "regular"
    express = "express"
    priority = "priority"


# ==========================================
# VEHICLE STATUS ENUM
# ==========================================
class VehicleStatus(enum.Enum):
    """Vehicle operational status"""
    available = "Available"
    in_use = "InUse"
    maintenance = "Maintenance"
    inactive = "Inactive"
