#!/bin/sh
# Script de Auditoría SCM de Paridad Local contra Rama de Referencia
# Compatible con POSIX sh para portabilidad

RAMA_REFERENCIA="origin/main"
TAG_BASELINE="v1.1.0"

echo "=================================================="
echo "Iniciando Auditoria Fisica de Configuracion (PCA)..."
echo "=================================================="

# Asegurar que el repositorio local está actualizado
git fetch -q origin

echo ""
echo "--- 1. Estado actual del area de trabajo ---"
git status --porcelain

echo ""
echo "--- 2. Archivos modificados localmente (diff) ---"
git diff --name-only

echo ""
echo "--- 3. Diferencias detalladas (drift local) ---"
git diff --stat

echo ""
echo "--- 4. Comparacion entre Tag Baseline ($TAG_BASELINE) y main ---"
git diff --name-status "$TAG_BASELINE"..main

echo ""
echo "--- 5. Commits desde la baseline ($TAG_BASELINE) hasta main ---"
git log --oneline "$TAG_BASELINE"..main

echo ""
echo "--- 6. Verificacion de firmas de commits ---"
git log --pretty=format:"%h | %an | %s | GPG: %G?" -n 10

# Detectar archivos modificados localmente frente a la referencia
DIFERENCIAS=$(git diff --name-only "$RAMA_REFERENCIA" 2>/dev/null)
ARCHIVOS_NO_TRACKEADOS=$(git status --porcelain 2>/dev/null | grep '??')

echo ""
echo ""
echo "=================================================="
echo "RESUMEN DE AUDITORIA PCA"
echo "=================================================="

EXIT_CODE=0

if [ -n "$DIFERENCIAS" ]; then
    echo "[ALERTA-DRIFT] Archivos modificados frente a la linea base:"
    echo "$DIFERENCIAS"
    EXIT_CODE=2
else
    echo "[OK] Paridad total de archivos modificados."
fi

if [ -n "$ARCHIVOS_NO_TRACKEADOS" ]; then
    echo "[ALERTA-DRIFT] Archivos no trackeados en el area de trabajo:"
    echo "$ARCHIVOS_NO_TRACKEADOS"
    EXIT_CODE=2
else
    echo "[OK] No hay archivos sin trackear."
fi

if [ "$EXIT_CODE" = "2" ]; then
    echo "=================================================="
    echo "AUDITORIA FALLIDA: Se detecto configuration drift."
    echo "=================================================="
    exit 2
else
    echo "=================================================="
    echo "AUDITORIA EXITOSA: Paridad total del sistema."
    echo "=================================================="
    exit 0
fi
