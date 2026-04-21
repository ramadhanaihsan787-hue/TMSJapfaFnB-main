# routers/auth.py - VERSI FIXED LENGKAP
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

import models
import auth as auth_utils
from database import SessionLocal
from dependencies import get_current_user, require_role

router = APIRouter(tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
# ENDPOINT LOGIN
# ==========================================
@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah!",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_utils.create_access_token(
        data={
            "sub": user.username,
            "role": user.role.value,
            "user_id": user.id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "full_name": user.full_name,
        "user_id": user.id
    }

# ==========================================
# ENDPOINT REGISTER
# ==========================================
@router.post("/auth/register", status_code=201)
def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    VALID_ROLES = ["manager_logistik", "admin_distribusi", "admin_pod", "driver"]
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role tidak valid!")

    existing = db.query(models.User).filter(
        models.User.username == data.username
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail=f"Username sudah dipakai!")

    new_user = models.User(
        username=data.username,
        hashed_password=auth_utils.get_password_hash(data.password),
        full_name=data.full_name,
        role=models.UserRole(data.role)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": f"User '{data.username}' berhasil dibuat!", "user_id": new_user.id}

# ==========================================
# ENDPOINT GET PROFILE
# ==========================================
@router.get("/auth/me")
def get_my_profile(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value
    }

# ==========================================
# ENDPOINT LIST USERS
# ==========================================
@router.get("/auth/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("manager_logistik"))
):
    users = db.query(models.User).all()
    return {
        "status": "success",
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