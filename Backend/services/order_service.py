"""
Order Service - Delivery order processing and management
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import models
from schemas import OrderCreate, OrderResponse
from utils.helpers import classify_store, time_str_to_minutes


class OrderService:
    """Service for order operations"""
    
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> models.DeliveryOrder:
        """
        Create new delivery order
        
        Args:
            db: Database session
            order_data: OrderCreate schema
            
        Returns:
            Created DeliveryOrder object
        """
        # Classify store type
        is_mall = classify_store(order_data.customer_name)
        
        # Create order
        order = models.DeliveryOrder(
            order_id=order_data.order_id,
            customer_name=order_data.customer_name,
            latitude=order_data.latitude,
            longitude=order_data.longitude,
            weight_total=order_data.weight_total,
            service_type=order_data.service_type,
            delivery_window_start=order_data.delivery_window_start,
            delivery_window_end=order_data.delivery_window_end,
            store_id=order_data.store_id if order_data.store_id else (1 if is_mall else 0),
            status=models.DOStatus.so_waiting_verification
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        return order
    
    
    @staticmethod
    def get_order(db: Session, order_id: str) -> models.DeliveryOrder:
        """
        Get order by ID
        
        Args:
            db: Database session
            order_id: Order ID
            
        Returns:
            DeliveryOrder object if found, None otherwise
        """
        return db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == order_id
        ).first()
    
    
    @staticmethod
    def get_orders_by_date(db: Session, date: str) -> List[models.DeliveryOrder]:
        """
        Get all orders for a specific date
        
        Args:
            db: Database session
            date: Date string (YYYY-MM-DD)
            
        Returns:
            List of DeliveryOrder objects
        """
        from datetime import datetime as dt
        date_obj = dt.strptime(date, "%Y-%m-%d").date()
        
        orders = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.created_at >= dt.combine(date_obj, dt.min.time()),
            models.DeliveryOrder.created_at < dt.combine(date_obj, dt.max.time())
        ).all()
        
        return orders
    
    
    @staticmethod
    def update_order_status(
        db: Session,
        order_id: str,
        status: models.DOStatus
    ) -> models.DeliveryOrder:
        """
        Update order status
        
        Args:
            db: Database session
            order_id: Order ID
            status: New status
            
        Returns:
            Updated DeliveryOrder object
        """
        order = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == order_id
        ).first()
        
        if order:
            order.status = status
            db.commit()
            db.refresh(order)
        
        return order
    
    
    @staticmethod
    def assign_order_to_route(
        db: Session,
        order_id: str,
        route_id: str,
        driver_id: int
    ) -> models.DeliveryOrder:
        """
        Assign order to route
        
        Args:
            db: Database session
            order_id: Order ID
            route_id: Route ID
            driver_id: Driver ID
            
        Returns:
            Updated DeliveryOrder object
        """
        order = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == order_id
        ).first()
        
        if order:
            order.route_id = route_id
            order.driver_id = driver_id
            order.status = models.DOStatus.do_assigned_to_route
            db.commit()
            db.refresh(order)
        
        return order
    
    
    @staticmethod
    def get_pending_orders(db: Session) -> List[models.DeliveryOrder]:
        """
        Get all pending orders (not assigned to routes)
        
        Args:
            db: Database session
            
        Returns:
            List of pending DeliveryOrder objects
        """
        return db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.status == models.DOStatus.do_verified
        ).all()
    
    
    @staticmethod
    def update_order_coordinates(
        db: Session,
        order_id: str,
        latitude: float,
        longitude: float
    ) -> models.DeliveryOrder:
        """
        Update order delivery coordinates
        
        Args:
            db: Database session
            order_id: Order ID
            latitude: New latitude
            longitude: New longitude
            
        Returns:
            Updated DeliveryOrder object
        """
        order = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == order_id
        ).first()
        
        if order:
            order.latitude = latitude
            order.longitude = longitude
            db.commit()
            db.refresh(order)
        
        return order
