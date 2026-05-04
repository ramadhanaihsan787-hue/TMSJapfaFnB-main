"""
Authentication Service - User login, registration, and token management
"""
from sqlalchemy.orm import Session
from datetime import timedelta # 🌟 IMPORT TIMEDELTA BUAT NGATUR WAKTU
from core.security import verify_password, get_password_hash, create_access_token
import models


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> models.User:
        """
        Authenticate user by username and password
        """
        user = db.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> models.User:
        """Get user by username"""
        return db.query(models.User).filter(
            models.User.username == username
        ).first()
    
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> models.User:
        """Get user by ID"""
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
        """Create new user"""
        existing = db.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if existing:
            raise ValueError(f"Username '{username}' already exists!")
        
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
        """Create JWT access token for user"""
        
        # 🌟 SUNTIKAN CTO: UMUR TOKEN DISET 120 MENIT (2 JAM) BIAR SUPIR NYAMAN!
        token_lifespan = timedelta(minutes=120)
        
        return create_access_token(
            data={
                "sub": user.username,
                "role": user.role.value,
                "user_id": user.id
            },
            expires_delta=token_lifespan # 🌟 KITA LEMPAR KE SECURITY ENGINE
        )
    
    
    @staticmethod
    def get_all_users(db: Session) -> list:
        """Get all users (admin only)"""
        return db.query(models.User).all()
    
    
    @staticmethod
    def update_user_password(db: Session, user_id: int, new_password: str) -> models.User:
        """Update user's password"""
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if user:
            user.hashed_password = get_password_hash(new_password)
            db.commit()
            db.refresh(user)
        
        return user