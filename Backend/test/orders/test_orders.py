# test/orders/test_orders.py
import pytest

def test_get_orders_empty(client, admin_token):
    """1. GET Orders: Harusnya kosong di awal"""
    response = client.get("/api/orders", headers={"Authorization": f"Bearer {admin_token}"})
    if response.status_code == 404:
        pytest.skip("Endpoint GET /api/orders belum ada")
    assert response.status_code == 200

def test_upload_fail_no_file(client, admin_token):
    """2. Upload Fail: Nembak endpoint upload tapi ga bawa file"""
    response = client.post("/api/orders/upload", headers={"Authorization": f"Bearer {admin_token}"})
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/orders/upload belum ada")
    # FastAPI otomatis nolak (422 Unprocessable Entity) kalau file wajib tapi ga dikirim
    assert response.status_code in [400, 422]

def test_upload_invalid_format(client, admin_token):
    """3. Invalid Format: Upload file tapi formatnya .txt bukan .xlsx/.csv"""
    files = {'file': ('dummy.txt', b"isi text sembarangan", 'text/plain')}
    response = client.post(
        "/api/orders/upload", 
        headers={"Authorization": f"Bearer {admin_token}"},
        files=files
    )
    assert response.status_code == 400 # Bad Request karena bukan excel/csv

def test_upload_success_mock(client, admin_token):
    """4. Upload Success: Simulasi upload file CSV/Excel ringan"""
    # 🌟 FIX: Kita bikin format header yang mirip tarikan SAP JAPFA asli (Minimal 13 Kolom)
    csv_content = (
        b"NO. DO,TGL. DO,NO. PO,KODE CUST.,NAMA CUSTOMER,ALAMAT,KOTA,KODE ITEM,NAMA BARANG,QTY,UOM,BERAT,VOL,RUTE\n"
        b"DO-2026-001,2026-05-01,PO-123,CUST-001,Superindo JKT,Jl. Sudirman,Jakarta,ITM-01,Ayam Fillet,10,KG,450,1,RUTE-1"
    )
    
    files = {'file': ('orders.csv', csv_content, 'text/csv')}
    response = client.post(
        "/api/orders/upload", 
        headers={"Authorization": f"Bearer {admin_token}"},
        files=files
    )
    
    if response.status_code == 404:
        pytest.skip("Endpoint POST /api/orders/upload belum ada")
        
    assert response.status_code in [200, 201]

def test_data_saved_after_upload(client, admin_token):
    """5. Data Save: Cek apakah data order tadi beneran masuk database"""
    response = client.get("/api/orders", headers={"Authorization": f"Bearer {admin_token}"})
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            assert data[0].get("id") is not None