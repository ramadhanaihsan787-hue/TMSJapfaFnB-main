"""
Formatters module - Data formatting and transformation utilities
"""
from typing import Dict, List, Any
from datetime import time as datetime_time
from .helpers import menit_ke_jam, minutes_to_time_str


def format_time(minutes: int) -> str:
    """
    Format minutes to 'HH:MM' string
    
    Args:
        minutes: Total minutes from midnight
        
    Returns:
        str: Formatted time string
    """
    return minutes_to_time_str(minutes)


def format_coordinates(latitude: float, longitude: float, decimals: int = 6) -> str:
    """
    Format coordinates to readable string
    
    Args:
        latitude: Latitude value
        longitude: Longitude value
        decimals: Number of decimal places
        
    Returns:
        str: Formatted coordinates
        
    Example:
        format_coordinates(-6.2088, 106.8456, 4) -> "-6.2088, 106.8456"
    """
    return f"{latitude:.{decimals}f}, {longitude:.{decimals}f}"


def format_distance(meters: float) -> str:
    """
    Format distance to readable string
    
    Args:
        meters: Distance in meters
        
    Returns:
        str: Formatted distance
        
    Example:
        format_distance(1500) -> "1.5 km"
        format_distance(500) -> "500 m"
    """
    if meters >= 1000:
        return f"{meters / 1000:.1f} km"
    return f"{int(meters)} m"


def format_weight(kg: float) -> str:
    """
    Format weight to readable string
    
    Args:
        kg: Weight in kilograms
        
    Returns:
        str: Formatted weight
    """
    if kg >= 1000:
        return f"{kg / 1000:.1f} ton"
    return f"{kg:.1f} kg"


def format_response(
    data: Any = None,
    message: str = "Success",
    status: str = "success",
    error: str = None
) -> Dict[str, Any]:
    """
    Format API response to standard structure
    
    Args:
        data: Response data
        message: Success message
        status: Response status (success/error)
        error: Error message if failed
        
    Returns:
        dict: Formatted response
        
    Example:
        format_response(data={"id": 1}, message="User created")
        format_response(error="User not found", status="error")
    """
    response = {
        "status": status,
        "message": message,
    }
    
    if data is not None:
        response["data"] = data
    
    if error is not None:
        response["error"] = error
    
    return response


def format_order_response(order: Any) -> Dict[str, Any]:
    """
    Format delivery order for API response
    
    Args:
        order: Order object from database
        
    Returns:
        dict: Formatted order data
    """
    return {
        "order_id": order.order_id,
        "customer_name": order.customer_name,
        "latitude": float(order.latitude),
        "longitude": float(order.longitude),
        "weight": order.weight_total,
        "status": order.status.value if hasattr(order.status, 'value') else order.status,
        "driver_id": order.driver_id,
        "created_at": order.created_at.isoformat() if hasattr(order, 'created_at') else None,
    }


def format_route_response(route: Any) -> Dict[str, Any]:
    """
    Format route for API response
    
    Args:
        route: Route object from database
        
    Returns:
        dict: Formatted route data
    """
    return {
        "route_id": route.route_id,
        "vehicle_id": route.vehicle_id,
        "driver_id": route.driver_id,
        "route_date": route.route_date.isoformat() if hasattr(route, 'route_date') else None,
        "total_distance": route.total_distance,
        "total_weight": route.total_weight,
        "status": route.status if hasattr(route, 'status') else "active",
        "stops_count": route.stops_count if hasattr(route, 'stops_count') else 0,
    }
