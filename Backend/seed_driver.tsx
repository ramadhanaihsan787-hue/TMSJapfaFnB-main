import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import HRDriver, Base
# Pastiin URL ini sama persis kayak yang ada di database.py lu
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password_lu@localhost/tms_japfa" 

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        # Data Driver Asli
        drivers_data = [
            {"name": "Budi Santoso", "phone": "081234567890", "status": True},
            {"name": "Joko Widodo", "phone": "081234567891", "status": True},
            {"name": "Rahmat Hidayat", "phone": "081234567892", "status": True},
            {"name": "Agus Setiawan", "phone": "081234567893", "status": True},
            {"name": "Eko Prasetyo", "phone": "081234567894", "status": True},
            {"name": "Bambang Pamungkas", "phone": "081234567895", "status": True},
            {"name": "Ahmad Yani", "phone": "081234567896", "status": True},
            {"name": "Siti Aminah", "phone": "081234567897", "status": True},
            {"name": "Rina Nose", "phone": "081234567898", "status": True},
            {"name": "Sule Sutisna", "phone": "081234567899", "status": True},
            {"name": "Andre Taulany", "phone": "081234567900", "status": True},
            {"name": "Parto Patrio", "phone": "081234567901", "status": True}
        ]

        print("🌱 Mulai menanam benih driver...")
        for d in drivers_data:
            # Cek dulu biar ngga dobel kalau di-run 2 kali
            cek = db.query(HRDriver).filter(HRDriver.name == d["name"]).first()
            if not cek:
                new_driver = HRDriver(name=d["name"], phone=d["phone"], status=d["status"])
                db.add(new_driver)
                print(f"✔️ Driver {d['name']} berhasil ditambah.")
            else:
                print(f"⚠️ Driver {d['name']} sudah ada, dilewati.")

        db.commit()
        print("🎉 Seeding Driver Selesai!")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()