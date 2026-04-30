# test/conftest.py
import sys
import os
import pytest
import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 🌟 SUNTIKAN GPS: Biar Python ngenalin folder Backend sebagai Root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import Base
from dependencies import get_db
import models
from core.security import get_password_hash

# 🌟 PAKE SQLITE BUAT TESTING BIAR NGEBUT & NGGA NGERUSAK DB POSTGRES LU
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_japfa.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_session():
    # Bikin tabel baru khusus buat test pake SQLite
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # 🌟 SEED DATA REAL UNTUK TESTING
    test_user = models.User(
        username="admin_test",
        full_name="Budi Admin",
        hashed_password=get_password_hash("password123"),
        role="admin_distribusi",
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    yield db
    
    # Hapus tabel kalau test udah selesai
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def admin_token(client):
    # 🌟 FIX: Endpoint sesuai Swagger lu (/login)
    response = client.post(
        "/login",
        data={"username": "admin_test", "password": "password123"}
    )
    return response.json()["access_token"]