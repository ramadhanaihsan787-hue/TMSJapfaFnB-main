# create_admin.py
from database import SessionLocal
import models
import auth

db = SessionLocal()

# Cek apakah sudah ada user
existing = db.query(models.User).first()
if existing:
    print("⚠️  User sudah ada!")
    print("Users yang terdaftar:")
    for u in db.query(models.User).all():
        print(f"  - {u.username} ({u.role.value})")
    db.close()
    exit()

# Buat default users
default_users = [
    {
        "username": "manager",
        "password": "japfa123",
        "full_name": "Manager Logistik",
        "role": models.UserRole.manager_logistik
    },
    {
        "username": "admin_distribusi",
        "password": "japfa123",
        "full_name": "Admin Distribusi",
        "role": models.UserRole.admin_distribusi
    },
    {
        "username": "admin_pod",
        "password": "japfa123",
        "full_name": "Admin POD",
        "role": models.UserRole.admin_pod
    },
    {
        "username": "driver01",
        "password": "japfa123",
        "full_name": "Supir Satu",
        "role": models.UserRole.driver
    }
]

for user_data in default_users:
    new_user = models.User(
        username=user_data["username"],
        hashed_password=auth.get_password_hash(user_data["password"]),
        full_name=user_data["full_name"],
        role=user_data["role"]
    )
    db.add(new_user)

db.commit()
print("✅ Default users berhasil dibuat!")
print("\nCredentials:")
print("=" * 40)
for u in default_users:
    print(f"Username : {u['username']}")
    print(f"Password : {u['password']}")
    print(f"Role     : {u['role'].value}")
    print("-" * 40)

db.close()