from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

def setup_exception_handlers(app: FastAPI):
    
    # 1. Nangkep Error HTTP biasa (Misal 404, 400, 401)
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error", 
                "code": exc.status_code, 
                "message": exc.detail
            },
        )

    # 2. Nangkep Error Validasi Pydantic (Misal password kurang panjang, email salah format)
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "status": "error", 
                "code": 422, 
                "message": "Data yang dikirim tidak valid!", 
                "details": exc.errors()
            },
        )

    # 3. Nangkep Error 500 (Fatal Crash di Server)
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Print ke terminal server biar lu bisa debug
        print(f"🚨 FATAL SERVER ERROR: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error", 
                "code": 500, 
                "message": "Terjadi kesalahan internal pada server. Silakan hubungi admin."
            },
        )