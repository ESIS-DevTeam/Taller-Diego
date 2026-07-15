#!/usr/bin/env bash
# ========================================
# Generador de tráfico para poblar las métricas del dashboard SRE.
# Lanza peticiones al backend para que Prometheus tenga datos que graficar.
#
#   bash observability/generar-trafico.sh            # tráfico normal (200)
#   bash observability/generar-trafico.sh errores    # inyecta 5xx/404 para ver el SLO caer
# ========================================
BASE="${BASE:-http://localhost:8000}"
MODO="${1:-normal}"

echo "Generando tráfico '$MODO' contra $BASE  (Ctrl+C para detener)"
while true; do
  # Peticiones OK (endpoint público)
  curl -s -o /dev/null "$BASE/api/v1/status/" || true
  curl -s -o /dev/null "$BASE/" || true

  if [ "$MODO" = "errores" ]; then
    # Rutas inexistentes → 404, y forzar carga para elevar latencia/errores
    curl -s -o /dev/null "$BASE/api/v1/ruta-que-no-existe" || true
    curl -s -o /dev/null "$BASE/api/v1/productos/999999999" || true
  fi

  sleep 0.3
done
