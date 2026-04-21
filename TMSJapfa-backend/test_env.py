# test_env.py
from dotenv import load_dotenv
import os

load_dotenv()

print("=== CEK ENVIRONMENT VARIABLES ===")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL', '❌ TIDAK ADA')}")
print(f"SECRET_KEY: {'✅ ADA' if os.getenv('SECRET_KEY') else '❌ TIDAK ADA'}")
print(f"TOMTOM_API_KEY: {'✅ ADA' if os.getenv('TOMTOM_API_KEY') else '❌ TIDAK ADA'}")
print(f"APP_ENV: {os.getenv('APP_ENV', 'development')}")