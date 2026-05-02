"""
Initialize Database - Create all tables
"""
import logging
from database import engine, Base
import models

# 🌟 SETUP LOGGER
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def init_database():
    """Create all database tables from models"""
    logger.info("🔄 Membuat semua tabel dari models.py...")
    
    # Create all tables according to models.py definitions
    Base.metadata.create_all(bind=engine)
    
    logger.info("✅ Semua tabel berhasil dibuat!")
    logger.info("Tabel yang dibuat:")
    for table in Base.metadata.sorted_tables:
        logger.info(f"  - {table.name}")


if __name__ == "__main__":
    init_database()