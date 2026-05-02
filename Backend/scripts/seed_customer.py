"""
Seed Customer - Populate Data Pelanggan dengan Auto-Coordinate Dummy (Jabodetabek)
"""
import pandas as pd
import random
import sys
import os
import logging

# 🌟 SETUP LOGGER
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# Biar bisa ngebaca folder Backend utama
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import models

def seed_customer():
    db = SessionLocal()
    
    try:
        logger.info("📊 Membaca file data_customer Excel...")
        df = pd.read_excel('data/data_customer.xlsx')
    except Exception as e:
        logger.error(f"❌ Gagal membaca file: {e}")
        return

    try:
        logger.info("🔄 Menghapus data customer lama...")
        db.query(models.MasterCustomer).delete() 
        db.commit()
        logger.info("✅ Data lama berhasil dihapus.")
    except Exception as e:
        db.rollback()
        logger.info("ℹ️ Belum ada data lama, lanjut...")

    logger.info("📍 Menyuntikkan Data Customer JAPFA & Auto-Generate Koordinat...")
    logger.info("-" * 80)
    
    sukses = 0
    kembar = 0
    seen_codes = set() 
    
    for index, row in df.iterrows():
        cust_code_raw = row.get('CUST CODE', '')
        if pd.isna(cust_code_raw):
            continue
            
        cust_code = str(cust_code_raw).split('.')[0].strip()
        
        if not cust_code or cust_code in seen_codes:
            if cust_code in seen_codes:
                kembar += 1
            continue
            
        seen_codes.add(cust_code)

        nama_toko = str(row.get('NAMA TOKO', '')).strip()
        alamat = str(row.get('ALAMAT', '')).strip()
        kecamatan = str(row.get('KECAMATAN/RT/RW', '')).strip()
        kota = str(row.get('KOTA/KAB', '')).strip()
        admin = str(row.get('ADMIN', '')).strip()
        
        alamat = alamat if alamat != 'nan' else '-'
        kecamatan = kecamatan if kecamatan != 'nan' else '-'
        kota = kota if kota != 'nan' else '-'
        admin = admin if admin != 'nan' else '-'
        
        lat_raw = row.get('LATITUDE')
        lon_raw = row.get('LONGITUDE')
        
        if pd.isna(lat_raw) or pd.isna(lon_raw) or str(lat_raw).strip() == '' or str(lon_raw).strip() == '':
            lat = round(random.uniform(-6.350000, -6.100000), 6)
            lon = round(random.uniform(106.700000, 106.950000), 6)
            status_kordinat = "📍 AUTO-DUMMY"
        else:
            lat = float(lat_raw)
            lon = float(lon_raw)
            status_kordinat = "✅ REAL KOORD "

        try:
            new_customer = models.MasterCustomer(
                kode_customer=cust_code,
                store_name=nama_toko,
                address=alamat,
                district=kecamatan,
                city=kota,
                admin_name=admin,
                latitude=lat,
                longitude=lon,
                status="Active"
            )
            db.add(new_customer)
            sukses += 1
            logger.info(f"{status_kordinat} | {cust_code:10} | {nama_toko[:25]:25} | Lat: {lat}, Lon: {lon}")
        except Exception as e:
            logger.error(f"❌ Error baris {index}: {e}")
            break

    try:
        db.commit()
        logger.info("-" * 80)
        logger.info(f"🚀 SEEDING CUSTOMER SELESAI!")
        logger.info(f"✅ {sukses} Toko berhasil disuntik masuk!")
        logger.info(f"♻️  {kembar} Toko duplikat berhasil dilewati!")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Gagal Simpan Database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_customer()