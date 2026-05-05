# services/cron_service.py
import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from sqlalchemy.orm import Session
import models
from database import SessionLocal, engine
from core.config import settings

def job_check_rejected_pods():
    """Tugas robot: Razia POD Rejected yang udah expired (Service Layer)"""
    db = SessionLocal()
    try:
        now = datetime.datetime.now()
        
        # 🌟 FIX 2 (Settings): Waktu toleransi ditarik dari settings
        # Misal pake alert_delay_mins dari setting, atau bikin default 120 menit (2 jam)
        timeout_mins = getattr(settings, 'alert_delay_mins', 120)
        threshold = now - datetime.timedelta(minutes=timeout_mins)
        
        # 🌟 FIX 3 (Optimasi Query): Pake .limit() biar RAM ngga jebol
        suspect_orders = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.status == 'delivered_pod_rejected'
        ).limit(50).all() # Proses maksimal 50 DO per razia biar server enteng

        count_failed = 0
        for order in suspect_orders:
            last_epod = db.query(models.TMSEpodHistory).join(models.TMSRouteLine).filter(
                models.TMSRouteLine.order_id == order.order_id
            ).order_by(models.TMSEpodHistory.timestamp.desc()).first()

            if last_epod and last_epod.timestamp <= threshold:
                order.status = models.DOStatus.delivered_partial 
                
                # Catat ke Audit Log
                new_log = models.SystemAuditLog(
                    user_id=None,
                    action="SYSTEM_AUTO_FAIL_POD",
                    entity_type="DeliveryOrder",
                    entity_id=order.order_id,
                    new_values='{"reason": "Timeout lebih dari 2 jam tanpa re-submission POD"}',
                    ip_address="system_cron"
                )
                db.add(new_log)
                count_failed += 1
        
        if count_failed > 0:
            db.commit()
            print(f"🚨 [CRON] {count_failed} POD di-Auto-Failed karena telat!")
            
    except Exception as e:
        db.rollback()
        print(f"❌ [CRON ERROR] Gagal menjalankan razia POD: {str(e)}")
    finally:
        db.close()


def start_system_scheduler():
    """Fungsi untuk menyalakan robot saat server start"""
    
    # 🌟 FIX 1 (Multi-Instance Safe): Simpen jadwal di Database!
    # Kalau pake gunicorn workers, mereka bakal ngecek DB dan ga akan bentrok.
    jobstores = {
        'default': SQLAlchemyJobStore(engine=engine, tablename='apscheduler_jobs')
    }
    
    scheduler = BackgroundScheduler(jobstores=jobstores)
    
    # 🌟 FIX 2 (Interval dinamis dari setting)
    interval_mins = getattr(settings, 'sync_interval_sec', 900) // 60
    if interval_mins <= 0: interval_mins = 15

    # replace_existing=True penting biar pas server restart, job-nya ga numpuk ganda
    scheduler.add_job(
        job_check_rejected_pods, 
        'interval', 
        minutes=interval_mins, 
        id='job_razia_pod_harian', 
        replace_existing=True
    )
    
    scheduler.start()
    print(f"🚀 [SYSTEM] Distributed Scheduler AKTIF! (Interval: {interval_mins} menit)")
    return scheduler