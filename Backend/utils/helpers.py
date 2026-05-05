"""
Helpers module - General utility helper functions
"""
import math
from datetime import time as datetime_time
from core.constants import EARTH_RADIUS_METERS, MALL_KEYWORDS
import json
from models import SystemAuditLog

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in meters between two points
    on the earth (specified in decimal degrees)
    
    Args:
        lat1, lon1: First coordinate (latitude, longitude)
        lat2, lon2: Second coordinate (latitude, longitude)
        
    Returns:
        float: Distance in meters
    """
    # Convert decimal degrees to radians
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = EARTH_RADIUS_METERS * c
    
    return distance


def menit_ke_jam(menit_total: int) -> datetime_time:
    """
    Convert minutes (from 00:00) to time object
    
    Args:
        menit_total: Total minutes from midnight
        
    Returns:
        datetime.time: Time object
        
    Example:
        menit_ke_jam(360) -> 06:00:00
        menit_ke_jam(1200) -> 20:00:00
    """
    return datetime_time(
        hour=int((menit_total // 60) % 24),
        minute=int(menit_total % 60)
    )


def jam_ke_menit(time_obj: datetime_time) -> int:
    """
    Convert time object to minutes from midnight
    
    Args:
        time_obj: Time object
        
    Returns:
        int: Total minutes from midnight
        
    Example:
        jam_ke_menit(time(6, 0)) -> 360
        jam_ke_menit(time(20, 0)) -> 1200
    """
    return time_obj.hour * 60 + time_obj.minute


def tambah_koma(teks: str) -> str:
    """
    Add comma prefix if text is not empty or 'nan'
    
    Args:
        teks: Text to process
        
    Returns:
        str: Text with comma prefix if not empty, else empty string
        
    Example:
        tambah_koma("Jakarta") -> ", Jakarta"
        tambah_koma("") -> ""
    """
    teks = str(teks).strip()
    if teks and teks.lower() != 'nan':
        return ', ' + teks
    return ''


def classify_store(store_name: str) -> bool:
    """
    Classify if store is a mall/supermarket (large store)
    
    Args:
        store_name: Name of the store
        
    Returns:
        bool: True if store is mall/supermarket, False otherwise
    """
    if not store_name:
        return False
    
    store_upper = str(store_name).upper()
    return any(kw in store_upper for kw in MALL_KEYWORDS)


def time_str_to_minutes(time_str: str) -> int:
    """
    Convert time string 'HH:MM' to minutes from midnight
    
    Args:
        time_str: Time string in format 'HH:MM'
        
    Returns:
        int: Total minutes from midnight
        
    Example:
        time_str_to_minutes("06:00") -> 360
        time_str_to_minutes("20:30") -> 1230
    """
    h, m = map(int, time_str.split(":"))
    return h * 60 + m


def minutes_to_time_str(minutes: int) -> str:
    """
    Convert minutes from midnight to 'HH:MM' string
    
    Args:
        minutes: Total minutes from midnight
        
    Returns:
        str: Time string in format 'HH:MM'
        
    Example:
        minutes_to_time_str(360) -> "06:00"
        minutes_to_time_str(1230) -> "20:30"
    """
    h = int((minutes // 60) % 24)
    m = int(minutes % 60)
    return f"{h:02d}:{m:02d}"

def log_audit_action(db, user_id, action, entity_type, entity_id, old_data=None, new_data=None, ip_address=None):
    """Fungsi helper untuk nyatet jejak digital ke tabel SystemAuditLog"""
    new_log = SystemAuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        old_values=json.dumps(old_data) if old_data else None,
        new_values=json.dumps(new_data) if new_data else None,
        ip_address=ip_address
    )
    db.add(new_log)
    db.commit()