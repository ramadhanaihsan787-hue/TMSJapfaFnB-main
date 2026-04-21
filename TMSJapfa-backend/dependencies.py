# dependencies.py - VERSI FIXED
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

import models
import auth
from database import SessionLocal

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# 🌟 tokenUrl harus sama persis dengan endpoint login kita
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Validasi JWT token dan return user"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == username
    ).first()

    if user is None:
        raise credentials_exception

    return user

def require_role(*allowed_roles: str):
    """RBAC - proteksi endpoint berdasarkan role"""
    def role_checker(
        current_user: models.User = Depends(get_current_user)
    ) -> models.User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak! Hanya untuk: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker