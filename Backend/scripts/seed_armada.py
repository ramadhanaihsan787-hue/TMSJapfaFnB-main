"""
Seed Master - Populate vehicles, main drivers, and co-drivers dari 2 File CSV Berbeda
"""
import pandas as pd
import logging
from database import SessionLocal
from sqlalchemy import text
import models
import sys
import os

# Biar bisa di-run darimana aja ngga nyasar
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 🌟 SETUP LOGGER (Format simple khusus buat seeding)
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

def seed_master():
    db = SessionLocal()
    
    # 1. BACA 2 FILE CSV SEKALIGUS
    try:
        logger.info("📊 Membaca 2 file CSV (Armada & Driver)...")
        df_armada = pd.read_excel('data/data_armada.xlsx', skiprows=2)
        df_driver = pd.read_excel('data/data_driver.xlsx')
    except Exception as e:
        logger.error(f"❌ Gagal membaca file CSV: {e}")
        return
        
    # 2. AUTO-MIGRATION KOLOM (Buat Jaga-jaga)
    try:
        db.execute(text("ALTER TABLE fleet_vehicles ADD COLUMN default_driver_id INTEGER;"))
        db.commit()
    except:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE fleet_vehicles ADD COLUMN co_driver_id INTEGER;"))
        db.commit()
        logger.info("🔧 Kolom Jodoh berhasil disiapkan di Database!")
    except:
        db.rollback()

    # 3. HAPUS DATA LAMA
    try:
        logger.info("🔄 Menghapus data master lama...")
        db.query(models.FleetVehicle).delete()
        db.query(models.HRDriver).delete()
        db.commit()
        
        logger.info("📝 Menyuntikkan Data Master JAPFA 2026...")
        logger.info("-" * 75)
        
        # 4. PROSES DRIVER DULU & SIMPEN ID-NYA DI MEMORI
        logger.info("👨‍✈️ 1. Merekrut Supir & Pengawal...")
        driver_mapping = {} 
        
        for index, row in df_driver.iterrows():
            nopol = str(row['NO POLISI']).strip()
            if not nopol or nopol == 'nan':
                continue
                
            nama_supir = str(row['SUPIR']).strip()
            tlp_supir = str(row['No Tlp']).replace(" ", "").replace("-", "").strip()
            
            nama_pengawal = str(row['Pengawal']).strip()
            tlp_pengawal = str(row.get('No Tlp.1', '')).replace(" ", "").replace("-", "").strip()

            supir_utama = models.HRDriver(
                name=nama_supir if nama_supir != 'nan' else f"Supir {nopol}",
                phone=tlp_supir if tlp_supir != 'nan' else "-", 
                status=True
            )
            db.add(supir_utama)
            
            supir_pengawal = None
            if nama_pengawal and nama_pengawal != 'nan':
                supir_pengawal = models.HRDriver(
                    name=nama_pengawal,
                    phone=tlp_pengawal if tlp_pengawal != 'nan' else "-",
                    status=True
                )
                db.add(supir_pengawal)
            
            db.flush() 
            
            driver_mapping[nopol] = {
                'utama': supir_utama.driver_id,
                'pengawal': supir_pengawal.driver_id if supir_pengawal else None,
                'nama_utama': supir_utama.name,
                'nama_pengawal': supir_pengawal.name if supir_pengawal else '-'
            }

        # 5. PROSES ARMADA DAN JODOHKAN
        logger.info("\n🚚 2. Membeli Truk & Menjodohkan dengan Supir...")
        for index, row in df_armada.iterrows():
            nopol = str(row['Nopol']).strip()
            if not nopol or nopol == 'nan':
                continue
                
            tipe = str(row['Type']).strip()
            kapasitas_raw = row['Kapasitas']
            kapasitas = float(kapasitas_raw) if pd.notna(kapasitas_raw) else 2000.0

            mapping = driver_mapping.get(nopol, {})
            id_utama = mapping.get('utama')
            id_pengawal = mapping.get('pengawal')

            new_truck = models.FleetVehicle(
                license_plate=nopol,
                type=tipe if tipe != 'nan' else "Box Truck",
                capacity_kg=kapasitas,
                status="Available",
                is_internal=True,
                current_km=10000,
                default_driver_id=id_utama,
                co_driver_id=id_pengawal
            )
            db.add(new_truck)
            logger.info(f"✅ {nopol:12} | {tipe:6} | Utama: {mapping.get('nama_utama', '-'):15} | Pengawal: {mapping.get('nama_pengawal', '-')}")

        db.commit()
        logger.info("-" * 75)
        logger.info("🚀 SEEDING 2 FILE SELESAI! SEMUA DATA BERHASIL DIKAWINKAN!")
        
    except Exception as e:
        logger.error(f"❌ Error Pas Seeding: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_master()