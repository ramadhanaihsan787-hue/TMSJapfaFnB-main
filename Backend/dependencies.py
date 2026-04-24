"""
Dependencies module - FastAPI dependency injection
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import SessionLocal
from core.security import decode_token
from core.config import SECRET_KEY, ALGORITHM
import models

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_db():
    """
    Dependency to get database session
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency to get current authenticated user
    """
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 🚨 PASANG CCTV: Liat token apa yang masuk
    print(f"🎫 ADA YANG MAU MASUK! TOKEN: {token[:15]}... (dipotong)") 

    try:
        payload = decode_token(token)
        username: str = payload.get("sub")
        if username is None:
            print("❌ DITOLAK: Username (sub) kosong di dalem Payload JWT!")
            raise credential_exception
            
    except JWTError as e:
        # 🚨 INI DIA BIANG KEROKNYA! KITA TANGKEP ERRORNYA!
        print(f"❌ DITOLAK KARENA JWT ERROR: {str(e)}") 
        raise credential_exception
    
    user = db.query(models.User).filter(
        models.User.username == username
    ).first()
    
    if user is None:
        print(f"❌ DITOLAK: User '{username}' ngga ketemu di Database!")
        raise credential_exception
    
    print(f"✅ LOLOS: Selamat datang, {user.username}!")
    return user


def require_role(*allowed_roles: str):
    """
    RBAC - proteksi endpoint berdasarkan role
    """
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak! Hanya untuk: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker