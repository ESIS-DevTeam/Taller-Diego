import os
import sys
import importlib

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")

# Allow both root-style imports (`backend.xxx`) and app-style imports
# (`core.xxx`, `db.xxx`) during tests.
for path in (PROJECT_ROOT, BACKEND_ROOT):
    if path not in sys.path:
        sys.path.insert(0, path)

db_base = importlib.import_module("db.base")
sys.modules.setdefault("backend.db.base", db_base)

db_models = importlib.import_module("db.models")
sys.modules.setdefault("backend.db.models", db_models)

for model_name in (
    "producto",
    "autoparte",
    "venta",
    "venta_producto",
    "orden",
    "servicio",
    "orden_servicio",
    "empleado",
    "orden_empleado",
    "proforma_rapida",
):
    module = importlib.import_module(f"db.models.{model_name}")
    sys.modules.setdefault(f"backend.db.models.{model_name}", module)
