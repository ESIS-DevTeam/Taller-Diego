import pytest
from datetime import date
import sys
import os

# Asegurar que el root del proyecto esté en sys.path para resolver imports absolutos
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# Añadir `backend` al path para que imports como `from core.config` resuelvan a backend/core
BACKEND_PATH = os.path.join(ROOT, "backend")
if BACKEND_PATH not in sys.path:
    sys.path.insert(0, BACKEND_PATH)

# Evitar error de 'Table already defined' limpiando metadata antes de importar modelos
from backend.db import base as db_base
db_base.Base.metadata.clear()

from backend.core.value_objects import Email, Precio, EstadoPago, Garantia
from db.models.orden import Orden
from db.models.venta import Venta


class ProductoStub:
    def __init__(self, precioVenta):
        self.precioVenta = precioVenta


class VentaProductoStub:
    def __init__(self, producto, cantidad):
        self.producto = producto
        self.cantidad = cantidad


class OrdenServicioStub:
    def __init__(self, precio_servicio):
        self.precio_servicio = precio_servicio


class OrdenEmpleadoStub:
    pass


def test_email_valid_and_invalid():
    e = Email("user@example.com")
    assert e.value == "user@example.com"
    with pytest.raises(ValueError):
        Email("invalid-email")


def test_precio_valid_and_invalid():
    p = Precio(12.5)
    assert p.value == 12.5
    with pytest.raises(ValueError):
        Precio(0)


def test_estado_pago_and_repr():
    ep = EstadoPago("Pendiente")
    assert ep.value == "pendiente"
    assert repr(ep) == "EstadoPago(pendiente)"
    with pytest.raises(ValueError):
        EstadoPago("no-valido")


def test_garantia_and_methods():
    g = Garantia(2)
    assert g.value == 2
    assert g.es_valida() is True
    assert repr(g) == "Garantia(2 años)"
    with pytest.raises(ValueError):
        Garantia(-1)
    with pytest.raises(ValueError):
        Garantia(11)


def test_orden_methods():
    o = Orden(1, "pendiente", 100, date.today())
    assert o.obtener_precio_total() == 100
    o.cambiar_estado_pago("completado")
    assert o.obtener_estado_pago() == "completado"
    svc = OrdenServicioStub(50)
    # Evitar instrumentación de SQLAlchemy: forzar listas normales en __dict__
    o.__dict__["servicios"] = []
    o.__dict__["empleados"] = []
    o.agregar_servicio(svc)
    assert o.obtener_precio_total() == 150
    emp = OrdenEmpleadoStub()
    o.asignar_empleado(emp)
    assert emp in o.empleados


def test_venta_model_delegation():
    v = Venta()
    prod = ProductoStub(5.0)
    vp = VentaProductoStub(prod, 2)
    # Evitar instrumentación de SQLAlchemy en la lista de productos
    v.__dict__["productos"] = []
    v.agregar_producto(vp)
    assert v.obtener_cantidad_productos() == 1
    assert v.tiene_productos() is True
    assert v.calcular_total() == 10.0
    v.remover_producto(vp)
    assert v.tiene_productos() is False
    assert v.obtener_cantidad_total_items() == 0
