"""
Initialize Database - Create all tables
"""
from database import engine, Base
import models

def init_database():
    """Create all database tables from models"""
    print("🔄 Membuat semua tabel dari models.py...")
    
    # Create all tables according to models.py definitions
    Base.metadata.create_all(bind=engine)
    
    print("✅ Semua tabel berhasil dibuat!")
    print("\nTabel yang dibuat:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")


if __name__ == "__main__":
    init_database()
