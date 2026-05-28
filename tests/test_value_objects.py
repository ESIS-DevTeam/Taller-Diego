import pytest

from backend.core.value_objects import Cantidad, CantidadProductos


def test_cantidad_valida():
    c = Cantidad(5)
    assert c.value == 5


def test_cantidad_invalida_cero():
    with pytest.raises(ValueError):
        Cantidad(0)


def test_cantidad_invalida_grande():
    with pytest.raises(ValueError):
        Cantidad(10001)


def test_cantidad_productos_vacio():
    cp = CantidadProductos(0)
    assert cp.es_vacia() is True


def test_cantidad_productos_positiva():
    cp = CantidadProductos(3)
    assert cp.value == 3
