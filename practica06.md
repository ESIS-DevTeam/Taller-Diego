 2. GUÍA DE LECTURA FOCALIZADA
Para asimilar la validación dinámica de sistemas, se deben analizar las siguientes referencias antes de la sesión de laboratorio.
El estudio se centra en el SWEBOK v4.0a (IEEE Computer Society, 2024), específicamente en las técnicas de prueba. Washizaki (2025) establece una distinción basada en el conocimiento de la estructura interna. Las técnicas basadas en la especificación (black-box testing) derivan casos de prueba observando contratos de entrada y salida para validar que el software respeta el negocio. Por otro lado, las técnicas basadas en la estructura (white-box testing) evalúan el flujo de control y el recorrido algorítmico interno.
Sin embargo, la cobertura estructural no garantiza mantenibilidad. En el capítulo 28 de Clean Architecture: A Craftsman's Guide to Software Structure and Design, Martin (2018) advierte que las pruebas acopladas a componentes volátiles (GUI o bases de datos) generan el antipatrón de las pruebas frágiles. La solución es la implementación de una testing API: una frontera programática que aísla la suite de pruebas y permite validar el dominio de forma agnóstica.
Cuestionario de Control:
Según el SWEBOK v4.0a, ¿por qué la cobertura de sentencias por sí sola es una métrica insuficiente para las técnicas de white-box?
¿De qué manera la implementación de una testing API descrita por Martin (2018) previene el antipatrón de las pruebas frágiles?
En el contexto de la Arquitectura Hexagonal, ¿por qué un framework de automatización de pruebas se considera el sustituto natural de un actor primario?
💡 3. TEMA PARA REFLEXIÓN/DEBATE
Dilema: Si el Gherkin se vuelve demasiado técnico, ¿sigue siendo técnica de especificación o se degrada a un script de automatización frágil?
Reflexiona sobre el siguiente escenario: un equipo utiliza Behavior-Driven Development (BDD) pero sus archivos .feature indican: "Dado que el usuario hace clic en el div con id 'login-box', Cuando inyecta la consulta SQL... Entonces renderiza error HTTP 500".
Este escenario destruye el propósito de BDD. El lenguaje Gherkin debe servir como documentación viva y técnica de especificación para la colaboración entre expertos y desarrolladores (Cucumber, s.f.). Al acoplar el texto a detalles técnicos, se violenta la arquitectura limpia (Martin, 2018). Debate: ¿Cómo mantenemos el lenguaje ubicuo centrado en el negocio delegando los detalles mecánicos a la testing API?
🛠️ 4. ACTIVIDAD PREVIA (Esfuerzo estimado: 30 min)
Realiza este análisis individual sobre el código fuente de tu MVP:
Selección de la User Story (10 min): Extrae del backlog una historia que represente una regla de negocio crítica (validaciones o cálculos complejos).
Traducción a escenarios Gherkin (10 min): Redacta dos escenarios (Dado / Cuando / Entonces). Uno para el happy path y otro para una regla de excepción basada en análisis de valores límite (Washizaki, 2025). El vocabulario debe ser declarativo (sin mención a botones o bases de datos).
Mapeo arquitectónico (10 min): Identifica la técnica aplicada (especificación/black-box). Anota hacia qué puerto primario (caso de uso o servicio de dominio) deberán apuntar las step definitions para saltar la capa de presentación (Cockburn, 2005; Martin, 2018).
📖 5. ANDAMIAJE CONCEPTUAL (Glosario)
Desarrollo Guiado por Comportamiento (BDD): Metodología que conecta requisitos de negocio con automatización mediante ejemplos (Cucumber, s.f.).
Escenario Gherkin: Gramática estructurada (Dado/Cuando/Entonces) para especificaciones ejecutables (Cucumber, s.f.).
Prueba de caja blanca (white-box): Técnicas basadas en la estructura que analizan el flujo de control y sentencias directas del código (Washizaki, 2025).
Prueba de caja negra (black-box): Técnicas basadas en la especificación que observan contratos de entrada/salida (Washizaki, 2025).
Testing API: Interfaz para desacoplar los tests del código de producción, evadiendo adaptadores volátiles (Martin, 2018)

----------------------------------------------


Laboratorio: Archivos .feature Vinculados al MVP
🎯 1. OBJETIVO
Traducir los requisitos de negocio de tu Producto Mínimo Viable (MVP) hacia criterios de aceptación ejecutables y sin ambigüedades, mediante la redacción de escenarios en lenguaje Gherkin. Aprenderás a vincular estas especificaciones directamente a los puertos primarios de tu arquitectura hexagonal, garantizando un diseño de pruebas resistente a cambios visuales.
🚀 2. PASO A PASO TÉCNICO
Fase 1: Revisión de Historias de Usuario (45 min) Tu primera tarea como ingeniero de software no es escribir código, sino comprender el problema. Revisa el tablero de planificación de tu MVP (Semana 1) e identifica al menos tres historias de usuario que contengan reglas de negocio complejas. Al hacerlo, estarás preparando el terreno para aplicar las técnicas basadas en la especificación dictadas por el Guide to the software engineering body of knowledge v4.0a (SWEBOK Guide), las cuales se centran en evaluar los contratos de entrada y salida sin depender del conocimiento del código fuente (Washizaki, 2025). Identifica cuáles son los datos válidos y cuáles son los límites excepcionales para cada requisito.
Fase 2: Escritura de Escenarios Gherkin (45 min) Crea un directorio llamado /features en la raíz de tu proyecto de pruebas. Dentro, redacta tus especificaciones ejecutables utilizando la sintaxis de texto plano de Gherkin (Cucumber, s.f.). Por cada historia de usuario, debes redactar dos escenarios: el "camino feliz" (cuando todo sale bien) y una ruta de error. Utiliza estrictamente el formato de comportamiento:
Given (Dado): Define el estado inicial del sistema.
When (Cuando): Define la acción del usuario o evento.
Then (Entonces): Define el resultado o transformación esperada.
Asegúrate de que el vocabulario provenga exclusivamente del dominio del negocio. Queda prohibido el uso de términos técnicos como "clic", "botón", "tabla SQL" o "DOM".
Fase 3: Mapeo a la Arquitectura (45 min) Una prueba automatizada que depende excesivamente de la interfaz de usuario es una "prueba frágil" que incrementará los costos de mantenimiento futuro (Martin, 2017). Para evitar este antipatrón arquitectónico, construirás un puente técnico. La teoría establece que el adaptador natural para sustituir al actor primario que dirige la aplicación es un arnés de pruebas automatizado (Cockburn, 2005).
Nota del curso: La conexión directa entre puertos primarios y BDD/Gherkin es una inferencia pedagógica diseñada para este curso.
Por lo tanto, tus archivos .feature se conectarán, mediante los step definitions (definiciones de pasos), a una testing API que invocará directamente la interfaz de los puertos primarios (los casos de uso) de tu hexágono.
Fase 4: Ejecución (45 min) Configura el framework (por ejemplo, Cucumber) en el entorno de desarrollo integrado de tu equipo. Ejecuta la herramienta de automatización para procesar el directorio /features. Inicialmente, los pasos aparecerán como "no implementados" o fallarán. Desarrolla el código base en tus puertos primarios y stubs de dominio hasta que el terminal confirme que al menos un escenario completo se ha ejecutado y validado de manera exitosa (color verde). Esta ejecución dinámica es la prueba definitiva de que la funcionalidad del software cumple su contrato con el usuario (Washizaki, 2025).
📤 3. ENTREGABLES
Para acreditar la culminación del laboratorio, el equipo deberá incorporar en el sistema de gestión del curso (o repositorio de control de versiones) la siguiente evidencia, tal como lo exige el programa de prácticas del Sílabo de curso "Ingeniería de Software II" (UNJBG, 2026):
Directorio de Especificaciones: La carpeta física /features subida al repositorio, conteniendo al menos tres (3) archivos .feature redactados con lenguaje Gherkin.
Tabla de Vinculación Arquitectónica: Un documento en formato Markdown (README.md) que contenga una matriz detallando: Nombre del Escenario | Puerto Primario Invocado | Técnica SWEBOK Aplicada (caja negra / caja blanca).
Evidencia de Ejecución: Una captura de pantalla de la terminal o del sistema de integración continua demostrando al menos un (1) escenario Gherkin pasando exitosamente (PASSING) contra la lógica del MVP.


-------------------

HISTORIA DE USUARIO

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

.Como usuario del sistema (administrador, recepcionista o mecánico), quiero iniciar sesión con mis credenciales únicas, para acceder de forma segura a todas las funcionalidades del sistema de gestión del taller.
Métodos de pago

.Como administrador, quiero registrar en el sistema si un pago se realizó en efectivo o con tarjeta, para llevar un control detallado de los métodos de cobro.
