FROM python:3.11-slim

# Set environment variables untuk Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Copy requirements dan install dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    # Buat user baru buat security (non-root)
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser . .

# Ganti ke non-root user
USER appuser

# Health check untuk Docker/Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)" || exit 1

EXPOSE 8000

# Jalankan dengan uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]