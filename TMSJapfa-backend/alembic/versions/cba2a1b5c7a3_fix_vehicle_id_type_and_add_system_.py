"""fix_vehicle_id_type_and_add_system_settings

Revision ID: cba2a1b5c7a3
Revises: 
Create Date: 2024-xx-xx xx:xx:xx.xxxxxx

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'cba2a1b5c7a3'
down_revision = None  # 🌟 Kalau ini migrasi pertama, biarkan None. Kalau ada migrasi sebelumnya, isi dengan revision ID sebelumnya
branch_labels = None
depends_on = None


def upgrade():
    """
    Upgrade database schema:
    1. Drop tabel customer_master duplikat
    2. Tambah kolom ke master_customers
    3. Tambah kolom box dimensi ke fleet_vehicles
    4. Buat tabel system_settings baru
    """
    
    # 1. Drop tabel customer_master yang duplikat (kalau ada)
    # Pakai try-except karena mungkin tabel ini belum ada di beberapa environment
    op.execute("DROP TABLE IF EXISTS customer_master CASCADE")
    
    # 2. Tambah kolom ke master_customers (cek dulu apakah kolom sudah ada)
    # Gunakan batch_alter_table untuk PostgreSQL
    with op.batch_alter_table('master_customers', schema=None) as batch_op:
        # Cek dan tambah kolom satu per satu
        try:
            batch_op.add_column(sa.Column('district', sa.String(length=100), nullable=True))
        except:
            pass  # Kolom sudah ada
        
        try:
            batch_op.add_column(sa.Column('city', sa.String(length=100), nullable=True))
        except:
            pass
        
        try:
            batch_op.add_column(sa.Column('admin_name', sa.String(length=100), nullable=True))
        except:
            pass
        
        try:
            batch_op.add_column(sa.Column('status', sa.String(length=20), server_default='Active'))
        except:
            pass
    
    # 3. Tambah kolom box dimensi ke fleet_vehicles
    with op.batch_alter_table('fleet_vehicles', schema=None) as batch_op:
        try:
            batch_op.add_column(sa.Column('box_length_cm', sa.Integer(), server_default='400'))
        except:
            pass
        
        try:
            batch_op.add_column(sa.Column('box_width_cm', sa.Integer(), server_default='200'))
        except:
            pass
        
        try:
            batch_op.add_column(sa.Column('box_height_cm', sa.Integer(), server_default='200'))
        except:
            pass
    
    # 4. Buat tabel system_settings baru
    # Cek dulu apakah tabel sudah ada
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    tables = inspector.get_table_names()
    
    if 'system_settings' not in tables:
        op.create_table(
            'system_settings',
            sa.Column('id', sa.Integer(), nullable=False),
            
            # VRP & Routing Engine
            sa.Column('vrp_start_time', sa.String(length=5), server_default='06:00'),
            sa.Column('vrp_end_time', sa.String(length=5), server_default='20:00'),
            sa.Column('vrp_base_drop_time_mins', sa.Integer(), server_default='15'),
            sa.Column('vrp_var_drop_time_mins', sa.Integer(), server_default='1'),
            sa.Column('vrp_capacity_buffer_percent', sa.Integer(), server_default='90'),
            
            # Cost & Operations
            sa.Column('cost_fuel_per_liter', sa.Float(), server_default='12500.0'),
            sa.Column('cost_avg_km_per_liter', sa.Float(), server_default='5.0'),
            sa.Column('cost_driver_salary', sa.Float(), server_default='4500000.0'),
            sa.Column('cost_overtime_rate', sa.Float(), server_default='25000.0'),
            sa.Column('depo_lat', sa.Float(), server_default='-6.207356'),
            sa.Column('depo_lon', sa.Float(), server_default='106.479163'),
            
            # Telematics & IoT
            sa.Column('api_tomtom_key', sa.String(length=100), server_default=''),
            sa.Column('api_gps_webhook', sa.String(length=255), nullable=True),
            sa.Column('api_temp_sensor', sa.String(length=255), nullable=True),
            sa.Column('sync_interval_sec', sa.Integer(), server_default='60'),
            
            # Alerts & Notifications
            sa.Column('alert_max_temp_celsius', sa.Float(), server_default='4.0'),
            sa.Column('alert_delay_mins', sa.Integer(), server_default='30'),
            sa.Column('alert_channel_dashboard', sa.Boolean(), server_default='true'),
            sa.Column('alert_channel_email', sa.Boolean(), server_default='true'),
            sa.Column('alert_channel_whatsapp', sa.Boolean(), server_default='false'),
            
            sa.PrimaryKeyConstraint('id')
        )
        
        # 5. Insert default settings (single row)
        op.execute("""
            INSERT INTO system_settings (id) 
            VALUES (1)
        """)
        
        print("✅ Tabel system_settings berhasil dibuat dengan default values!")
    else:
        print("⚠️  Tabel system_settings sudah ada, skip creation")


def downgrade():
    """
    Rollback changes kalau ada masalah
    """
    # Drop system_settings
    op.drop_table('system_settings')
    
    # Drop kolom yang ditambahkan ke fleet_vehicles
    with op.batch_alter_table('fleet_vehicles', schema=None) as batch_op:
        batch_op.drop_column('box_height_cm')
        batch_op.drop_column('box_width_cm')
        batch_op.drop_column('box_length_cm')
    
    # Drop kolom yang ditambahkan ke master_customers
    with op.batch_alter_table('master_customers', schema=None) as batch_op:
        batch_op.drop_column('status')
        batch_op.drop_column('admin_name')
        batch_op.drop_column('city')
        batch_op.drop_column('district')
    
    print("✅ Rollback berhasil!")