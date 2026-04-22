"""
Create Default Admin Users
"""
from database import SessionLocal
from core.security import get_password_hash
from core.enums import UserRole
import models

def create_default_users():
    """Create default admin and test users"""
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing = db.query(models.User).first()
        if existing:
            print("⚠️  User sudah ada!")
            print("Users yang terdaftar:")
            for u in db.query(models.User).all():
                print(f"  - {u.username} ({u.role.value})")
            return
        
        # Define default users
        default_users = [
            {
                "username": "manager",
                "password": "japfa123",
                "full_name": "Manager Logistik",
                "role": UserRole.manager_logistik
            },
            {
                "username": "admin_distribusi",
                "password": "japfa123",
                "full_name": "Admin Distribusi",
                "role": UserRole.admin_distribusi
            },
            {
                "username": "admin_pod",
                "password": "japfa123",
                "full_name": "Admin POD",
                "role": UserRole.admin_pod
            },
            {
                "username": "driver01",
                "password": "japfa123",
                "full_name": "Supir Satu",
                "role": UserRole.driver
            }
        ]
        
        # Create users
        for user_data in default_users:
            new_user = models.User(
                username=user_data["username"],
                hashed_password=get_password_hash(user_data["password"]),
                full_name=user_data["full_name"],
                role=user_data["role"]
            )
            db.add(new_user)
            print(f"✅ Created user: {user_data['username']}")
        
        db.commit()
        print("\n✅ Semua default user berhasil dibuat!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_default_users()
