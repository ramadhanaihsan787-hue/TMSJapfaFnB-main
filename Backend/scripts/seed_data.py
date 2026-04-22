"""
Seed Data - Populate delivery orders and master customers
"""
import pandas as pd
import random
import uuid
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_data():
    """Seed initial data for testing"""
    db: Session = SessionLocal()
    
    try:
        print("🔄 Membersihkan tabel data pengiriman...")
        db.query(models.TMSEpodHistory).delete()
        db.query(models.TMSRouteLine).delete()
        db.query(models.TMSRoutePlan).delete()
        db.query(models.DeliveryOrder).delete()
        db.commit()
        
        print("✅ Tabel berhasil dibersihkan!")
        
        # Try to read delivery data from Excel
        try:
            print("📊 Membaca file data pengiriman...")
            df = pd.read_excel("data_pengiriman.xlsx")
            print(f"✅ Membaca {len(df)} data pengiriman")
        except FileNotFoundError:
            print("⚠️  File data_pengiriman.xlsx tidak ditemukan - skipping")
            df = None
        
        if df is not None:
            # Populate delivery orders
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
                    print(f"  ✓ Added {index + 1} orders...")
            
            db.commit()
            print(f"✅ Semua {len(df)} data pengiriman berhasil ditambahkan!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
