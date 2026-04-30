# test/auth/test_auth.py
import datetime
from core.security import create_access_token

def test_register_success(client):
    """1. Register Success: Bikin user baru pake JSON payload"""
    response = client.post(
        "/auth/register",
        json={
            "username": "user_baru",
            "password": "password123",
            "full_name": "Supri Driver",
            "role": "driver"
        }
    )
    assert response.status_code == 201 

def test_register_fail(client):
    """2. Register Fail: Duplicate Username (admin_test udah ada di conftest)"""
    response = client.post(
        "/auth/register",
        json={
            "username": "admin_test", # Ini udah ada, harusnya ditolak
            "password": "password123",
            "full_name": "Copycat",
            "role": "admin_distribusi"
        }
    )
    assert response.status_code == 400 # Bad Request

def test_login_success(client):
    """3. Login Success: User bener, password bener"""
    response = client.post(
        "/login", # 🌟 SESUAI SWAGGER
        data={"username": "admin_test", "password": "password123"} # 🌟 OAuth2 minta Form-Data
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_fail(client):
    """4. Login Fail: Password salah"""
    response = client.post(
        "/login",
        data={"username": "admin_test", "password": "salahpassword"}
    )
    assert response.status_code == 401

def test_protected_route_no_token(client):
    """5. Protected Route: Coba nyusup ke route yang butuh token"""
    # Nembak endpoint dummy atau endpoint routes lu
    response = client.get("/api/routes") 
    assert response.status_code == 401