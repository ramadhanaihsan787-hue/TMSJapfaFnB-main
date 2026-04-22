"""
Seed Armada - Populate vehicles and drivers
"""
import pandas as pd
from database import SessionLocal
import models

def seed_armada():
    """Seed vehicles and drivers from Excel file"""
    db = SessionLocal()
    
    try:
        print("📊 Membaca file data_armada.xlsx...")
        # Skip first 2 rows if they contain headers
        df = pd.read_excel('data_armada.xlsx', skiprows=2)
    except Exception as e:
        print(f"❌ Gagal membaca file data_armada.xlsx")
        print(f"   Error: {e}")
        print(f"   Pastikan file ada di folder Backend!")
        return
    
    db_session = db
    
    try:
        print("🔄 Menghapus data armada lama...")
        db_session.query(models.FleetVehicle).delete()
        db_session.query(models.HRDriver).delete()
        db_session.commit()
        
        print("✅ Data lama berhasil dihapus\n")
        print("📝 Menyuntikkan Armada & Supir JAPFA 2026...")
        print("-" * 60)
        
        # Populate vehicles and drivers from Excel
        for index, row in df.iterrows():
            nopol = str(row.get('Nopol', '')).strip()
            tipe = str(row.get('Type', '')).strip()
            kapasitas = float(row.get('Kapasitas', 0))
            nama_supir = str(row.get('Supir', '')).strip()
            
            if not nopol or nopol == 'nan':
                continue
            
            # Create driver
            new_driver = models.HRDriver(
                name=nama_supir if nama_supir else f"Driver {index}",
                phone=f"08123456789{index}",
                status=True
            )
            db_session.add(new_driver)
            db_session.flush()
            
            # Create vehicle
            new_truck = models.FleetVehicle(
                license_plate=nopol,
                type=tipe if tipe else "Box Truck",
                capacity_kg=kapasitas,
                status="Available",
                is_internal=True,
                current_km=10000
            )
            db_session.add(new_truck)
            
            print(f"✅ {nopol:15} | Kapasitas: {kapasitas:6.0f} kg | Supir: {nama_supir}")
        
        db_session.commit()
        print("-" * 60)
        print("🚀 SEEDING ARMADA SELESAI!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db_session.rollback()
    finally:
        db_session.close()


if __name__ == "__main__":
    seed_armada()
