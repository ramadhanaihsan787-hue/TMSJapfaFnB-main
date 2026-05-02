# routers/finance.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
import uuid

import models
import schemas
from dependencies import get_db, get_current_user, require_role

router = APIRouter(prefix="/api/finance", tags=["Finance & Expenses"])

# 1. BIKIN PENGELUARAN BARU
@router.post("/expenses", response_model=schemas.GenericResponse)
def create_expense(
    data: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    try:
        new_expense = models.OperationalExpense(
            id=data.id if data.id else str(uuid.uuid4()),
            time=data.time,
            date=datetime.strptime(data.date, "%Y-%m-%d").date(),
            plate=data.plate,
            vehicle_type=data.vehicleType,
            driver_name=data.driver,
            is_oncall=data.isOncall,
            bbm=data.bbm,
            tol=data.tol,
            parkir=data.parkir,
            parkir_liar=data.parkirLiar,
            kuli_angkut=data.kuliAngkut,
            lain_lain=data.lainLain,
            helper_name=data.helperName,
            notes=data.notes,
            total=data.total
        )
        db.add(new_expense)
        db.commit()
        return {"status": "success", "message": "Biaya operasional berhasil dicatat."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 2. UPDATE PENGELUARAN
@router.put("/expenses/{expense_id}", response_model=schemas.GenericResponse)
def update_expense(
    expense_id: str,
    data: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin_distribusi", "manager_logistik"))
):
    expense = db.query(models.OperationalExpense).filter(models.OperationalExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Data pengeluaran tidak ditemukan!")

    try:
        expense.time = data.time
        expense.date = datetime.strptime(data.date, "%Y-%m-%d").date()
        expense.plate = data.plate
        expense.vehicle_type = data.vehicleType
        expense.driver_name = data.driver
        expense.is_oncall = data.isOncall
        expense.bbm = data.bbm
        expense.tol = data.tol
        expense.parkir = data.parkir
        expense.parkir_liar = data.parkirLiar
        expense.kuli_angkut = data.kuliAngkut
        expense.lain_lain = data.lainLain
        expense.helper_name = data.helperName
        expense.notes = data.notes
        expense.total = data.total
        
        db.commit()
        return {"status": "success", "message": "Biaya operasional berhasil diupdate."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 3. GET SEMUA PENGELUARAN (Bisa di-filter berdasarkan tanggal)
@router.get("/expenses", response_model=schemas.ExpenseListResponse)
def get_expenses(
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.OperationalExpense)
    
    if start_date:
        try:
            start_d = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(models.OperationalExpense.date >= start_d)
        except: pass
        
    if end_date:
        try:
            end_d = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(models.OperationalExpense.date <= end_d)
        except: pass
        
    expenses = query.order_by(models.OperationalExpense.created_at.desc()).all()
    
    # Mapping dari Python Snake_case ke CamelCase Frontend
    results = []
    for e in expenses:
        results.append({
            "id": e.id,
            "time": e.time,
            "date": str(e.date),
            "plate": e.plate,
            "vehicleType": e.vehicle_type,
            "driver": e.driver_name,
            "isOncall": e.is_oncall,
            "bbm": e.bbm,
            "tol": e.tol,
            "parkir": e.parkir,
            "parkirLiar": e.parkir_liar,
            "kuliAngkut": e.kuli_angkut,
            "lainLain": e.lain_lain,
            "helperName": e.helper_name,
            "notes": e.notes,
            "total": e.total
        })

    return {"status": "success", "data": results}

# 4. GET PENGELUARAN HARI INI
@router.get("/expenses/today", response_model=schemas.ExpenseListResponse)
def get_today_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()
    expenses = db.query(models.OperationalExpense).filter(models.OperationalExpense.date == today).order_by(models.OperationalExpense.created_at.desc()).all()
    
    results = []
    for e in expenses:
        results.append({
            "id": e.id,
            "time": e.time,
            "date": str(e.date),
            "plate": e.plate,
            "vehicleType": e.vehicle_type,
            "driver": e.driver_name,
            "isOncall": e.is_oncall,
            "bbm": e.bbm,
            "tol": e.tol,
            "parkir": e.parkir,
            "parkirLiar": e.parkir_liar,
            "kuliAngkut": e.kuli_angkut,
            "lainLain": e.lain_lain,
            "helperName": e.helper_name,
            "notes": e.notes,
            "total": e.total
        })

    return {"status": "success", "data": results}

# 5. HAPUS PENGELUARAN
@router.delete("/expenses/{expense_id}", response_model=schemas.GenericResponse)
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("manager_logistik", "admin_distribusi"))
):
    expense = db.query(models.OperationalExpense).filter(models.OperationalExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Data pengeluaran tidak ditemukan!")
        
    db.delete(expense)
    db.commit()
    return {"status": "success", "message": "Biaya operasional berhasil dihapus."}