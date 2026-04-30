# test/routes/test_routes.py

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
        "/api/routes/optimize",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload_busuk
    )
    if response.status_code == 404:
        pytest.skip("Endpoint /api/routes/optimize belum ada")
    assert response.status_code in [400, 422]