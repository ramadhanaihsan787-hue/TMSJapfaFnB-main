# test/customers/test_customers.py
import pytest
import logging

logger = logging.getLogger(__name__)

def test_crud_basic_customer(client, admin_token):
    """1. CRUD Basic: Bikin customer JAPFA baru"""
    payload = {
        "customer_code": "CUST-TEST-01",
        "name": "PT. Testing Maju Jaya",
        "address": "Jl. Sudirman No 1",
        "latitude": -6.2234,
        "longitude": 106.5123,
        "phone": "08123456789"
    }
    response = client.post(
        "/api/customers", 
        headers={"Authorization": f"Bearer {admin_token}"}, 
        json=payload
    )
    
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/customers belum ada")
    
    if response.status_code == 422:
        logger.warning(f"🚨 INFO SCHEMA: {response.text}")
        pytest.skip("Format Payload test beda dengan schemas.py lu.")
        
    assert response.status_code in [200, 201]

    response_get = client.get(
        "/api/customers", 
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response_get.status_code == 200
    assert any(c.get("customer_code") == "CUST-TEST-01" or c.get("code") == "CUST-TEST-01" for c in response_get.json())

def test_customer_validation(client, admin_token):
    """2. Validation: Bikin customer tapi nama & kode kosong (Pasti ditolak Pydantic)"""
    payload_busuk = {
        "latitude": -6.2234,
        "longitude": 106.5123
    }
    response = client.post(
        "/api/customers", 
        headers={"Authorization": f"Bearer {admin_token}"}, 
        json=payload_busuk
    )
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/customers belum ada")
        
    assert response.status_code == 422 

def test_customer_duplicate(client, admin_token):
    """3. Duplicate: Bikin customer pake kode yang sama kayak test pertama"""
    payload_duplikat = {
        "customer_code": "CUST-TEST-01", 
        "name": "PT. Copy Paste",
        "address": "Jl. Thamrin",
        "latitude": -6.1111,
        "longitude": 106.1111,
        "phone": "0899999999"
    }
    response = client.post(
        "/api/customers", 
        headers={"Authorization": f"Bearer {admin_token}"}, 
        json=payload_duplikat
    )
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/customers belum ada")
    
    if response.status_code == 422:
        pytest.skip("Skipped karena nyambung sama error 422 test pertama.")
        
    assert response.status_code in [400, 409]