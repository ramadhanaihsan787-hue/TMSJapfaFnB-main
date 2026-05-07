"""
Seed Master - Populate vehicles, main drivers, and co-drivers dari 2 File Excel Berbeda
(SUDAH TERMASUK PEMBUATAN AKUN LOGIN USER UNTUK SUPIR)
"""
import pandas as pd
import logging
import sys
import os
from sqlalchemy import text
from passlib.context import CryptContext

# Biar bisa di-run darimana aja ngga nyasar
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import models

# 🌟 SETUP LOGGER & PASSWORD HASHER
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_master():
    db = SessionLocal()
    
    # 1. BACA 2 FILE EXCEL SEKALIGUS
    try:
        logger.info("📊 Membaca 2 file Excel (Armada & Driver)...")
        # Ingat! armada mulai dari baris ke-3 (skiprows=2)
        df_armada = pd.read_excel('data/data_armada.xlsx', skiprows=2)
        # Ambil spesifik sheet 'TLP SUPIR' biar ngga nyasar ke sheet Rencana Kirim
        df_driver = pd.read_excel('data/data_driver.xlsx', sheet_name='TLP SUPIR')
    except Exception as e:
        logger.error(f"❌ Gagal membaca file Excel: {e}")
        logger.info("💡 Pastikan file data_armada.xlsx dan data_driver.xlsx ada di dalam folder 'data/'")
        return
        
    # 2. HAPUS DATA LAMA (BIAR NGGA DOUBLE)
    try:
        logger.info("🔄 Menghapus data master lama...")
        db.query(models.FleetVehicle).delete()
        db.query(models.HRDriver).delete()
        # Hapus akun login yang role-nya driver
        db.query(models.User).filter(models.User.role == models.UserRole.driver).delete()
        db.commit()
        
        logger.info("📝 Menyuntikkan Data Master JAPFA 2026...")
        logger.info("-" * 75)
        
        # 3. PROSES DRIVER & BIKIN AKUN LOGIN
        logger.info("👨‍✈️ 1. Merekrut Supir, Pengawal & Bikin Akun Login...")
        driver_mapping = {} 
        
        for index, row in df_driver.iterrows():
            nopol = str(row.get('NO POLISI', '')).strip()
            if not nopol or nopol == 'nan':
                continue
                
            nama_supir = str(row.get('SUPIR', '')).strip()
            tlp_supir = str(row.get('No Tlp', '')).replace(" ", "").replace("-", "").strip()
            
            nama_pengawal = str(row.get('Pengawal', '')).strip()
            # Di pandas, kalau ada 2 kolom bernama sama, kolom kedua dikasih '.1'
            tlp_pengawal = str(row.get('No Tlp.1', '')).replace(" ", "").replace("-", "").strip()

            # --- A. BIKIN AKUN & PROFIL SUPIR UTAMA ---
            username_utama = nopol.replace(" ", "").lower() # Contoh: b9514jxs
            
            user_utama = models.User(
                username=username_utama,
                hashed_password=pwd_context.hash("rahasia123"), # Password default: rahasia123
                full_name=nama_supir if nama_supir != 'nan' else f"Supir {nopol}",
                role=models.UserRole.driver
            )
            db.add(user_utama)
            db.flush() # Ambil ID user-nya

            supir_utama = models.HRDriver(
                user_id=user_utama.id,
                name=user_utama.full_name,
                phone=tlp_supir if tlp_supir != 'nan' else "-", 
                status=True
            )
            db.add(supir_utama)
            db.flush()
            
            # --- B. BIKIN AKUN & PROFIL PENGAWAL (JIKA ADA) ---
            supir_pengawal = None
            if nama_pengawal and nama_pengawal != 'nan':
                username_pengawal = f"{username_utama}_co" # Contoh: b9514jxs_co
                
                user_pengawal = models.User(
                    username=username_pengawal,
                    hashed_password=pwd_context.hash("rahasia123"),
                    full_name=nama_pengawal,
                    role=models.UserRole.driver
                )
                db.add(user_pengawal)
                db.flush()

                supir_pengawal = models.HRDriver(
                    user_id=user_pengawal.id,
                    name=nama_pengawal,
                    phone=tlp_pengawal if tlp_pengawal != 'nan' else "-",
                    status=True
                )
                db.add(supir_pengawal)
                db.flush()
            
            # Simpan ID-nya buat dijodohin sama truk
            driver_mapping[nopol] = {
                'utama': supir_utama.driver_id,
                'pengawal': supir_pengawal.driver_id if supir_pengawal else None,
                'nama_utama': supir_utama.name,
                'nama_pengawal': supir_pengawal.name if supir_pengawal else '-'
            }

        # 4. PROSES ARMADA DAN JODOHKAN
        logger.info("\n🚚 2. Membeli Truk & Menjodohkan dengan Supir...")
        for index, row in df_armada.iterrows():
            nopol = str(row.get('Nopol', '')).strip()
            if not nopol or nopol == 'nan':
                continue
                
            tipe = str(row.get('Type', '')).strip()
            kapasitas_raw = row.get('Kapasitas')
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
            logger.info(f"✅ {nopol:12} | {tipe:6} | Utama: {mapping.get('nama_utama', '-'):20} | Pengawal: {mapping.get('nama_pengawal', '-')}")

        db.commit()
        logger.info("-" * 75)
        logger.info("🚀 SEEDING SELESAI! Semua supir siap login dengan password 'rahasia123'!")
        
    except Exception as e:
        logger.error(f"❌ Error Pas Seeding: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_master()