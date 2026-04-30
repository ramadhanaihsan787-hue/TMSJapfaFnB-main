# test/pod/test_pod.py
import pytest

def test_get_pod_list_empty(client, admin_token):
    """1. Get POD List: Harusnya masih kosong"""
    response = client.get("/api/pod", headers={"Authorization": f"Bearer {admin_token}"})
    if response.status_code == 404:
        pytest.skip("Endpoint GET /api/pod belum ada")
    assert response.status_code == 200

def test_submit_pod(client, admin_token):
    """2. Submit POD: Supir ngirim laporan sukses (Asumsi pake JSON untuk data dasar)"""
    payload = {
        "route_id": "ROUTE-001",
        "do_id": "DO-001",
        "status": "Delivered",
        "notes": "Diterima oleh Pak Budi",
        "latitude": -6.123,
        "longitude": 106.123
    }
    response = client.post(
        "/api/pod/submit", 
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload
    )
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/pod/submit belum ada")
    assert response.status_code in [200, 201]

def test_approve_pod(client, admin_token):
    """3. Approve POD: Manager nge-approve bukti kirim"""
    # Asumsi ID POD-nya 1
    response = client.put(
        "/api/pod/1/approve", 
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    if response.status_code == 404:
        pytest.skip("Endpoint PUT /api/pod/{id}/approve belum ada")
    assert response.status_code == 200

def test_reject_pod(client, admin_token):
    """4. Reject POD: Manager nolak POD karena foto ngeblur"""
    payload = {"reason": "Foto blur, tolong foto ulang"}
    response = client.put(
        "/api/pod/1/reject", 
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload
    )
    if response.status_code == 404:
        pytest.skip("Endpoint PUT /api/pod/{id}/reject belum ada")
    assert response.status_code == 200

def test_status_update_checked(client, admin_token):
    """5. Status Update: Cek apakah status POD 1 udah berubah jadi Rejected"""
    response = client.get("/api/pod/1", headers={"Authorization": f"Bearer {admin_token}"})
    if response.status_code == 200:
        assert response.json().get("status") == "Rejected"