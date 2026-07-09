GUIA DE LABORATORIO

Gestión de Versiones con GitOps: SemVer, Dependencias, Empaquetado y Pipeline de Entrega
Kit Completo de Laboratorio - Semana 13
Duración: 200 minutos · 4 horas académicas (bloque 04 HL del Silabo_IS2_2026_Updated.md §1.10; 1 hora académica = 50 min). Incluye receso de 10 min. Objetivo: el equipo formalizará su política de versionamiento semántico (SemVer 2.0.0), fijará y auditará sus dependencias para garantizar builds reproducibles, empaquetará un artefacto versionado, creará la etiqueta firmada en Git, configurará la sincronización de un release mediante ArgoCD/Flux y ejecutará un rollback determinista, produciendo el entregable Pipeline GitOps integrado (Google Docs) para el Producto 2 (S17).
Requisito previo verificado: Borrador de Política de Versionamiento y Release (Actividad Previa S13) con los tres cambios del proyecto clasificados en MAJOR/MINOR/PATCH y el flujo de etiquetado esbozado, sobre las líneas base auditadas de la S12 (IEEE 828-2012) como fuente de verdad.
GUÍA ESTUDIANTE
Hoy conviertes tu repositorio en el punto único desde el cual se gobierna cada entrega a producción: desde la política del número hasta el artefacto que corre en el clúster.
Cronograma (200 min): Apertura 15 → Fase 1 20 → Fase 2 25 → Fase 3 20 → Receso 10 → Fase 4 25 → Fase 5 25 → Fase 6 30 → Fase 7 10 → Cierre 20.
Fase 1. Formalización de la política SemVer (20 min) En el README de tu repositorio Git, redacta la sección "Política de Versionamiento". Define explícitamente qué tipo de cambio justifica un incremento MAJOR, MINOR o PATCH en tu proyecto, con al menos un ejemplo concreto de cada uno. Confirma con tu equipo la clasificación de los tres cambios del sprint traídos de la actividad previa.
Fase 2. Gestión de dependencias y reproducibilidad (25 min) Audita las dependencias de tu proyecto y fíjalas a versiones exactas (dependency pinning) para garantizar builds reproducibles [Contenido generado, práctica de gestión de dependencias, no proviene de las fuentes cargadas]. Consolida y versiona el archivo de bloqueo (lockfile, p. ej. package-lock.json, requirements.txt con ==, go.sum) en el repositorio. Documenta en tu Google Docs un caso donde un rango abierto (p. ej. ^2.0) podría introducir un breaking change transitivo y explica cómo tu pinning lo evita.
Fase 3. Etiquetado firmado del release (20 min) Crea la etiqueta firmada correspondiente a la versión acordada: git tag -s vX.Y.Z -m "descripción del release". Publica la etiqueta en el remoto con git push origin vX.Y.Z. Verifica que la firma es válida con git tag -v vX.Y.Z. Esta etiqueta firmada es tu evidencia de auditoría de configuración (IEEE Std 828-2012).
[Receso de 10 min]
Fase 4. Empaquetado versionado del artefacto (25 min) Construye el artefacto entregable (p. ej. imagen de contenedor) y etiquétalo con la misma vX.Y.Z de tu release [Contenido generado - empaquetado de artefactos/OCI, no proviene de las fuentes cargadas]. Publícalo en tu registry y registra su digest. El artefacto debe ser inmutable: la versión que auditaste, empaquetaste y desplegarás debe ser exactamente la misma. Captura la evidencia del artefacto publicado.
Fase 5. Configuración del pipeline GitOps (25 min) En tu entorno ArgoCD (o Flux), crea o actualiza el Application para que apunte a la etiqueta vX.Y.Z recién publicada y al artefacto versionado [Contenido generado,  operación declarativa GitOps, no proviene de las fuentes cargadas]. Ejecuta argocd app sync y captura el estado del dashboard confirmando Synced y Healthy.
Fase 6. Simulación de breaking change y rollback (30 min) Simula un breaking change: modifica la firma de un endpoint en una rama de feature, intégrala sin incrementar MAJOR (error deliberado) y despliégala. Documenta el impacto sobre los consumidores. Luego ejecuta el rollback (ArgoCD app rollback) a la etiqueta anterior y verifica que el estado vuelve a Synced. Registra toda la trazabilidad (commits, tags, digest del artefacto, logs de ArgoCD) en tu documento de Google.
Fase 7. Documentación del pipeline GitOps integrado (10 min) En Google Docs, consolida el entregable con: (a) política SemVer del proyecto, (b) evidencia de dependencias fijadas y lockfile versionado, (c) tabla de versiones del sprint con su clasificación justificada, (d) etiqueta firmada verificada y artefacto versionado publicado, (e) capturas del estado Synced y Healthy de ArgoCD, (f) registro del rollback con su trazabilidad Git completa. Sube el entregable a Google Classroom.
3. DESAFÍO TÉCNICO
Producir el Pipeline GitOps integrado documentado en Google Docs, que incluya la política SemVer formalizada, las dependencias fijadas con lockfile versionado para builds reproducibles, la etiqueta firmada publicada en el repositorio, el artefacto versionado con la misma vX.Y.Z publicado en el registry, la captura de ArgoCD app sync con estado Synced, la simulación del breaking change y el rollback determinista con trazabilidad Git completa, sustentado en vivo ante el docente.


---------------------------
GUIA DE REFERENCIA.


Guía de referencia rápida - Versionamiento Semántico y Comandos GitOps
Semana 13 · IS2-2026
1. Marco teórico compacto
El versionamiento semántico es un contrato de comunicación entre equipos: el número MAJOR.MINOR.PATCH le dice al consumidor qué clase de cambio se introdujo —incompatible, funcional o correctivo— sin obligarlo a leer el diff completo (Preston-Werner, 2013). Ese contrato solo tiene valor si se hace cumplir en la práctica. Aquí entra GitOps: el repositorio Git se declara como la única fuente de verdad y un operador (ArgoCD/Flux) reconcilia continuamente el estado real del clúster con el estado declarado. Un release deja de ser un evento manual y se convierte en una línea base firmada (git tag -s), trazable y auditable bajo IEEE Std 828-2012. Así, la promesa semántica del número se transforma en una garantía operativa verificable: lo desplegado es, demostrablemente, lo declarado y aprobado.
2. Tabla de reglas SemVer 2.0.0
Segmento
Cuándo incrementar
Ejemplo de cambio que lo dispara
Impacto en los consumidores
MAJOR (vX.0.0)
Ante cualquier cambio incompatible en la API pública, un breaking change (Preston-Werner, 2013).
Eliminar un campo obligatorio de la respuesta de un endpoint o cambiar la firma de un método público.
Deben actualizar su código; no pueden actualizar sin riesgo.
MINOR (v0.X.0)
Al añadir funcionalidad de manera retrocompatible (Preston-Werner, 2013).
Agregar un endpoint nuevo o un parámetro opcional sin alterar los existentes.
Pueden actualizar sin riesgo; adoptar la novedad es opcional.
PATCH (v0.0.X)
Ante correcciones retrocompatibles de errores (Preston-Werner, 2013).
Corregir un cálculo interno sin cambiar la interfaz pública.
Deberían actualizar; es seguro y no requiere cambios.
Pre-release (v0.0.0-alpha, -beta, -rc.1)
Para versiones inestables previas a un release oficial; tienen precedencia menor que la versión asociada (Preston-Werner, 2013).
Publicar v2.0.0-rc.1 para validación antes de liberar v2.0.0.
No deben usarse en producción; sirven para pruebas de integración.

3. Comandos de etiquetado y pipeline GitOps
Etiquetado firmado:
# Crear etiqueta anotada y firmada
git tag -s vX.Y.Z -m "descripción del release"
# Verificar la firma
git tag -v vX.Y.Z
# Publicar la etiqueta en el remoto
git push origin vX.Y.Z


Sincronización con ArgoCD:
# Sincronizar la aplicación con el estado declarado en Git
argocd app sync <nombre-app>
# Verificar el estado de sincronización
argocd app get <nombre-app>
# Ejecutar rollback al estado anterior
argocd app rollback <nombre-app>

Revertir un release problemático en Git:
# Revertir el commit del breaking change (preserva historial)
git revert <commit-hash>
git push origin main
# Etiquetar la versión de rollback
git tag -s vX.Y.Z-revert -m "rollback: descripción"
git push origin vX.Y.Z-revert
4. Plantilla de política de versionamiento
Incluye esta plantilla canónica en el README de tu repositorio:
## Política de Versionamiento (SemVer 2.0.0)
- **MAJOR** (vX.0.0): [definir criterio específico del proyecto]
- **MINOR** (v0.X.0): [definir criterio específico del proyecto]
- **PATCH** (v0.0.X): [definir criterio específico del proyecto]
- **Pre-release** (v0.0.0-alpha): [definir criterio específico del proyecto]

### Proceso de Release
1. Clasificar el cambio según la política anterior.
2. Crear la etiqueta firmada: `git tag -s vX.Y.Z -m "..."`
3. Publicar: `git push origin vX.Y.Z`
4. Sincronizar: `argocd app sync <nombre-app>`
5. Checklist de calidad del pipeline GitOps
Verifica tu entregable antes de subirlo a Google Classroom:
[ ] ¿La política SemVer está formalizada en el README con criterios MAJOR/MINOR/PATCH específicos del proyecto?
[ ] ¿La etiqueta de release está firmada (git tag -s) y verificable (git tag -v)?
[ ] ¿ArgoCD muestra estado Synced y Healthy apuntando a la etiqueta declarada?
[ ] ¿El rollback se realizó via argocd app rollback (sin modificaciones directas al clúster)?
[ ] ¿El entregable se sube en formato de documento de Google en Google Classroom?


-----------------------------------------
MATERIAL DE APOYO

 2. ESTACIÓN DE PRÁCTICA CON IA
Copia el siguiente Prompt de Estudio y ejecútalo en tu entorno de NotebookLM antes de la sesión:
Actúa como un Release Manager y DevOps Lead empático y riguroso. Hazme 3 preguntas
conceptuales y de criterio (no de memorización) sobre el versionamiento semántico
(SemVer 2.0.0), la gestión de dependencias y la sincronización de lanzamientos
mediante GitOps (ArgoCD/Flux) en un sistema desplegado en Kubernetes. Basa tus
preguntas exclusivamente en las fuentes cargadas (Semantic Versioning 2.0.0,
IEEE 828-2012). Haz las preguntas de forma secuencial (una por una). Espera mi
respuesta antes de calificarla y avanzar a la siguiente. Si me equivoco, proporciona
una pista citando el documento original antes de dar la respuesta correcta. Usa
terminología de producción (breaking change, rollback, tag, release) y respeta los
comandos sin traducirlos.

🎧 3. AUDIO DE INMERSIÓN (Podcast)
Escucha el audio conversacional antes de la lectura focalizada. Mientras escuchas, pregúntate: ¿de qué sirve un pipeline de CI/CD impecable si publicas un cambio incompatible bajo un número de versión PATCH y rompes en silencio a todos los equipos que consumían tu API?
Título: "IS2-26 · El Contrato del Número: Versionamiento Semántico y Entregas GitOps" · Formato: Deep Dive · Idioma: Español. [Acceder al audio en el aula virtual (Google Classroom).]
📚 4. GUÍA DE LECTURA FOCALIZADA
Fuente primaria. Semantic Versioning 2.0.0 (Preston-Werner, 2023).
Qué leer: las reglas de incremento MAJOR/MINOR/PATCH y la definición de breaking change.
Conceptos clave: compatibilidad de la API pública, precedencia de versiones, versiones 0.x.y.
Pregunta de control: "Según la especificación, ¿en qué casos exactos estás obligado a incrementar la versión MAJOR, y qué le comunica eso a quien depende de tu software?"
Fuente secundaria. IEEE Std 828-2012 (IEEE, 2012).
Qué leer: las secciones sobre identificación de versiones y gestión de releases.
Conceptos clave: línea base de entrega, etiquetado de versión, trazabilidad y auditoría.
Pregunta de control: "¿Cómo se relaciona un release versionado y firmado (git tag -s) con la integridad de la línea base auditada en la S12?"
🛠️ 5. ACTIVIDAD PREVIA (Antes de la Sesión)
Prerrequisito: líneas base auditadas (S12) y repositorio Git como fuente de verdad.
Objetivo: definir una política de versionamiento semántico para tu software y simular la promoción de un release mediante un flujo declarativo GitOps.
Desafío: toma tres cambios reales o hipotéticos de tu proyecto (una corrección de bug, una funcionalidad nueva retrocompatible y un cambio incompatible) y asigna a cada uno el incremento de versión correcto, justificando el número. Esboza el comando de etiquetado (p. ej. git tag -s v2.0.0 -m "release") sin alterarlo.
Entregable S13: Borrador de Política de Versionamiento y Release (SemVer + GitOps) en formato de documento de Google para Google Classroom.
Checklist de autoevaluación:
[  ] ¿Has clasificado correctamente cada cambio en MAJOR, MINOR o PATCH según la especificación SemVer 2.0.0?
[  ] ¿Has identificado al menos un breaking change y descrito su impacto sobre los consumidores de tu software?
[  ] ¿El flujo de promoción del release parte de un commit en Git y describe la sincronización (p. ej. argocd app sync) sin pasos manuales fuera del repositorio?
💡 6. TEMA PARA REFLEXIÓN/DEBATE
El número como contrato. El versionamiento semántico es una promesa pública: el número le dice al mundo si puede actualizar sin miedo. Sin embargo, muchos equipos publican cambios incompatibles bajo un PATCH para "no asustar". Debate por qué romper la semántica del número es, en la práctica, una falla de gobernanza tan grave como un defecto en el código.
📖 7. ANDAMIAJE CONCEPTUAL (Glosario Previo)
semantic versioning — esquema de versionamiento MAJOR.MINOR.PATCH donde cada segmento comunica la naturaleza y el riesgo del cambio respecto de la compatibilidad (Preston-Werner, 2023). Ejemplo: pasar de v1.4.2 a v2.0.0 declara públicamente que existe un cambio incompatible.
breaking change — modificación que rompe la compatibilidad de la interfaz pública y obliga a incrementar la versión MAJOR (Preston-Werner, 2023). Ejemplo: eliminar un campo obligatorio de la respuesta de un endpoint REST consumido por otros equipos.
dependency pinning — práctica de fijar versiones exactas de las dependencias para garantizar builds reproducibles [Contenido generado — práctica de gestión de dependencias, no proviene de las fuentes cargadas]. Ejemplo: fijar library@2.3.1 en lugar de library@^2 para evitar que una actualización automática introduzca un cambio incompatible.
gitops — operación declarativa en la que el repositorio Git es la fuente de verdad y un operador reconcilia el estado real con el declarado [Contenido generado — término de operación declarativa de infraestructura, no proviene de las fuentes cargadas]. Ejemplo: que ArgoCD sincronice automáticamente el clúster con el estado declarado en el repositorio tras un git push a la rama de release.

---------------------------------------------------------------------
indicaiones: 

REVISA DETALLADAMENTE LA GUIA DE LABORATORIO Y LO QUE PIDE ASER.

DIVIDELO EN TAREA Y REALIZA LAS TAREAS SI ES NESESARIO.

LUEGO DAME UN INFORME DE LOS QUE SE ISO Y QUE SEA FACIL DE ENTENDER. Y QUE ESTE LISTO SOLO PARA PEGAR IMAGENES DE EVIDENCIA. el informe haslo en un archivo md nomas o lo pones en el chat para yo solo copiarlo y pegarlo.



