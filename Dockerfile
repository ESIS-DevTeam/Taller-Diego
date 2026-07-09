# ========================================
# Artefacto versionado del backend Taller de Diego
# Build: docker build -t taller-diego:v1.2.0 .
# La etiqueta de la imagen SIEMPRE coincide con el tag Git del release.
# ========================================
FROM python:3.12-slim

WORKDIR /app

# Dependencias fijadas (dependency pinning) → build reproducible
COPY requirements.txt requirements.lock.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Código del backend
COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
