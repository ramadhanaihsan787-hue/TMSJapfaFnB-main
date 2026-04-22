"""
Validators module - Data validation functions
"""
import re
from typing import Tuple


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        bool: True if valid email format, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_coordinates(latitude: float, longitude: float) -> bool:
    """
    Validate geographic coordinates
    
    Args:
        latitude: Latitude (-90 to 90)
        longitude: Longitude (-180 to 180)
        
    Returns:
        bool: True if coordinates are valid, False otherwise
    """
    return -90 <= latitude <= 90 and -180 <= longitude <= 180


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format (Indonesian)
    
    Args:
        phone: Phone number
        
    Returns:
        bool: True if valid phone format
    """
    # Remove common separators
    phone_clean = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Must be 10-15 digits, optionally starting with +
    pattern = r'^\+?[0-9]{10,15}$'
    return re.match(pattern, phone_clean) is not None


def validate_license_plate(plate: str) -> bool:
    """
    Validate Indonesian license plate format
    
    Args:
        plate: License plate
        
    Returns:
        bool: True if valid format
        
    Example:
        Valid: "B 1234 CD", "B1234CD"
        Invalid: "123456"
    """
    # Indonesian format: [Letter(s)] [Digits] [Letters]
    pattern = r'^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{1,3}$'
    return re.match(pattern, plate.strip().upper()) is not None


def validate_time_window(start_minutes: int, end_minutes: int) -> bool:
    """
    Validate time window (start < end, both within 0-1440)
    
    Args:
        start_minutes: Start time in minutes from midnight
        end_minutes: End time in minutes from midnight
        
    Returns:
        bool: True if valid time window
    """
    return 0 <= start_minutes < end_minutes <= 1440


def validate_weight(weight: float) -> bool:
    """
    Validate delivery weight
    
    Args:
        weight: Weight in kg
        
    Returns:
        bool: True if weight is positive
    """
    return weight > 0


def validate_capacity(weight: float, capacity: float) -> bool:
    """
    Validate if weight fits in capacity
    
    Args:
        weight: Weight to deliver (kg)
        capacity: Vehicle capacity (kg)
        
    Returns:
        bool: True if weight <= capacity
    """
    return weight <= capacity
