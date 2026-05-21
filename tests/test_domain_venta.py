import pytest
from datetime import datetime
from backend.domain.venta import Venta

# Clases falsas (Dummies) para simular los productos sin usar base de datos
class ProductoFalso:
    def __init__(self, precio):
        self.precioVenta = precio

class DetalleVentaFalso:
    def __init__(self, cantidad, producto=None):
        self.cantidad = cantidad
        self.producto = producto

class TestDominioVenta:
    
    def setup_method(self):
        # Arrange general: Se crea una venta limpia antes de cada test
        self.venta_nueva = Venta()

    def test_venta_vacia_no_tiene_productos(self):
        # Arrange
        # Ya tenemos self.venta_nueva del setup
        
        # Act
        tiene_algo = self.venta_nueva.tiene_productos()
        
        # Assert
        assert tiene_algo == False, "Una venta recien creada no deberia tener productos"
        assert self.venta_nueva.obtener_cantidad_productos() == 0

    def test_calculo_total_varios_productos(self):
        # Arrange
        producto_barato = ProductoFalso(precio=50.0)
        producto_caro = ProductoFalso(precio=100.0)
        
        detalle_1 = DetalleVentaFalso(cantidad=2, producto=producto_barato) # 2 x 50 = 100
        detalle_2 = DetalleVentaFalso(cantidad=1, producto=producto_caro)   # 1 x 100 = 100

        # Act
        self.venta_nueva.agregar_producto(detalle_1)
        self.venta_nueva.agregar_producto(detalle_2)
        total_pagar = self.venta_nueva.calcular_total()

        # Assert
        assert total_pagar == 200.0, "El calculo total falló al sumar los productos"

    def test_impedir_cantidades_negativas(self):
        # Arrange
        producto_normal = ProductoFalso(precio=20.0)
        detalle_malo = DetalleVentaFalso(cantidad=-5, producto=producto_normal)
        
        # Act & Assert
        with pytest.raises(ValueError):
            # Asumiendo que Cantidad() en backend.core.value_objects valida esto y lanza error
            self.venta_nueva.agregar_producto(detalle_malo)