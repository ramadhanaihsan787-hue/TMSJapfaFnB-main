"""
Route Service - Route management and confirmation
"""
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models


class RouteService:
    """Service for route operations"""
    
    @staticmethod
    def create_route(
        db: Session,
        vehicle_id: int,
        driver_id: int,
        route_date: str,
        route_data: Dict[str, Any]
    ) -> models.TMSRoutePlan:
        """
        Create new route plan
        
        Args:
            db: Database session
            vehicle_id: Vehicle ID
            driver_id: Driver ID
            route_date: Route date (YYYY-MM-DD)
            route_data: Route data with stops, distance, weight
            
        Returns:
            Created TMSRoutePlan object
        """
        from datetime import datetime
        
        route = models.TMSRoutePlan(
            vehicle_id=vehicle_id,
            driver_id=driver_id,
            route_date=datetime.strptime(route_date, "%Y-%m-%d").date(),
            total_distance=route_data.get("total_distance", 0),
            total_weight=route_data.get("total_weight", 0),
            status="planned"
        )
        
        db.add(route)
        db.commit()
        db.refresh(route)
        
        return route
    
    
    @staticmethod
    def get_route(db: Session, route_id: int) -> models.TMSRoutePlan:
        """
        Get route by ID
        
        Args:
            db: Database session
            route_id: Route ID
            
        Returns:
            TMSRoutePlan object if found
        """
        return db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.route_id == route_id
        ).first()
    
    
    @staticmethod
    def get_routes_by_date(db: Session, route_date: str) -> List[models.TMSRoutePlan]:
        """
        Get all routes for a specific date
        
        Args:
            db: Database session
            route_date: Date (YYYY-MM-DD)
            
        Returns:
            List of TMSRoutePlan objects
        """
        from datetime import datetime
        date_obj = datetime.strptime(route_date, "%Y-%m-%d").date()
        
        return db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.route_date == date_obj
        ).all()
    
    
    @staticmethod
    def get_routes_by_vehicle(
        db: Session,
        vehicle_id: int,
        route_date: str = None
    ) -> List[models.TMSRoutePlan]:
        """
        Get routes for a vehicle
        
        Args:
            db: Database session
            vehicle_id: Vehicle ID
            route_date: Optional date filter
            
        Returns:
            List of TMSRoutePlan objects
        """
        query = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.vehicle_id == vehicle_id
        )
        
        if route_date:
            from datetime import datetime
            date_obj = datetime.strptime(route_date, "%Y-%m-%d").date()
            query = query.filter(models.TMSRoutePlan.route_date == date_obj)
        
        return query.all()
    
    
    @staticmethod
    def update_route_status(
        db: Session,
        route_id: int,
        status: str
    ) -> models.TMSRoutePlan:
        """
        Update route status
        
        Args:
            db: Database session
            route_id: Route ID
            status: New status (planned, in_progress, completed)
            
        Returns:
            Updated TMSRoutePlan object
        """
        route = db.query(models.TMSRoutePlan).filter(
            models.TMSRoutePlan.route_id == route_id
        ).first()
        
        if route:
            route.status = status
            db.commit()
            db.refresh(route)
        
        return route
    
    
    @staticmethod
    def confirm_route_delivery(
        db: Session,
        route_id: int,
        order_id: str,
        delivery_status: str
    ) -> models.DeliveryOrder:
        """
        Confirm delivery for an order in route
        
        Args:
            db: Database session
            route_id: Route ID
            order_id: Order ID
            delivery_status: Delivery status (success, partial, failed)
            
        Returns:
            Updated DeliveryOrder object
        """
        order = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == order_id,
            models.DeliveryOrder.route_id == route_id
        ).first()
        
        if order:
            if delivery_status == "success":
                order.status = models.DOStatus.delivered_success
            elif delivery_status == "partial":
                order.status = models.DOStatus.delivered_partial
            
            db.commit()
            db.refresh(order)
        
        return order
