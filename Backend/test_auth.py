# test_auth.py
import requests

BASE_URL = "http://localhost:8000"

print("=" * 50)
print("TEST AUTH SYSTEM TMS JAPFA")
print("=" * 50)

# 1. TEST LOGIN
print("\n1. TEST LOGIN...")
login_response = requests.post(
    f"{BASE_URL}/login",
    data={
        "username": "manager",
        "password": "japfa123"
    }
)

if login_response.status_code == 200:
    token_data = login_response.json()
    token = token_data["access_token"]
    print(f"✅ LOGIN BERHASIL!")
    print(f"   Role: {token_data['role']}")
    print(f"   Token: {token[:50]}...")
else:
    print(f"❌ LOGIN GAGAL: {login_response.json()}")
    exit()

# 2. TEST GET SETTINGS (Dengan Token)
print("\n2. TEST GET /api/settings (dengan token)...")
settings_response = requests.get(
    f"{BASE_URL}/api/settings",
    headers={"Authorization": f"Bearer {token}"}
)

if settings_response.status_code == 200:
    print(f"✅ GET SETTINGS BERHASIL!")
    data = settings_response.json()["data"]
    print(f"   VRP Start: {data['vrp_start_time']}")
    print(f"   Depo: {data['depo_lat']}, {data['depo_lon']}")
else:
    print(f"❌ GET SETTINGS GAGAL: {settings_response.json()}")

# 3. TEST GET SETTINGS (Tanpa Token - Harus 401)
print("\n3. TEST GET /api/settings (TANPA token - harus 401)...")
no_auth_response = requests.get(f"{BASE_URL}/api/settings")

if no_auth_response.status_code == 401:
    print(f"✅ SECURITY OK! Request tanpa token ditolak (401)")
else:
    print(f"⚠️  SECURITY ISSUE: Status {no_auth_response.status_code}")

# 4. TEST GET /auth/me
print("\n4. TEST GET /auth/me...")
me_response = requests.get(
    f"{BASE_URL}/auth/me",
    headers={"Authorization": f"Bearer {token}"}
)

if me_response.status_code == 200:
    me_data = me_response.json()
    print(f"✅ GET PROFILE BERHASIL!")
    print(f"   Username: {me_data['username']}")
    print(f"   Role: {me_data['role']}")
else:
    print(f"❌ GET PROFILE GAGAL: {me_response.json()}")

# 5. TEST ROLE RESTRICTION
print("\n5. TEST ROLE RESTRICTION (Login sebagai driver, coba akses /auth/users)...")
driver_login = requests.post(
    f"{BASE_URL}/login",
    data={"username": "driver01", "password": "japfa123"}
)
driver_token = driver_login.json()["access_token"]

restricted_response = requests.get(
    f"{BASE_URL}/auth/users",
    headers={"Authorization": f"Bearer {driver_token}"}
)

if restricted_response.status_code == 403:
    print(f"✅ RBAC OK! Driver tidak bisa akses /auth/users (403 Forbidden)")
else:
    print(f"⚠️  RBAC ISSUE: Status {restricted_response.status_code}")

print("\n" + "=" * 50)
print("SEMUA TEST SELESAI!")
print("=" * 50)