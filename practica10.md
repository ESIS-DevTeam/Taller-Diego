Kit Completo de Laboratorio - Semana 10
Registro de ICs y Baseline v0: El Primer Punto de Control
Este documento contiene los materiales de orquestación pedagógica y las guías de ejecución práctica para la Semana 10 del curso Ingeniería de Software II (IS2-2026). El objetivo es que los equipos consoliden el Registro de Items de Configuración y formalicen la primera baseline del MVP v1.1 mediante el uso de etiquetas firmadas criptográficamente.
GUÍA ESTUDIANTE
Esta guía contiene los pasos accionables que debes seguir en tu equipo para auditar tu MVP v1.1 y declarar tu primera línea base de control de cambios.
Fase 1. Auditoría interna del borrador
Abre el borrador de tu Registro de ICs elaborado en la actividad previa. Examina cada elemento y hazte la siguiente pregunta: si un ingeniero de software externo a tu equipo se uniera al proyecto hoy, ¿podría comprender el propósito y la ubicación exacta de cada item de configuración basándose únicamente en tu registro? Marca con color de alerta cualquier celda ambigua o descripción generalizada. Tu auditor externo utilizará estos puntos débiles para evaluar la calidad de tu gobernanza.
Fase 2. Refinamiento por categoría
Analiza e inventaría tus archivos recorriendo las categorías en este orden estricto: Configuración → Infraestructura → Código. El orden invertido es una técnica de diseño que te obliga a debatir sobre los elementos más vulnerables del ecosistema al inicio, cuando el equipo cuenta con mayor energía mental. Deja el código de la aplicación para el final, ya que es la zona donde existe mayor disciplina previa por el Producto 1. Integra actas, requerimientos y ADRs bajo la columna de configuración.
Fase 3. Asignación de responsables y criticidad
Cada item de configuración debe tener asignado un responsable único nominal (un integrante del equipo, no "el grupo"). Para determinar la criticidad de cada elemento, aplica la siguiente heurística basada en el impacto en minutos sobre el negocio:
Criticidad Alta: Si el item se corrompe o desaparece, el despliegue se detiene en menos de 30 minutos. Ejemplo: el Dockerfile principal del microservicio.
Criticidad Media: El impacto detiene el flujo de entrega entre 30 minutos y 4 horas. Ejemplo: el script de base de datos de prueba.
Criticidad Baja: El flujo se ve afectado después de 4 horas. Ejemplo: el archivo de decisión de arquitectura (ADR).
Fase 4. Declaración de baseline
Establece tu primer punto de control oficial. Configura tu firma criptográfica en Git y ejecuta en tu terminal:
git tag -s v1.1.0 -m "Baseline Producto 1 — MVP v1.1"


Verifica la firma localmente con:
git tag -v v1.1.0


Si ningún miembro de tu equipo posee una clave privada GPG configurada, registra esta carencia como una deuda técnica en tu registro y documenta el plan de mitigación en tu bitácora de configuración.
Fase 5. Auditoría cruzada
Intercambia tu Registro de ICs con el equipo asignado a través del Aula Virtual. Tu misión como auditor es evaluar la coherencia de su inventario. No leas el código fuente, lee su registro. Busca variables ocultas o scripts sin versionar en sus carpetas de configuración. Anota las inconsistencias en el acta de auditoría. Recuerda la regla de oro de la ingeniería de software: detectar en mesa, resolver fuera.
Cómo evaluar la utilidad del registro:
Evita calificar la estética del documento. Formula al equipo auditado la siguiente pregunta: si el servidor de producción colapsa a las 3 de la mañana, ¿qué item de tu registro me indica dónde encontrar las variables del entorno y quién es el responsable de dar soporte a ese archivo? Si tardan más de 2 minutos en responderte señalando una fila exacta, el registro es inútil y debes calificar el criterio como "En Proceso".
🏋️ 3. DESAFÍO TÉCNICO
Registro Consolidado: Los equipos deberán entregar un Registro de ICs con un mínimo de 20 Items de Configuración distribuidos entre Código, Infraestructura y Configuración.
Línea Base Git: Se debe registrar el tag firmado v1.1.0 en el repositorio remoto Git, adjuntando la clave pública GPG en la documentación del proyecto.
Registro de Deudas: Si existen credenciales o secretos gestionados en servicios externos (como AWS Secrets Manager o Vault) que no se versionan en Git por seguridad, regístralos en una sección dedicada a la Deuda SCM, detallando cómo se asegura su consistencia sin subirlos al repositorio.

--------------------------------

ACTIVIDAD PREVIA (Antes de la Sesión)
Prerrequisito: MVP v1.1 entregado con éxito en la Semana 8 (Producto 1), con repositorio en GitHub operativo y pipeline de integración continua completamente funcional.
Objetivo: Inventariar de forma estructurada los Items de Configuración del MVP del equipo en sus 4 categorías canónicas.
Desafío del laboratorio: Construye un registro inicial de ICs utilizando una tabla con las columnas obligatorias: ID-IC, Categoría (Código / Infraestructura / Configuración / Documentación), Nombre del Item, Ruta o ubicación física, Versión actual, Responsable nominal, Criticidad (Alta / Media / Baja). Tu tabla debe listar de forma rigurosa al menos 20 ICs distribuidos equilibradamente entre las cuatro categorías canónicas.
Entregable S10: Borrador del Registro de ICs inicial. Este documento será refinado activamente durante el Laboratorio de la Semana 10 y servirá como insumo obligatorio para el plan SCMP del Producto 2.
Checklist de autoevaluación:
[ ] ¿Identificaste de forma explícita al menos un IC en cada una de las 4 categorías (Código, Infraestructura, Configuración, Documentación)?
[ ] ¿Cada IC cuenta con un identificador único, estandarizado e irrepetible (no se repite ningún ID-IC)?
[ ] ¿Catalogaste bajo Criticidad: Alta aquellos ICs cuya pérdida, corrupción o falta de control bloquearía de forma inmediata la compilación o el despliegue del sistema?
[ ] ¿Puedes justificar técnicamente por qué un archivo de documentación secundario (ej. un README.md de bienvenida) no califica como un IC, pero un archivo de orquestación de contenedores (ej. docker-compose.prod.yml) sí constituye un IC indispensable?


----------------------------

Guía de Referencia: Registro de ICs, Baselines y Plantilla de SCMP
Esta guía de referencia rápida provee los recursos metodológicos para consolidar apropiadamente el registro de tus elementos de configuración o configuration item y definir la línea base o baseline de tu MVP v1.1. Para garantizar el orden y la trazabilidad de los entregables del producto, debes estructurar un plan de gestión de la configuración de software o software configuration management plan. En el desarrollo ágil moderno, el uso de infraestructura como código o infrastructure as code, la generación de un artefacto inmutable o immutable artifact bajo un control de versiones o versioning robusto y la gestión del commit, el tag, la etiqueta firmada o signed tag y la entrega o release constituyen las bases de la confiabilidad del producto en entornos productivos.
📝 1. Guía de referencia rápida: Comandos Git para SCM
Cuando asumes la responsabilidad de la gestión de configuración en tu equipo, necesitas comandos precisos para controlar el ciclo de vida del MVP v1.1. A continuación, se detalla una guía de referencia rápida para identificar, declarar, verificar y proteger las líneas base del proyecto.
Identificación del estado actual
Antes de formalizar cualquier punto de control, debes evaluar el estado del repositorio e identificar los commits que representan entregas funcionales estables:
git log --oneline --decorate


Este comando te muestra un historial compacto de la rama activa, permitiéndote rastrear commits clave y verificar qué etiquetas o ramas ya se encuentran configuradas en el historial. Asimismo, para nombrar y ubicar con precisión la posición actual de tu espacio de trabajo respecto a la última línea base declarada, utiliza:
git describe --tags


Este comando calcula la distancia en commits desde el tag más cercano y genera una cadena estructurada que describe el estado del código, sirviendo para justificar técnicamente el incremento en la versión del software.
Declaración formal de baseline
Una vez auditados los componentes y validada su estabilidad por el equipo, debes oficializar la línea base mediante una etiqueta firmada criptográficamente en el commit correspondiente:
git tag -s v1.1.0 -m "Baseline Producto 1"


Al ejecutar esta instrucción, Git utiliza tu clave privada GPG para generar una firma digital que garantiza la inmutabilidad y autenticidad del estado del repositorio. Para que esta línea base esté disponible para todo el equipo de desarrollo y los procesos automatizados de despliegue continuo, debes publicar el tag en el servidor remoto:
git push origin v1.1.0


Un tag local que no se publica no es una baseline compartida: es una nota privada. La baseline solo existe cuando el equipo la puede verificar.
Verificación de la baseline
Cualquier miembro del equipo o auditor puede constatar la validez de la firma digital asociada al punto de control ejecutando:
git tag -v v1.1.0


Si deseas inspeccionar el contenido completo firmado y la metadata del commit vinculado a la baseline, utiliza el comando de visualización detallada:
git show v1.1.0


Protección del repositorio
Para asegurar que cada etiqueta de versión sea firmada de manera obligatoria en tu entorno local, activa la firma por defecto en tu configuración global de Git:
git config --global tag.gpgSign true


Finalmente, debes configurar las reglas de protección de ramas en tu repositorio remoto para prohibir estrictamente el borrado o la modificación de etiquetas existentes, protegiendo la inalterabilidad histórica del release.
[Contenido generado parcial — comandos específicos de Git no provienen literalmente de SWEBOK; sí de Chacon & Straub (Pro Git, Cap. 7)]

------------------------------------------------------

ENTREGABLES DE LA SEMANA 10
Entregable 1 (Principal)
Registro Consolidado de ICs

Deben entregar una tabla con mínimo 20 Items de Configuración.

La tabla debe contener como mínimo:

ID-IC |	Categoría |	Nombre |	Ruta |	Versión |	Responsable |	Criticidad |
      |           |        |       |          |             |            |   

Esto sale explícitamente del kit de preparación autónoma.

Categorías obligatorias
Configuración

Ejemplos:

HU
Event Storming
Context Map
ADRs
Actas
Infraestructura

Ejemplos:

Dockerfile
Docker Compose
Base de datos
CI/CD
Código

Ejemplos:

OrdenServicio
Inventario
Facturación
Vehículos

La guía del laboratorio exige que los ICs estén distribuidos entre estas categorías.

Entregable 2
Baseline v1.1.0

Crear el tag:

git tag -s v1.1.0 -m "Baseline Producto 1 — MVP v1.1"

Verificar:

git tag -v v1.1.0

Y subirlo al remoto:

git push origin v1.1.0

La guía lo exige explícitamente.

Entregable 3
Clave pública GPG

Deben adjuntar la clave pública utilizada para firmar el tag.

Si no tienen GPG:

Registrar la situación como deuda técnica.
Definir plan de mitigación.
Entregable 4
Registro de Deuda SCM

Si existen elementos que no están en Git:

Ejemplos:

Contraseñas
Tokens
Credenciales
Variables de entorno
AWS Secrets Manager
Vault

Deben registrarlos en una sección llamada:

Deuda SCM

explicando:

Dónde están.
Quién los administra.
Cómo garantizan consistencia.

-----------------------

Una distribución razonable sería:

Configuración: 8 ICs
Infraestructura: 6 ICs
Código: 10 ICs