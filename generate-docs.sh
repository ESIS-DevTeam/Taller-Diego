#!/bin/bash
# Script para generar documentación con Sphinx

cd "$(dirname "$0")/docs"

echo ""
echo "===================================="
echo "Generando documentacion con Sphinx"
echo "===================================="
echo ""

# Verificar si sphinx-build está disponible
if ! command -v sphinx-build &> /dev/null; then
    echo "Error: sphinx-build no encontrado"
    echo "Instálalo con: pip install sphinx sphinx-rtd-theme"
    exit 1
fi

# Limpiar build anterior
if [ -d "_build" ]; then
    rm -rf _build
    echo "Carpeta _build limpiada"
fi

# Generar documentación HTML
echo ""
echo "Generando HTML..."
sphinx-build -b html . _build/html

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================="
    echo "Documentacion generada exitosamente"
    echo "===================================="
    echo ""
    echo "Abre: docs/_build/html/index.html"
    echo ""
    
    # Abrir en navegador (opcional - comentado)
    # open _build/html/index.html
else
    echo ""
    echo "Error durante la generacion"
    exit 1
fi
