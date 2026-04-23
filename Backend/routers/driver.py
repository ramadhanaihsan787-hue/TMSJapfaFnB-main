from fastapi import APIRouter

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

@router.get("/performance")
def get_driver_performance():
    # 🌟 Data Dummy Biar Frontend Lu Keliatan Keren Dulu
    return {
        "status": "success",
        "data": [
            {
                "id": "DRV-001",
                "name": "Budi Santoso",
                "avatar": "https://ui-avatars.com/api/?name=Budi+Santoso&background=10b981&color=fff",
                "status": "On Route",
                "score": 95,
                "ontime": "98%",
                "doSuccess": "45/45",
                "truck": "B 9044 JXS",
                "distanceToday": 120,
                "doCompleted": 5,
                "doTotal": 8,
                "lastLocation": "Tol Dalam Kota KM 12",
                "lastUpdate": "10 mins ago"
            },
            {
                "id": "DRV-002",
                "name": "Ahmad Reza",
                "avatar": "https://ui-avatars.com/api/?name=Ahmad+Reza&background=f59e0b&color=fff",
                "status": "Resting",
                "score": 88,
                "ontime": "92%",
                "doSuccess": "38/40",
                "truck": "B 9513 JXS",
                "distanceToday": 210,
                "doCompleted": 8,
                "doTotal": 8,
                "lastLocation": "Rest Area KM 57",
                "lastUpdate": "2 mins ago"
            }
        ]
    }