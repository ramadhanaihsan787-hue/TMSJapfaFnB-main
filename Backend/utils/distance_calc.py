"""
Distance calculation utilities for VRP and routing
"""
from typing import List, Tuple
from .helpers import calculate_haversine


def calculate_distance_matrix(coordinates: List[Tuple[float, float]]) -> List[List[int]]:
    """
    Calculate distance matrix between all coordinate pairs
    
    Args:
        coordinates: List of (latitude, longitude) tuples
        
    Returns:
        List[List[int]]: Distance matrix in meters
        
    Example:
        coords = [(lat1, lon1), (lat2, lon2), (lat3, lon3)]
        matrix = calculate_distance_matrix(coords)
    """
    n = len(coordinates)
    matrix = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i != j:
                distance = calculate_haversine(
                    coordinates[i][0], coordinates[i][1],
                    coordinates[j][0], coordinates[j][1]
                )
                matrix[i][j] = int(distance)
    
    return matrix


def calculate_time_matrix(
    distance_matrix: List[List[int]],
    avg_speed_kmh: float = 40
) -> List[List[int]]:
    """
    Calculate time matrix based on distance and average speed
    
    Args:
        distance_matrix: Distance matrix in meters
        avg_speed_kmh: Average speed in km/h (default 40)
        
    Returns:
        List[List[int]]: Time matrix in minutes
        
    Example:
        time_matrix = calculate_time_matrix(distance_matrix, avg_speed_kmh=50)
    """
    speed_mps = (avg_speed_kmh * 1000) / 3600  # Convert km/h to m/s
    n = len(distance_matrix)
    matrix = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i != j:
                time_seconds = distance_matrix[i][j] / speed_mps
                time_minutes = int(time_seconds / 60)
                matrix[i][j] = max(time_minutes, 1)  # At least 1 minute
    
    return matrix


def estimate_delivery_time(
    distance_meters: float,
    avg_speed_kmh: float = 40,
    base_delivery_time: int = 10
) -> int:
    """
    Estimate total delivery time (travel + service time)
    
    Args:
        distance_meters: Distance to travel in meters
        avg_speed_kmh: Average speed in km/h
        base_delivery_time: Base service time in minutes
        
    Returns:
        int: Total estimated time in minutes
    """
    speed_mps = (avg_speed_kmh * 1000) / 3600
    travel_time = int((distance_meters / speed_mps) / 60)
    return travel_time + base_delivery_time
