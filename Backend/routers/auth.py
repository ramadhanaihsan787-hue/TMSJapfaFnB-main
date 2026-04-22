"""
Auth Router - Authentication endpoints (login, register, profile)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

import models
from database import SessionLocal
from dependencies import get_current_user, require_role
from services.auth_service import AuthService

router = APIRouter(tags=["Authentication"])

# ==========================================
# SCHEMAS
# ==========================================
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    user_id: int


class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role: str


# ==========================================
# DEPENDENCIES
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================
# ENDPOINT: LOGIN
# ==========================================
@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login endpoint - Returns JWT token
    
    Parameters:
        - username: User's username
        - password: User's password
    """
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = AuthService.create_access_token_for_user(user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "full_name": user.full_name,
        "user_id": user.id
    }


# ==========================================
# ENDPOINT: REGISTER
# ==========================================
@router.post("/auth/register", status_code=201)
def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register new user
    
    Parameters:
        - username: Unique username
        - password: User password
        - full_name: User's full name
        - role: User role (manager_logistik, admin_distribusi, admin_pod, driver)
    """
    VALID_ROLES = ["manager_logistik", "admin_distribusi", "admin_pod", "driver"]
    
    if data.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role tidak valid! Valid roles: {', '.join(VALID_ROLES)}"
        )

    try:
        user = AuthService.create_user(db, data.username, data.password, data.full_name, data.role)
        return {
            "message": f"User '{data.username}' berhasil dibuat!",
            "user_id": user.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==========================================
# ENDPOINT: GET PROFILE
# ==========================================
@router.get("/auth/me")
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value
    }


# ==========================================
# ENDPOINT: LIST USERS (MANAGER ONLY)
# ==========================================
@router.get("/auth/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("manager_logistik"))
):
    """Get all users (Manager Logistik only)"""
    users = AuthService.get_all_users(db)
    
    return {
        "status": "success",
        "count": len(users),
        "data": [
            {
                "user_id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role.value
            }
            for u in users
        ]
    }