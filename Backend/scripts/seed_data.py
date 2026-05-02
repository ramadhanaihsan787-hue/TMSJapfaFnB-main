"""
Seed Data - Populate delivery orders and master customers
"""
import pandas as pd
import uuid
import logging
from sqlalchemy.orm import Session
from database import SessionLocal
import models

# 🌟 SETUP LOGGER
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def seed_data():
    """Seed initial data for testing"""
    db: Session = SessionLocal()
    
    try:
        logger.info("🔄 Membersihkan tabel data pengiriman...")
        db.query(models.TMSEpodHistory).delete()
        db.query(models.TMSRouteLine).delete()
        db.query(models.TMSRoutePlan).delete()
        db.query(models.DeliveryOrder).delete()
        db.commit()
        
        logger.info("✅ Tabel berhasil dibersihkan!")
        
        try:
            logger.info("📊 Membaca file data pengiriman...")
            df = pd.read_excel("data_pengiriman.xlsx")
            logger.info(f"✅ Membaca {len(df)} data pengiriman")
        except FileNotFoundError:
            logger.warning("⚠️  File data_pengiriman.xlsx tidak ditemukan - skipping")
            df = None
        
        if df is not None:
            for index, row in df.iterrows():
                order_id = str(row.get('KODE_ORDER', str(uuid.uuid4())))
                customer_name = str(row.get('NAMA_CUSTOMER', 'Unknown'))
                latitude = float(row.get('LATITUDE', -6.2088))
                longitude = float(row.get('LONGITUDE', 106.8456))
                weight = float(row.get('WEIGHT', 10))
                
                order = models.DeliveryOrder(
                    order_id=order_id,
                    customer_name=customer_name,
                    latitude=latitude,
                    longitude=longitude,
                    weight_total=weight,
                    status=models.DOStatus.so_waiting_verification
                )
                db.add(order)
                
                if (index + 1) % 100 == 0:
                    logger.info(f"  ✓ Added {index + 1} orders...")
            
            db.commit()
            logger.info(f"✅ Semua {len(df)} data pengiriman berhasil ditambahkan!")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()