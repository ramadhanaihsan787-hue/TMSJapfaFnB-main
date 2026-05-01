# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

import models
import schemas # 🌟 SUNTIKAN PYDANTIC!
from dependencies import get_db, get_current_user, require_role
from services.auth_service import AuthService

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=schemas.LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
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

@router.post("/auth/register", status_code=201, response_model=schemas.RegisterResponse)
def register_user(
    data: schemas.RegisterRequest,
    db: Session = Depends(get_db)
):
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

@router.get("/auth/me", response_model=schemas.UserProfileResponse)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value
    }

@router.get("/auth/users", response_model=schemas.UserListResponse)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("manager_logistik"))
):
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