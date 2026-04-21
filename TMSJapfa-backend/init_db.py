# init_db.py
from database import engine, Base
import models

print("🔄 Membuat semua tabel dari models.py...")

# Buat semua tabel sesuai definisi di models.py
Base.metadata.create_all(bind=engine)

print("✅ Semua tabel berhasil dibuat!")
print("\nTabel yang dibuat:")
for table in Base.metadata.sorted_tables:
    print(f"  - {table.name}")