# language: es
Característica: Creación de Órdenes de Servicio
  Como jefe de mecánicos del taller
  Quiero asignar y organizar órdenes de trabajo 
  Para estructurar los mantenimientos de los clientes 

  Escenario: Generar una orden de mantenimiento válida (Camino Feliz)
    Dado que un vehículo requiere un servicio y existe suficiente capacidad en el taller
    Cuando especifico el servicio "Cambio de Frenos" y asigno a un mecánico
    Entonces el sistema debe crear la orden exitosamente en estado inicial
    Y el mecánico debe figurar como el responsable de dicha orden

  Escenario: Generar una orden sin especificar una tarea de servicio (Ruta de Error)
    Dado que inicio el ingreso de un vehículo al taller
    Cuando intento crear la orden de trabajo dejando el campo de servicio principal en blanco
    Entonces el sistema prohibirá la generación de la orden
    Y advertirá que una orden obligatoriamente debe contener la especificación del servicio a realizar