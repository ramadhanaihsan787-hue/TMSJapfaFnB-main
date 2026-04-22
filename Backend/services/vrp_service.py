"""
VRP Service - Vehicle Routing Problem optimization and solving
"""
from typing import List, Dict, Any
from utils.distance_calc import calculate_distance_matrix, calculate_time_matrix
from services import vrp_solver

class VRPService:
    """Service for VRP operations"""
    
    @staticmethod
    def prepare_vrp_data(
        orders: List[Dict[str, Any]],
        vehicles: List[Dict[str, Any]],
        depot_lat: float = -6.2088,
        depot_lon: float = 106.8456
    ) -> Dict[str, Any]:
        """
        Prepare data for VRP solver
        
        Args:
            orders: List of order data with coordinates, weight
            vehicles: List of vehicle data with capacity
            depot_lat: Depot latitude
            depot_lon: Depot longitude
            
        Returns:
            Dictionary with coordinates, demands, capacities, etc.
        """
        # Build coordinates list (depot first, then orders)
        coordinates = [(depot_lat, depot_lon)]
        demands = [0]  # Depot has 0 demand
        
        for order in orders:
            coordinates.append((order["latitude"], order["longitude"]))
            demands.append(order["weight"])
        
        # Calculate distance and time matrices
        distance_matrix = calculate_distance_matrix(coordinates)
        time_matrix = calculate_time_matrix(distance_matrix, avg_speed_kmh=40)
        
        # Extract vehicle capacities
        capacities = [v["capacity_kg"] for v in vehicles]
        num_vehicles = len(vehicles)
        
        # Time windows for orders
        time_windows = [(360, 1200)] * len(orders)  # 6:00 to 20:00 default
        
        # Update with specific time windows if provided
        for i, order in enumerate(orders, start=1):
            if "delivery_window_start" in order and "delivery_window_end" in order:
                start = order["delivery_window_start"]
                end = order["delivery_window_end"]
                if start and end:
                    time_windows[i] = (start, end)
        
        return {
            "coordinates": coordinates,
            "distance_matrix": distance_matrix,
            "time_matrix": time_matrix,
            "demands": demands,
            "capacities": capacities,
            "num_vehicles": num_vehicles,
            "time_windows": time_windows,
            "depot": 0,
        }
    
    
    @staticmethod
    def solve_routes(vrp_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Solve VRP using optimization engine
        
        Args:
            vrp_data: VRP data prepared by prepare_vrp_data
            
        Returns:
            Dictionary with optimized routes
        """
        result = vrp_solver.solve_vrp(
            distance_matrix=vrp_data["distance_matrix"],
            time_matrix=vrp_data["time_matrix"],
            demands=vrp_data["demands"],
            num_vehicles=vrp_data["num_vehicles"],
            vehicle_capacities=vrp_data["capacities"],
            is_mall_list=[False] * len(vrp_data["demands"]),
            time_windows=vrp_data["time_windows"],
            base_drop_time=10,
            var_drop_time=2
        )
        
        return result
    
    
@staticmethod
def format_routes_for_db(
    routes: Dict[str, Any],
    vehicles: List[Dict[str, Any]],
    coordinates: List[tuple]
) -> List[Dict[str, Any]]:
        """
        Format optimized routes for database storage
        
        Args:
            routes: Optimized routes from solver
            vehicles: Vehicle list
            coordinates: Coordinates list (with depot)
            
        Returns:
            List of formatted route objects
        """
        formatted_routes = []
        
        for vehicle_id, route_indices in routes.items():
            if not route_indices or (len(route_indices) == 1 and route_indices[0] == 0):
                continue  # Skip empty routes
            
            route_data = {
                "vehicle_id": vehicle_id,
                "stops": [],
                "total_distance": 0,
                "total_weight": 0,
            }
            
            # Calculate route details
            for i, stop_idx in enumerate(route_indices):
                if stop_idx > 0:  # Skip depot
                    lat, lon = coordinates[stop_idx]
                    route_data["stops"].append({
                        "order_index": stop_idx,
                        "latitude": lat,
                        "longitude": lon,
                        "sequence": i
                    })
            
            formatted_routes.append(route_data)
        
        return formatted_routes
