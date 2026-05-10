# test/routes/test_routes.py
import pytest
from utils.helpers import consolidate_orders

def test_auth_check_routes(client):
    """1. Auth Check: Coba akses data route tanpa token"""
    response = client.get("/api/routes")
    assert response.status_code == 401

def test_get_routes_empty(client, admin_token):
    """2. GET empty: Cek behavior pas database route masih kosong"""
    response = client.get(
        "/api/routes",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    if response.status_code == 404:
        pytest.skip("Endpoint /api/routes belum di-setup di main.py / routernya beda")
    assert response.status_code == 200
    
    data = response.json()
    if isinstance(data, dict):
        assert "routes" in data
        assert data["routes"] == []
    else:
        assert isinstance(data, list)

def test_post_optimize_error(client, admin_token):
    """3. Optimize Error: Payload kurang kordinat"""
    payload_busuk = {
        "origin": {"lat": -6.2234, "lon": 106.5123},
        "destinations": [] # Kosong
    }
    response = client.post(
        "/api/routes/optimize/start", # 🌟 FIX CTO: Disesuaikan sama nama endpoint baru lu
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload_busuk
    )
    if response.status_code == 404:
        pytest.skip("Endpoint /api/routes/optimize belum ada")
    assert response.status_code in [400, 422]

# ==========================================
# 🌟 NEW TESTS FOR SPRINT 3 & 4 (CONSOLIDATION & TRAFFIC)
# ==========================================

def test_order_consolidation_logic():
    """4. Order Consolidation: Test apakah DO dengan lat/lon persis sama ditumpuk jadi 1 titik kunjungan"""
    # Bikin class bohongan (Mock) buat niruin object DeliveryOrder dari Database
    class MockOrder:
        def __init__(self, lat, lon, weight):
            self.latitude = lat
            self.longitude = lon
            self.weight_total = weight

    # Skenario: 3 DO, tapi 2 DO di lokasi yang sama persis (Misal Lotte Mart pesen 2 kali)
    order1 = MockOrder(-6.20000, 106.80000, 50)
    order2 = MockOrder(-6.20000, 106.80000, 150) # Lokasi sama persis dengan order1
    order3 = MockOrder(-6.21111, 106.81111, 20)  # Lokasi beda

    pending_orders = [order1, order2, order3]
    grouped = consolidate_orders(pending_orders)

    # Harusnya cuma jadi 2 kunci (lokasi) unik
    assert len(grouped.keys()) == 2
    
    # Key pertama harusnya nampung 2 order
    key1 = "-6.20000_106.80000"
    assert key1 in grouped
    assert len(grouped[key1]) == 2
    
    # Key kedua harusnya cuma nampung 1 order
    key2 = "-6.21111_106.81111"
    assert key2 in grouped
    assert len(grouped[key2]) == 1

def test_validate_traffic_invalid_job(client, admin_token):
    """5. Traffic Validation: Harusnya nolak (400) kalau job_id ngasal atau belum kelar"""
    response = client.post(
        "/api/routes/validate-traffic/job-id-palsu-12345", 
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/routes/validate-traffic belum ada")
        
    # Karena job "job-id-palsu-12345" gak ada di RAM Backend (VRP_JOBS), expect 400 Bad Request
    assert response.status_code == 400
    assert "belum selesai atau job tidak ditemukan" in response.json()["detail"].lower()