"""
Constants module - Immutable application constants
"""

# ==========================================
# VALID ROLES
# ==========================================
VALID_ROLES = [
    "manager_logistik",
    "admin_distribusi",
    "admin_pod",
    "driver"
]

# ==========================================
# ORDER STATUSES
# ==========================================
ORDER_STATUSES = [
    "SO_WAITING_VERIFICATION",
    "DO_VERIFIED",
    "DO_ASSIGNED_TO_ROUTE",
    "DELIVERED_SUCCESS",
    "DELIVERED_PARTIAL",
    "BILLED",
]

# ==========================================
# VEHICLE STATUSES
# ==========================================
VEHICLE_STATUSES = [
    "Available",
    "InUse",
    "Maintenance",
    "Inactive",
]

# ==========================================
# TIME WINDOWS (in minutes from 00:00)
# ==========================================
DEFAULT_DELIVERY_WINDOW_START = 6 * 60  # 06:00
DEFAULT_DELIVERY_WINDOW_END = 20 * 60   # 20:00

# ==========================================
# STORE CLASSIFICATION KEYWORDS
# ==========================================
MALL_KEYWORDS = [
    'MALL',
    'PLAZA',
    'SQUARE',
    'FOOD HALL',
    'SUPERMARKET',
    'ITC',
    'HYPERMART',
    'AEON',
    'HERO',
    'TRANSMART',
    'LOTTE',
]

# ==========================================
# DISTANCE & TIME CONSTANTS
# ==========================================
EARTH_RADIUS_METERS = 6371000
DEFAULT_DELIVERY_TIME_MINUTES = 10  # Expected time per delivery
ROUTING_TIMEOUT_SECONDS = 30

# ==========================================
# FILE UPLOAD LIMITS
# ==========================================
MAX_FILE_SIZE_MB = 50
ALLOWED_EXTENSIONS = {'.xlsx', '.xls', '.csv', '.json'}
