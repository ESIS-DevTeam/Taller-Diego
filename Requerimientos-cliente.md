TOMA SOLO COMO REFERNCIA LOS SIGUENTES REQUERIMINETOS DEL CLIENTE:

REQUISITOS ORDENADOS SEGÚN FUNCIONALIDAD

REQUISITOS FUNCIONALES
El sistema debe permitir la gestión de entre 200 y 300 productos activos, incluyendo; Aceites (mínimo 8 marcas, para vehículos y motorizados).Filtros (de aceite, de aire, de petróleo) ;Repuestos (brazos, terminales, rótulas, amortiguadores, suspensiones, bandejas, bujes, retenes, etc.)
Las autopartes deben estar diferenciadas en el sistema por marca, modelo y año.
El sistema debe manejar moneda local CLP (peso chileno) para todas las operaciones.
En el área de servicios, la orden de recepción de vehículo debe registrar al menos los siguientes datos : Datos del cliente,Número de celular,Tipo de vehículo,Patente (placa),Color del vehículo,Detalle de reparaciones solicitadas,Fotografía del vehículo,Reseña del estado en que ingresa el vehículo,Mecánico asignado,Fecha de ingreso.
El sistema debe permitir el registro de ingreso de productos comprados y el descuento automático de inventario cuando los productos se vendan o se usen en un servicio.
El sistema debe emitir alertas automáticas de bajo stock, cuando el inventario de un producto llegue a un nivel definido (ejemplo: 15, 12 o 10 unidades). El cliente debe poder configurar el umbral de alerta.
El sistema debe permitir la búsqueda de productos por nombre dentro del inventario.
El sistema debe mostrar el precio de cada producto en su ficha o detalle.
El sistema debe incluir un módulo para la gestión de servicios ofrecidos por el taller,Otros relacionados al vehículo (excepto electricidad).
El sistema debe permitir registrar el precio fijo y modificable de productos y un precio modificable para los servicios.
El sistema debe registrar el mecánico responsable de cada servicio
El sistema debe permitir registrar los datos del vehículo: placa, marca, modelo, año, color y kilometraje.
El sistema debe permitir registrar los datos del dueño del vehículo: nombre, teléfono (obligatorio) y correo electrónico. (opcional)
El sistema debe permitir ingresar una descripción y/u observación del vehículo antes de realizar un servicio.
El sistema debe permitir asignar una garantía configurable a los servicios, que se active automáticamente al momento de la salida del vehículo del taller. 
El sistema debe gestionar el historial del vehículo por placa (patente), mostrando servicios previos, mecánicos, observaciones y precios.
El sistema debe generar un historial de servicios por mecánico, indicando el tipo de servicio realizado. 
El sistema debe registrar los productos comprados con número de factura y código del producto, actualizando el inventario.
El sistema debe permitir la gestión de mecánicos, incluyendo agregar, modificar, eliminar y cambiar su estado (activo/inactivo).
En el registro de clientes, el sistema debe permitir que la primera información ingresada sea la patente (placa) del vehículo, de manera que este dato funcione como inicio para la creación del registro.


El sistema debe almacenar y mantener disponible el historial de cada servicio por un periodo máximo de 12 meses, eliminando automáticamente la información que exceda ese plazo.


El sistema debe de gestionar la garantía de los servicios considerando lo establecido por el cliente: una duración de 180 días (6 meses) contados desde la fecha del servicio, sin importar el tipo de servicio realizado, siendo capaz de ser modificado por el administrador.


El sistema debe permitir registrar el pago de los servicios únicamente ya finalizados. El registro debe contemplar tanto la opción de un pago único por el monto total como la opción de registrar pagos parciales, este último es opcional; hasta completar el importe total del servicio.


El sistema no debe establecer precios fijos para los servicios; estos deben poder ser definidos manualmente por el administrador en cada caso, según corresponda.


El sistema debe generar un reporte individual por cada servicio realizado incluyendo la información relevante del trabajo efectuado, de manera que pueda ser consultado posteriormente por el cliente o el administrador.


El sistema debe permitir asignar un código único a cada producto, que sirva para diferenciarlo de los demás.


El sistema debe estar preparado para integrar en el futuro el uso de códigos de barras o códigos QR, de manera que se pueda identificar un producto con un lector de pistola.


El sistema debe permitir que el cliente pueda registrar nuevos productos en el inventario de manera autónoma, incluso después de la entrega final del proyecto.


El sistema debe garantizar que los productos añadidos posteriormente mantengan coherencia con la estructura definida (categoría, marca, modelo, año, etc.).


El sistema debe generar automáticamente un reporte individual para cada cliente, que incluya su historial de servicios, compras y pagos, y debe enviarlo al cliente por correo electrónico.


El sistema debe incluir en los informes una sección de clientes deudores, mostrando el nombre completo, número de contacto, monto adeudado y fecha de vencimiento de la deuda.


El sistema debe generar recordatorios automáticos de pagos pendientes y asociarlos al informe del cliente, de manera que se indique claramente el monto, la fecha límite y el estado del pago (pendiente o vencido).


El sistema debe permitir identificar y ubicar productos en el inventario mediante el uso de una pistola lectora de códigos de barras, vinculando cada código leído con el producto correspondiente en la base de datos para su búsqueda, actualización o venta.
El sistema debe permitir registrar tanto el precio de costo como el precio de venta de cada producto. (nuevo).
El sistema debe registrar el método de pago (efectivo o tarjeta) en cada transacción. (nuevo).





NO FUNCIONALES (MODIFICADO):


El acceso al software debe ser solo para 2 personas al principio

El sistema debe proteger los datos personales con encriptación para cumplir con la normativa de privacidad local
“El sistema debe poder usarse tanto instalado en las computadoras del taller (versión de escritorio) como también desde internet (en la nube), de manera que se pueda acceder a la información desde cualquier lugar. Además de ser accesible desde cualquier navegador web estándar y contar con una aplicación móvil optimizada y fluida, con sincronización en tiempo real en ambas plataformas. (Ahora 4 y 7)  
El sistema debe permitir al cliente visualizar reportes de compras, ventas, stock e historial de compras con una latencia máxima debe ser de menos de 1 segundo
El sistema debe realizar una copia de seguridad completa y automática de toda la base de datos cada 24 horas a la medianoche. Las copias deben ser almacenadas de forma segura en un servicio de almacenamiento en la nube, con una retención de al menos 30 días, permitiendo la restauración completa del sistema en caso de una falla o corrupción de datos.
El sistema deberá cumplir con principios de usabilidad e interfaz como: 
Elementos de navegación (menús, botones) ubicados consistentemente en la pantalla y ser claramente visibles en todas las páginas.
Permitir que el usuario sea capaz de completar las tareas más comunes  (ej. registrar un servicio o buscar un producto) en menos de 10min sin necesidad de un manual.
Mostrar mensajes de confirmación claros y concisos después de cada acción exitosa y mensajes de error amigables capaces de guiar al usuario en caso de un fallo.
Diseño de interfaz limpio, sin elementos distractores y una paleta de colores que no agote la vista.




La interfaz del sistema debe utilizar una paleta de colores sobria y contrastante, para así evitar colores demasiado brillantes o claros, asegurando la correcta visibilidad y legibilidad de los textos en pantalla.





—--------------------


Historias de Usuario Consolidados 
Gestión de Productos e Inventario
·        Como administrador, quiero registrar y gestionar entre 200 y 300 productos activos (aceites, filtros, repuestos), diferenciados por marca, modelo y año, para mantener actualizado y organizado el inventario del taller.

·        Como administrador, quiero registrar productos ingresados con número de factura y código único, para llevar un control detallado de las compras.

       Como administrador, quiero que el sistema descuente automáticamente el stock cuando un producto se venda o se use en un servicio, para mantener el inventario en tiempo real.

  Como administrador, quiero recibir alertas cuando el stock de un producto llegue a un nivel mínimo definido, para abastecer a tiempo y no detener los servicios.

·        Como usuario, quiero buscar productos por nombre y ver su precio en la ficha de detalle, para localizarlos rápidamente y tomar decisiones de compra o uso.

·        Como administrador, quiero identificar y ubicar productos en el inventario mediante una pistola lectora de códigos de barras, para agilizar búsquedas, actualizaciones o ventas.

 Como administrador, quiero que los productos del inventario se muestren ordenados alfabéticamente, para facilitar la búsqueda y selección. 


·        Como administrador, quiero que el sistema refleje en el reporte diario los productos vendidos junto con los servicios facturados, para tener control total de las ventas del día. 

Como administrador, quiero registrar tanto el precio de costo como el precio de venta de los productos, para mantener un control más preciso de los márgenes de ganancia. (nueva)
Gestión de Servicios y Recepción de Vehículos
·        Como recepcionista, quiero registrar los datos del cliente (nombre, celular obligatorio, correo opcional) y del vehículo (patente, marca, modelo, año, color, kilometraje), para identificarlo correctamente en cada servicio.

·    Como recepcionista, quiero incluir fotografías y observaciones del vehículo al ingresar, para dejar evidencia del estado en que llega al taller.

·        Como administrador, quiero registrar el detalle de las reparaciones solicitadas, asignar un mecánico responsable y guardar la fecha de ingreso, para documentar cada orden de servicio.

·      Como administrador, quiero contar con un módulo de gestión de servicios (alineación, diagnóstico, cambio de aceite, reparación de motor, reparación de suspensión, entre otros), para ofrecer y controlar todas las atenciones del taller, permitiendo además que cada servicio tenga una descripción predeterminada que se complete automáticamente y pueda ser modificada o ampliada.

·        Como administrador, quiero configurar precios fijos y modificables en los productos, y precios definidos manualmente en los servicios, para mantener flexibilidad en la facturación.

·        Como administrador, quiero registrar el pago de los servicios únicamente una vez finalizados, para asegurar que la facturación corresponda a trabajos concluidos.

·       Como administrador, quiero que el sistema genere un reporte individual por cada servicio realizado, incluyendo la información relevante del trabajo efectuado y generando una proforma con los datos del taller (dirección, correo, página web), fecha, hora y garantía, para consulta del cliente o del administrador..

·        Como administrador, quiero que los repuestos usados en cada servicio se registren automáticamente en la orden asociada al vehículo (por patente), para garantizar que nada quede fuera del monto a cancelar. 

·        Como administrador, quiero categorizar los servicios ofrecidos, para agilizar la selección al momento de registrar órdenes. 

·        Como administrador, quiero que el sistema permita aplicar filtros por letra tanto en servicios como en productos, para acelerar la búsqueda. 
Historiales y Garantías
·        Como administrador, quiero que el sistema gestiona el historial de mi vehículo por placa, mostrando servicios previos, observaciones, precios y mecánicos responsables, para tener trazabilidad completa. El historial se mantendrá disponible un máximo de 12 meses; la información más antigua se eliminará automáticamente.

·        Como mecánico, quiero que el sistema genere un historial de los servicios que realizo, indicando el tipo de trabajo, para poder validar mi experiencia y desempeño.

·        Como administrador, quiero asignar garantías configurables a los servicios, para dar respaldo al cliente y controlar tiempos de cobertura. La garantía por defecto será de 180 días (6 meses) y podrá ser modificada por el administrador.

·        Como administrador, quiero que los informes incluyen una sección de clientes deudores, mostrando el nombre completo, contacto, monto adeudado y fecha de vencimiento.
Gestión de Personal
·        Como administrador, quiero gestionar la información de los mecánicos (agregar, modificar, eliminar y cambiar estado activo/inactivo), para mantener actualizado el registro de personal del taller.
Interfaz
·        Como usuario, quiero que la interfaz del sistema tenga una paleta de colores sobria y contrastante, para asegurar visibilidad y legibilidad adecuada de los textos en pantal
PROFORMAS
Historia: Como administrador, quiero que el sistema permita generar una proforma para los clientes con los datos del taller, cliente, vehículo y servicios realizados, para entregar un resumen claro del trabajo.

Como administrador, quiero que cada proforma tenga un código único de identificación y que pueda incluir descripciones ampliadas o estados como “Revisar”, para reflejar información adicional importante, para entregar un reporte claro y formal. (modificado)

Como administrador, quiero registrar y visualizar una descripción ampliada y detallada de cada servicio brindado, para complementar la información básica del reporte. 
Gestión de Pagos y Finanzas

·        Como administrador, quiero que el sistema registre un control de caja diario (ventas, compras y gastos del día), para realizar cierres de caja precisos y detectar faltantes de dinero. (nuevo)

·        Como administrador, quiero que el sistema permita registrar notas de pagos (ej. pagos a proveedores o pequeños gastos del taller) y que se pueda añadir fechas de pago limite notificando (nuevo).

·        Como administrador, quiero acceder a reportes de ventas por día, semana y mes, para facilitar la gestión de caja y el pago a proveedores. (nuevo)

·        Como administrador, quiero que el sistema permita actualizar información del servicio ofrecido y repuestos en tiempo real desde cualquier dispositivo (ej. celular), para mantener sincronizados los datos del taller. (nuevo).

Como usuario del sistema (administrador, recepcionista o mecánico), quiero iniciar sesión con mis credenciales únicas, para acceder de forma segura a todas las funcionalidades del sistema de gestión del taller.
Métodos de pago
Como administrador, quiero registrar en el sistema si un pago se realizó en efectivo o con tarjeta, para llevar un control detallado de los métodos de cobro. (nueva).

—------------------------

Criterios de Aceptación 
Gestión de Productos e Inventario
Historia: Como administrador, quiero registrar y gestionar entre 200 y 300 productos activos (aceites, filtros, repuestos), diferenciados por marca, modelo y año, para mantener actualizado y organizado el inventario del taller. 
Criterios de aceptación:
    El sistema debe permitir registrar hasta un máximo de 300 productos activos.
    Cada producto debe registrarse con marca, modelo y año del vehículo compatible.
    Los productos deben mostrarse en un catálogo o módulo de inventario.
    El sistema debe rechazar el registro de un producto sin al menos marca, modelo o año definidos.
Historia: Como administrador, quiero registrar productos ingresados con número de factura y código único, para llevar un control detallado de las compras. 
Criterios de aceptación:
 El sistema debe guardar el número de factura y el código único en cada ingreso de productos.
 El sistema debe notificar si se intenta registrar un código duplicado.
 El sistema debe permitir omitir el código en productos pequeños o de difícil individualización.

Historia: Como administrador, quiero que el sistema descuente automáticamente el stock cuando un producto se venda o se use en un servicio, para mantener el inventario en tiempo real.
 Criterios de aceptación:
El sistema debe reducir automáticamente el stock al registrar una venta.


El sistema debe reducir automáticamente el stock al usar un producto en un servicio.


El stock actualizado debe reflejarse en tiempo real en el inventario.


El sistema debe impedir registrar ventas o servicios si no hay stock suficiente.
 

Historia: Como administrador, quiero recibir alertas cuando el stock de un producto llegue a un nivel mínimo definido, para reabastecerlo a tiempo y no detener los servicios.
 Criterios de aceptación:
El sistema debe permitir configurar niveles mínimos de stock.


El sistema debe generar una alerta visual cuando el stock sea igual o inferior al mínimo configurado.


El sistema debe mostrar un listado de productos en estado de bajo stock.


Historia: Como administrador, quiero buscar productos por nombre y ver su precio en la ficha de detalle, para localizarlos rápidamente y tomar decisiones de compra o uso.
 Criterios de aceptación:
El sistema debe permitir buscar productos por nombre completo o parcial.


El sistema debe mostrar una ficha con: nombre, marca, modelo, año, código, precio, stock y descripción.


Si no se encuentra el producto, el sistema debe mostrar un mensaje informativo.



Historia: Como administrador, quiero identificar y ubicar productos en el inventario mediante una pistola lectora de códigos de barras, para agilizar búsquedas, actualizaciones o ventas.
 Criterios de aceptación:
El sistema debe permitir buscar un producto escaneando su código de barras.


Al escanear, el sistema debe mostrar la información completa del producto.


El sistema debe permitir actualizar stock o registrar ventas mediante lectura del código.





Como administrador, quiero que los productos del inventario se muestren ordenados alfabéticamente, para facilitar la búsqueda y selección. (nuevo)
Criterios de aceptación:
El sistema debe mostrar todos los productos en orden alfabético por nombre.


El orden alfabético debe mantenerse al realizar búsquedas o aplicar filtros.


El sistema debe permitir alternar entre orden ascendente (A–Z) y descendente (Z–A).




Como administrador, quiero que el sistema refleje en el reporte diario los productos vendidos junto con los servicios facturados, para tener control total de las ventas del día. (nuevo).
Criterios de aceptación:
El reporte diario debe incluir productos vendidos y servicios facturados.


Cada producto debe aparecer con nombre, cantidad y monto total.


El sistema debe mostrar un total acumulado de ventas (productos + servicios).


El reporte debe poder visualizarse en pantalla y exportarse en PDF o Excel.



Como administrador, quiero registrar tanto el precio de costo como el precio de venta de los productos, para mantener un control más preciso de los márgenes de ganancia. (nueva).
Criterios de aceptación (nuevo):
El sistema debe permitir ingresar y guardar el precio de costo y el precio de venta de cada producto en su ficha de registro.


El sistema debe validar que el precio de costo no sea negativo.


El sistema debe permitir actualizar tanto el precio de costo como el de venta en cualquier momento.


El sistema debe reflejar ambos precios (costo y venta) en los reportes de inventario, pero solo mostrar el precio de venta en la ficha pública o accesible a usuarios/ventas.


Gestión de Servicios y Recepción de Vehículos
Historia: Como administrador, quiero registrar los datos del cliente (nombre, celular obligatorio, correo opcional) y del vehículo (patente, marca, modelo, año, color, kilometraje), para identificarlo correctamente en cada servicio.
 Criterios de aceptación:
El sistema debe exigir la patente como primer dato obligatorio.


El sistema debe impedir registrar clientes sin patente o celular.


El sistema debe asociar correctamente los datos del cliente y vehículo a la patente.


Historia: Como administrador, quiero incluir fotografías y observaciones del vehículo al ingresar, para dejar evidencia del estado en que llega al taller.
 Criterios de aceptación:
El sistema debe permitir subir al menos una fotografía en formato JPG o PNG.


El sistema debe guardar las observaciones registradas junto con las fotos.


El sistema debe mostrar fotos y observaciones al consultar el historial del vehículo.


Historia: Como administrador, quiero registrar el detalle de las reparaciones solicitadas, asignar un mecánico responsable y guardar la fecha de ingreso, para documentar cada orden de servicio.
 Criterios de aceptación:
El sistema debe permitir registrar múltiples reparaciones en una orden de servicio.


El sistema debe validar que solo se asignen mecánicos en estado activo.


El sistema debe registrar automáticamente la fecha y hora de ingreso.


El sistema debe mostrar reparaciones, mecánico asignado y fecha al consultar la orden.


Historia:Como administrador, quiero contar con un módulo de gestión de servicios (alineación, diagnóstico, cambio de aceite, reparación de motor, reparación de suspensión, entre otros), para ofrecer y controlar todas las atenciones del taller, permitiendo además que cada servicio tenga una descripción predeterminada que se complete automáticamente y pueda ser modificada o ampliada.
 Criterios de aceptación:
El sistema debe permitir crear, editar y eliminar servicios en el catálogo.


Cada servicio debe tener nombre, descripción y precio base.


Solo los servicios activos deben estar disponibles en órdenes de servicio.


Historia: Como administrador, quiero configurar precios fijos y modificables en los productos, y precios definidos manualmente en los servicios, para mantener flexibilidad en la facturación.
 Criterios de aceptación:
El sistema debe permitir que el precio de los productos sea fijo o modificable.


El sistema debe permitir que el precio de los servicios sea definido manualmente por el administrador.


El sistema debe registrar el precio final aplicado sin alterar el valor base en el catálogo.


Historia: Como administrador, quiero registrar el pago de los servicios únicamente una vez finalizados, para asegurar que la facturación corresponda a trabajos concluidos.
 Criterios de aceptación:
El sistema debe impedir registrar pagos si el servicio no está finalizado.


El sistema debe permitir registrar un pago único por el total o pagos parciales.


El sistema debe reflejar el estado del pago: pendiente, parcial o completado.


Historia: Como administrador, quiero que el sistema genere un reporte individual por cada servicio realizado, incluyendo la información relevante del trabajo efectuado, para consulta del cliente o del administrador.
 Criterios de aceptación:
El reporte debe incluir fecha, tipo de servicio, vehículo, mecánico, observaciones y costo final.


El reporte debe poder visualizarse en pantalla y exportarse en PDF.


El reporte debe estar vinculado al historial del cliente y vehículo.


4. Historia:
Como administrador, quiero que los repuestos usados en cada servicio se registren automáticamente en la orden asociada al vehículo (por patente), para garantizar que nada quede fuera del monto a cancelar. (nuevo)
Criterios de aceptación:
Cada repuesto utilizado en un servicio debe registrarse automáticamente en la orden correspondiente.


El sistema debe asociar el repuesto a la patente del vehículo.


El total de la orden debe actualizarse automáticamente al agregar repuestos.


El sistema debe impedir cerrar una orden si existen repuestos sin registrar.



5. Historia:
Como administrador, quiero categorizar los servicios ofrecidos, para agilizar la selección al momento de registrar órdenes. (nuevo)
Criterios de aceptación:
El sistema debe permitir definir categorías de servicios (ej. mecánica, electricidad, mantenimiento).


Al registrar una orden, los servicios deben mostrarse agrupados por categoría.


El usuario debe poder filtrar servicios por categoría antes de seleccionarlos.



6. Historia:
Como administrador, quiero que el sistema permita aplicar filtros por letra tanto en servicios como en productos, para acelerar la búsqueda. (nuevo)
Criterios de aceptación:
El sistema debe permitir filtrar servicios por la primera letra del nombre.


El sistema debe permitir filtrar productos por la primera letra del nombre.


Los filtros deben aplicarse en tiempo real y combinarse con otros criterios de búsqueda.



Historiales y Garantías
Historia: Como administrador, quiero que el sistema gestiona el historial de mi vehículo por placa, mostrando servicios previos, observaciones, precios y mecánicos responsables, para tener trazabilidad completa. El historial se mantendrá disponible un máximo de 12 meses; la información más antigua se eliminará automáticamente..
 Criterios de aceptación:
El sistema debe permitir consultar historial ingresando la placa.


El sistema debe mostrar servicios en orden cronológico con fecha, tipo, mecánico, precio y observaciones.


El sistema debe conservar registros solo por 12 meses, eliminando automáticamente los más antiguos.


El sistema debe mostrar un mensaje si el vehículo no tiene historial.


Historia: Como Administrador, quiero que el sistema genere un historial de los servicios que realizo, indicando el tipo de trabajo, para poder validar mi experiencia y desempeño del mecanico.
 Criterios de aceptación:
El sistema debe permitir filtrar historial por mecánico.


El historial debe mostrar fecha, tipo de servicio, vehículo y observaciones.


El sistema debe mostrar el total de servicios realizados por cada mecánico.


Historia:Como administrador, quiero asignar garantías configurables a los servicios, para dar respaldo al cliente y controlar tiempos de cobertura. La garantía por defecto será de 180 días (6 meses) y podrá ser modificada por el administrador.
 Criterios de aceptación:
Cada garantía debe asignarse automáticamente con duración de 180 días.


El administrador debe poder modificar la duración antes de confirmar la garantía.


El sistema debe mostrar fecha de inicio y vencimiento de la garantía.


El sistema debe notificar si una garantía ha vencido.



Historia: Como administrador, quiero que los informes incluyan una sección de clientes deudores, mostrando el nombre completo, contacto, monto adeudado y fecha de vencimiento.
 Criterios de aceptación:
El sistema debe mostrar en el informe: nombre completo, contacto, monto adeudado y fecha de vencimiento.


El sistema debe actualizar automáticamente la lista según pagos registrados.


El sistema debe permitir exportar el listado en PDF o Excel.




Gestión de Personal
Historia: Como administrador, quiero gestionar la información de los mecánicos (agregar, modificar, eliminar y cambiar estado activo/inactivo), para mantener actualizado el registro de personal del taller.
 Criterios de aceptación:
El sistema debe permitir registrar un mecánico con nombre, documento, especialidad, teléfono y correo.


El administrador debe poder modificar información de los mecánicos.


El sistema debe permitir marcar un mecánico como activo o inactivo.


El sistema debe impedir eliminar un mecánico con servicios registrados, pero sí permitir desactivarlo.


El listado de mecánicos debe mostrar claramente el estado activo/inactivo.



Interfaz
Historia: Como administrador, quiero que la interfaz del sistema tenga una paleta de colores sobria y contrastante, para asegurar visibilidad y legibilidad adecuada de los textos en pantalla.
 Criterios de aceptación:
La interfaz debe aplicar una paleta de colores sobria en todas las pantallas.


El contraste entre texto y fondo debe garantizar legibilidad.


Los elementos de navegación deben ser consistentes en ubicación y estilo.
Proformas y Reportes
Historia: Como administrador, quiero que el sistema permita generar una proforma para los clientes con los datos del taller, cliente, vehículo y servicios realizados, para entregar un resumen claro del trabajo. 
Criterios de aceptación:
·        - La proforma debe incluir en la parte superior los datos del taller: dirección, correo electrónico y página web.
·        - La proforma debe mostrar la fecha de servicio, nombre del cliente, número de contacto y datos del vehículo (placa).
·        - La proforma debe detallar los servicios realizados, precios y condiciones de garantía.
·        - El sistema debe completar automáticamente ciertos datos (fecha, hora, garantía) sin necesidad de ingresarlos manualmente.


Como administrador, quiero que cada proforma tenga un código único de identificación y que pueda incluir descripciones ampliadas o estados como “Revisar”, para reflejar información adicional importante, para entregar un reporte claro y formal. (modificado)
Criterios de aceptación:
El sistema debe asignar automáticamente un código único y secuencial a cada proforma generada.


El sistema debe permitir añadir una descripción ampliada escrita por el administrador o recepcionista.


El sistema debe permitir marcar una proforma con un estado “Revisar” cuando corresponda.


La proforma debe mostrar en la parte superior los datos del taller (nombre, dirección, correo, página web).


La proforma debe incluir datos del cliente( nombre completo, número de contacto y correo), vehículo(placa, marca, modelo y año.), fecha de emisión y servicios/productos detallados.


La proforma debe poder exportarse en formato PDF para su entrega formal al cliente.
El sistema debe impedir generar una proforma si faltan datos obligatorios del cliente o vehículo.



Como administrador, quiero registrar y visualizar una descripción ampliada y detallada de cada servicio brindado, para complementar la información básica del reporte. 
Criterios de aceptación:
El sistema debe permitir registrar una descripción ampliada de cada servicio al momento de crearlo o editarlo.


La descripción ampliada debe almacenarse junto con los datos básicos del servicio (nombre, categoría, precio base).


Al consultar el detalle de un servicio, el sistema debe mostrar la descripción ampliada junto con la información básica.


La descripción debe poder visualizarse también en los reportes vinculados a ese servicio.


El sistema debe permitir modificar la descripción ampliada en el futuro sin afectar los registros históricos ya emitidos.




7. Historia:
Como administrador, quiero que el sistema registre un control de caja diario (ventas, compras y gastos del día), para realizar cierres de caja precisos y detectar faltantes de dinero. (nuevo)
Criterios de aceptación:
El sistema debe registrar ventas, compras y gastos diarios en un módulo de caja.


Al final del día, el sistema debe calcular automáticamente el saldo total.


El cierre de caja debe mostrar: ingresos, egresos y balance del día.


El sistema debe permitir exportar el reporte de caja en PDF o Excel.



8. Historia:
Como administrador, quiero que el sistema permita registrar notas de pagos (ej. pagos a proveedores o pequeños gastos del taller) y que se pueda añadir fechas de pago límite notificando. (nuevo)
Criterios de aceptación:
El sistema debe permitir registrar notas de pago con: concepto, monto, fecha de emisión y fecha límite.


Cada nota de pago debe estar asociada a un proveedor o gasto.


El sistema debe enviar notificaciones o alertas de vencimiento próximas.


Las notas de pago deben visualizarse en un listado filtrable por estado (vigente, vencida, pagada).



9. Historia:
Como administrador, quiero acceder a reportes de ventas por día, semana y mes, para facilitar la gestión de caja y el pago a proveedores. (nuevo)
Criterios de aceptación:
El sistema debe generar reportes de ventas por día, semana y mes.


Los reportes deben mostrar ingresos totales, discriminados entre productos y servicios.


El sistema debe permitir exportar los reportes en PDF o Excel.


El usuario debe poder aplicar filtros por rango de fechas.



10. Historia:
 Como administrador, quiero que el sistema permita actualizar información del servicio ofrecido y repuestos en tiempo real desde cualquier dispositivo (ej. celular), para mantener sincronizados los datos del taller. (nuevo)
Criterios de aceptación:
El sistema debe permitir modificar información de un servicio desde dispositivos móviles y escritorio.


Los cambios realizados deben reflejarse de inmediato en todos los dispositivos conectados.


El sistema debe permitir agregar repuestos desde cualquier ubicación en tiempo real.


Los datos sincronizados deben ser accesibles sin necesidad de recargar la página.


Como administrador, quiero iniciar sesión con mis credenciales únicas, para acceder de forma segura a todas las funcionalidades del sistema de gestión del taller.
Criterios de Aceptación:
El sistema debe permitir el registro de usuarios con email y contraseña
Cada usuario debe tener credenciales únicas (no compartidas)
Todos los usuarios autenticados deben tener acceso completo a todos los módulos
El sistema debe mostrar un mensaje de error claro si las credenciales son incorrectas
La sesión debe mantenerse activa durante un período de tiempo determinado
Debe existir la opción de cerrar sesión de forma segura

Como administrador, quiero registrar en el sistema si un pago se realizó en efectivo o con tarjeta, para llevar un control detallado de los métodos de cobro. (nueva).
Criterios de aceptación (nuevo):
El sistema debe permitir seleccionar el método de pago (efectivo o tarjeta) en cada transacción registrada.


El sistema debe impedir registrar pagos con métodos distintos a efectivo o tarjeta.


El sistema debe reflejar el método de pago en los reportes de ventas y caja diaria.


El sistema debe permitir filtrar reportes por tipo de pago (efectivo o tarjeta).

