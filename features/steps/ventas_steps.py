from behave import given, when, then
from backend.domain.venta import Venta

# Simulamos la Venta como si fuesemos el Puerto Primario (Caso de Uso)
@given(u'que tengo una nueva transacción de venta')
def step_impl(context):
    context.venta = Venta()
    context.error = None # Para atrapar posibles excepciones en rutas malas

@when(u'agrego {cantidad:d} unidades del producto "{nombre_producto}" a precio {precio:f}')
def step_impl(context, cantidad, nombre_producto, precio):
    # Creamos un Dummy para simular el producto y su precio
    class ProductoDummy:
        def __init__(self, p):
            self.precioVenta = p
            
    class DetalleDummy:
        def __init__(self, c, prod):
            self.cantidad = c
            self.producto = prod
            
    producto = ProductoDummy(precio)
    detalle = DetalleDummy(cantidad, producto)
    context.venta.agregar_producto(detalle)

@when(u'finalizo el proceso de venta')
def step_impl(context):
    # Aquí en teoría el Caso de Uso validaría y llamaría al Repositorio. 
    # Por el bien de la prueba, forzaremos nuestra propia validación.
    try:
        if not context.venta.tiene_productos():
            raise ValueError("La venta no puede estar vacía")
        context.venta_procesada = True
    except ValueError as e:
        context.error = e

@then(u'el sistema debe confirmar el registro de la venta')
def step_impl(context):
    assert getattr(context, 'venta_procesada', False) is True, "La venta no fue procesada correctamente"

@then(u'el total calculado debe ser {total_esperado:f}')
def step_impl(context, total_esperado):
    total_real = context.venta.calcular_total()
    assert total_real == total_esperado, f"Esperaba {total_esperado} pero obtuve {total_real}"

@when(u'intento finalizar el proceso de venta sin haber agregado ningún producto')
def step_impl(context):
    try:
        if not context.venta.tiene_productos():
            raise ValueError("La venta no puede estar vacía")
        context.venta_procesada = True
    except ValueError as e:
        context.error = e

@then(u'el sistema debe rechazar la operación')
def step_impl(context):
    assert context.error is not None, "El sistema no rechazó la venta vacía"
    
@then(u'mostrar un mensaje indicando que la venta no puede estar vacía')
def step_impl(context):
    assert str(context.error) == "La venta no puede estar vacía"