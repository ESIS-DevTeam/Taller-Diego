from types import SimpleNamespace

from backend.domain.venta import Venta


def test_venta_agregar_y_total():
    venta = Venta()

    producto = SimpleNamespace(precioVenta=10.0)
    vp = SimpleNamespace(cantidad=2, producto=producto)

    venta.agregar_producto(vp)

    assert venta.obtener_cantidad_productos() == 1
    assert venta.obtener_cantidad_total_items() == 2
    assert venta.calcular_total() == 20.0
    assert venta.tiene_productos() is True
