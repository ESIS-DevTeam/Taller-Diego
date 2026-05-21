# language: es
Característica: Registro de Ventas en el Taller
  Como recepcionista del taller
  Quiero registrar las ventas de los productos y servicios
  Para mantener un control de los ingresos de forma precisa

  Escenario: Registrar una venta válida (Camino Feliz)
    Dado que tengo una nueva transacción de venta
    Cuando agrego 2 unidades del producto "Aceite Sintético" a precio 50.0
    Y finalizo el proceso de venta
    Entonces el sistema debe confirmar el registro de la venta
    Y el total calculado debe ser 100.0

  Escenario: Intentar registrar una venta sin productos (Ruta de Error)
    Dado que tengo una nueva transacción de venta
    Cuando intento finalizar el proceso de venta sin haber agregado ningún producto
    Entonces el sistema debe rechazar la operación
    Y mostrar un mensaje indicando que la venta no puede estar vacía