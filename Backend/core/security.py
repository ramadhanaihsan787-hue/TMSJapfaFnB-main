"""
Security module - Password hashing and JWT token management
"""
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt

# 🌟 UBAH 1: Panggil 'settings' utuh dari config
from .config import settings

# ==========================================
# PASSWORD CONTEXT
# ==========================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# PASSWORD FUNCTIONS
# ==========================================
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if plain password matches hashed password
    
    Args:
        plain_password: Password entered by user
        hashed_password: Hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a plain password
    
    Args:
        password: Plain password to hash
        
    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


# ==========================================
# JWT TOKEN FUNCTIONS
# ==========================================
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Data to encode in token (e.g., {"sub": "username", "role": "admin"})
        expires_delta: Custom expiration time. If None, uses ACCESS_TOKEN_EXPIRE_MINUTES
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # 🌟 UBAH 2: Ambil menit expired dari settings
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # 🌟 UBAH 3: Ambil SECRET_KEY dan ALGORITHM dari settings
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Decode JWT token
    
    Args:
        token: JWT token to decode
        
    Returns:
        dict: Decoded token payload
        
    Raises:
        jwt.JWTError: If token is invalid or expired
    """
    # 🌟 UBAH 4: Ambil SECRET_KEY dan ALGORITHM dari settings
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return payload