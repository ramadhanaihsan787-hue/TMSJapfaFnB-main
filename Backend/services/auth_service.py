"""
Authentication Service - User login, registration, and token management
"""
from sqlalchemy.orm import Session
from core.security import verify_password, get_password_hash, create_access_token
import models


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> models.User:
        """
        Authenticate user by username and password
        
        Args:
            db: Database session
            username: User's username
            password: User's password
            
        Returns:
            User object if credentials valid, None otherwise
        """
        user = db.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> models.User:
        """
        Get user by username
        
        Args:
            db: Database session
            username: User's username
            
        Returns:
            User object if found, None otherwise
        """
        return db.query(models.User).filter(
            models.User.username == username
        ).first()
    
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> models.User:
        """
        Get user by ID
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User object if found, None otherwise
        """
        return db.query(models.User).filter(
            models.User.id == user_id
        ).first()
    
    
    @staticmethod
    def create_user(
        db: Session,
        username: str,
        password: str,
        full_name: str,
        role: str
    ) -> models.User:
        """
        Create new user
        
        Args:
            db: Database session
            username: User's username (must be unique)
            password: User's password (will be hashed)
            full_name: User's full name
            role: User's role
            
        Returns:
            Created User object
            
        Raises:
            ValueError: If username already exists
        """
        # Check if username already exists
        existing = db.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if existing:
            raise ValueError(f"Username '{username}' already exists!")
        
        # Create new user
        new_user = models.User(
            username=username,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=models.UserRole(role)
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    
    
    @staticmethod
    def create_access_token_for_user(user: models.User) -> str:
        """
        Create JWT access token for user
        
        Args:
            user: User object
            
        Returns:
            JWT token string
        """
        return create_access_token(
            data={
                "sub": user.username,
                "role": user.role.value,
                "user_id": user.id
            }
        )
    
    
    @staticmethod
    def get_all_users(db: Session) -> list:
        """
        Get all users (admin only)
        
        Args:
            db: Database session
            
        Returns:
            List of User objects
        """
        return db.query(models.User).all()
    
    
    @staticmethod
    def update_user_password(db: Session, user_id: int, new_password: str) -> models.User:
        """
        Update user's password
        
        Args:
            db: Database session
            user_id: User ID
            new_password: New password
            
        Returns:
            Updated User object
        """
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if user:
            user.hashed_password = get_password_hash(new_password)
            db.commit()
            db.refresh(user)
        
        return user
