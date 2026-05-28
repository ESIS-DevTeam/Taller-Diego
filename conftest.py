import sys
import os

# Asegura que el directorio raíz del proyecto esté en el PYTHONPATH
# para que `from backend.xxx import ...` funcione en todos los tests
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
