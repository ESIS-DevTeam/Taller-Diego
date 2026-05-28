# language: es
Característica: Gestión del Inventario de Autopartes
  Como administrador del taller
  Quiero gestionar responsablemente el catálogo de productos
  Para asegurar el debido stock de los repuestos necesarios

  Escenario: Añadir un nuevo repuesto al catálogo (Camino Feliz)
    Dado que el catálogo actual de inventario está accesible
    Cuando registro un nuevo repuesto llamado "Filtro de Aire" con precio 25.0 y stock 10
    Entonces el sistema debe almacenar el repuesto en el catálogo
    Y el inventario debe reflejar 10 unidades de "Filtro de Aire"

  Escenario: Intentar registrar un repuesto con precio negativo (Ruta de Error)
    Dado que el catálogo actual de inventario está accesible
    Cuando intento registrar un nuevo repuesto llamado "Bujía" con el precio absurdo de -15.0
    Entonces el sistema debe bloquear el registro del producto
    Y lanzar una alerta indicando que el precio no puede tener un valor negativo