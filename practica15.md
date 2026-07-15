GUIA DE LABORATORIO

Kit Completo de Laboratorio - Semana 15
Título: Chaos Engineering y Observabilidad: Inyección de Fallos e Instrumentación con OpenTelemetry en Kubernetes
Curso: Ingeniería de Software II (IS2-2026) - UNJBG
El diseño de sistemas distribuidos altamente disponibles exige que la validación de la resilience se realice de forma empírica y bajo condiciones realistas de producción (Principles of Chaos Engineering, 2019). Para los estudiantes de séptimo ciclo de la UNJBG, la siguiente guía consolida el marco práctico para ejecutar inyección de fallos controlados y observar su propagación sistémica utilizando instrumentación moderna.
GUÍA ESTUDIANTE
Fase 1: Instrumentación de Telemetría
Integren OpenTelemetry SDK en su microservicio sobre Kubernetes.
Configuren el exportador gRPC hacia Jaeger para recolectar trazas.
Registren spans propagando cabeceras HTTP en llamadas internas para asegurar la trazabilidad distribuida completa del sistema.
Fase 2: Despliegue de Chaos Mesh
Verifiquen que el operador Chaos Mesh esté saludable en el clúster [Contenido generado].
Creen el manifiesto YAML para inyectar fallos de red controlados [Contenido generado].
Usen selectores de etiquetas precisos para limitar el blast radius de su experimento en Kubernetes (Principles of Chaos Engineering, 2019).
Fase 3: Formulación y Steady State
Definan su steady state: tasa de éxito >99% y latencia <200ms en Grafana.
Formulen la hipótesis: «Inyectando 1500ms de latencia, el servicio mantendrá el steady state activando caché».
Registren la línea base estable en Prometheus antes del caos.
Fase 4: Ejecución del Experimento
Apliquen el YAML del experimento usando kubectl.
Monitoreen el sistema en tiempo real con Grafana (Principles of Chaos Engineering, 2019).
Borren el experimento si peligra la estabilidad o el error budget.
Fase 5: Análisis y Reporte (10 min)
Busquen en Jaeger los spans inyectados con latencia.
Verifiquen la ejecución del fallback y mitigación de fallas en cascada (Beyer et al., 2016).
Descarguen métricas y elaboren su informe técnico de resilience [Contenido generado].

🏋️ DESAFÍO TÉCNICO
Ejecuten un experimento de caos de alta fidelidad:
Inyección: Con Chaos Mesh, inyecten un retardo de red de al menos 1500ms en el servicio de pagos o simulen la pérdida del 50% de los pods de stock.
Mapeo: Mapeen el flujo transaccional usando OpenTelemetry y Jaeger para identificar cuellos de botella y latencias bajo estrés controlado.
Entregables:
Reporte de Trazas: Captura y análisis de una traza en Jaeger que muestre el comportamiento de los spans bajo latencia.
Informe de Caos: Documento PDF con la hipótesis (Principles of Chaos Engineering, 2019), el manifiesto YAML, gráficos de Prometheus del steady state, y conclusiones.

-----------------------------------------------------

El objetivo es que los estudiantes analicen críticamente el impacto del fallo antes de iniciar la práctica. Lanza la pregunta detonante para abrir el debate técnico en clase:
«Si al inyectar latencia en la base de datos réplica el servicio principal falla de inmediato, ¿qué mecanismo de Circuit Breaker faltó y cómo se refleja en el gráfico de latencia de Prometheus?»
Instrumentación (15 min): Supervisa OpenTelemetry SDK en microservicios para capturar spans y propagar contexto [Contenido generado].
Observabilidad (10 min): Verifica trazas en Jaeger y métricas en Prometheus.
Plataforma (10 min): Comprueba el estado de Kubernetes y Chaos Mesh [Contenido generado].
Formulación (10 min): Guía hipótesis de steady state basadas en negocio (Principles of Chaos Engineering, 2019).
Inyección (15 min): Monitorea el manifiesto YAML en Chaos Mesh, vigilando el SLO (Beyer et al., 2016).
Auditoría (10 min): Correlaciona alertas de Prometheus con spans en Jaeger.
Preguntas de Dinamización
Pregunta 1: ¿Por qué es indispensable medir el steady state basándose en variables de negocio y salidas del sistema en lugar de métricas como CPU? (Principles of Chaos Engineering, 2019).
Respuesta: Medir atributos internos solo valida cómo funciona el sistema técnicamente; el chaos engineering busca verificar que el sistema realmente hace su trabajo y entrega valor bajo condiciones turbulentas (Principles of Chaos Engineering, 2019).
Pregunta 2: Si las interacciones entre microservicios sanos causan resultados impredecibles (Principles of Chaos Engineering, 2019), ¿cómo ayuda el monitoreo de caja blanca a detectar fallas latentes? (Beyer et al., 2016).
Respuesta: El monitoreo de caja blanca expone métricas internas (Beyer et al., 2016), permitiendo observar desajustes de fallbacks o tormentas de reintentos antes de que escalen (Principles of Chaos Engineering, 2019).
Cierre
«La confiabilidad no es estática, sino un proceso de aprendizaje continuo ante fallos inevitables (Beyer et al., 2016). Experimentar proactivamente es la única vía para construir resiliencia sistémica real (Principles of Chaos Engineering, 2019)» [Contenido generado].
-----------------------------
MATERIAL DE APOYO

Guía de referencia rápida - Chaos Engineering y Resiliencia
📖 1. MARCO TEÓRICO COMPACTO
El chaos engineering es la disciplina de experimentar sobre un sistema para construir confianza en su capacidad de soportar condiciones turbulentas en producción (Principles of Chaos Engineering, 2019). En arquitecturas distribuidas sobre Kubernetes, la interacción de microservicios sanos genera comportamientos impredecibles (Principles of Chaos Engineering, 2019). Para validar la resilience, se implementa una inyección de fallos (fault injection) de forma controlada y empírica (Principles of Chaos Engineering, 2019).
Mediante la instrumentación de observability de caja blanca con OpenTelemetry, se capturan métricas y trazas distribuidas que permiten auditar el sistema (Beyer et al., 2016). Esto asegura comprobar si el sistema mantiene su steady state—el comportamiento medible que indica una operación normal (Principles of Chaos Engineering, 2019)—o si las fallas en cascada comprometen el error budget definido para los SLO de los servicios (Beyer et al., 2016). El objetivo es desvelar debilidades de forma proactiva antes de que impacten al usuario final, minimizando siempre el blast radius de cada experimento en producción (Principles of Chaos Engineering, 2019).
📐 2. TABLA DE TIPOS DE FALLOS EN KUBERNETES
Tipo de Caos (Chaos Mesh)
Acción de inyección de fallo
Hipótesis típica de mitigación
Consulta de validación (PromQL)
PodChaos
Eliminación aleatoria de pods (pod-failure).
Despliegue con réplicas múltiples y políticas de anti-affinity toleran la pérdida sin caída del servicio.
sum(rate(http_requests_total{status=~"5.*"}[1m]))
NetworkChaos
Inyección de latencia de red de 1500ms (delay).
El uso de circuit breakers y timeouts locales detiene el bloqueo de hilos de ejecución.
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))
HTTPChaos
Inyección de errores HTTP 503 en peticiones (abort).
Políticas de reintentos con retraso exponencial mitigan fallos transitorios en el microservicio.
sum(rate(http_requests_total{status="503"}[1m]))
StressChaos
Consumo forzado de CPU o memoria en pods (stress).
Los límites de recursos del pod evitan fugas y garantizan el aislamiento frente a vecinos ruidosos.
sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate) by (pod)


🔍 3. MANIFIESTO  YAML DE CHAOS MESH (EJEMPLO COMPACTO)
Manifiesto de latencia en un microservicio de inventario en Kubernetes:

apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos # Caos de red para simular problemas de conectividad o latencia.
metadata:
  name: latency-injection-inventory
  namespace: test-env
spec:
  action: delay # Acción de inyección de fallo: introduce retraso de red.
  mode: one # Afecta solo a un pod seleccionado al azar para minimizar el blast radius.
  selector: # Criterio de selección del objetivo.
    namespaces:
      - production-app
    labelSelectors:
      app: inventory-service
  delay:
    latency: '1500ms' # Latencia inyectada para forzar la activación de timeouts.
    jitter: '10ms'
  direction: to # Aplica el retardo a las peticiones entrantes.
  duration: '5m' # Duración total para proteger el error budget.
✍️ 4. PLANTILLA DE INFORME DE EXPERIMENTO DE CAOS
ID Exp
Hipótesis del Caos
Métrica de Steady State
Manifiesto de Inyección YAML
Comportamiento Observado
Trazas en Jaeger (IDs)
Resultado
EXP-01
Si inventario añade 1.5s de latencia, órdenes activa caché en <500ms con éxito >99.5%.
Latencia p95 < 200ms en órdenes; tasa de error < 1%.
latency-injection-inventory (NetworkChaos)
Latencia p95 subió a 410ms; el circuit breaker de órdenes respondió correctamente.
5a7f28b49c0d12e3
Mitigado





-------------------------------------------------------

revisar detalladamente las indicaiones de esta practica 15 para aplicarlas al proyecto.
