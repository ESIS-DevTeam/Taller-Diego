GUIA DE LABORATORIO

Dashboard de SLIs/SLOs (SRE): Fiabilidad como Contrato con Prometheus
Kit Completo de Laboratorio - Semana 14
Objetivo: El equipo instrumentará su servicio con métricas en Prometheus, redactará las consultas promql que calculan sus SLIs, configurará paneles en Grafana que visualicen el SLO y el consumo del error budget, y producirá el entregable Dashboard SRE (Google Docs) para el Producto 2 (S17).


GUÍA ESTUDIANTE
Asumirás el control total de la fiabilidad de tu producto de software. Siguiendo los preceptos del SWEBOK v4.0a, demostrarás la capacidad operativa de tu sistema a través de indicadores de disponibilidad y continuidad en tiempo real.
Cronograma (200 min): Apertura, 15 → Fase 1, 15 → Fase 2, 35 → Fase 3, 30 → Receso 10 → Fase 4, 40 → Fase 5, 35 → Cierre, 20.

Fase 1. Verificación de Telemetría (15 min) Comprueba en tu clúster que el servicio del S13 expone métricas en Prometheus. Ejecuta up{job="..."} (reemplazando el nombre de tu job). Un valor de 1 confirma que Prometheus está haciendo scraping correctamente. Sin esta confirmación, cualquier consulta más compleja fallará.


Fase 2. Redacción de las Consultas SLI (35 min) Redacta en tu Google Docs las consultas promql para tus SLIs:
. Availability: sum(rate(http_requests_total{status!~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
. Latency p99: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

No uses promedios para la latency; usa histogram_quantile() para el percentil 99 y garantizar que el 99% de tus usuarios experimenten respuestas rápidas. Justifica por qué cada consulta mide lo que tu SLI declara.


Fase 3. Panel del SLO en Grafana (30 min) En Grafana, crea un panel que dibuje el SLI calculado y el SLO como umbral horizontal (ej. línea en 0.99). Configura la visualización para que cualquier punto que caiga por debajo del umbral se marque en color coral o rojo. Comprueba visualmente cuándo el servicio entra y sale de SLO.



Fase 4. Panel del Error Budget (40 min) Añade un panel que calcule el error budget consumido. Usa la fórmula orientativa: 1 - (SLI_real / SLO) [Contenido generado — fórmula orientativa, ajústala al contexto del proyecto]. Marca la zona donde el presupuesto se agota. Documenta en Google Docs qué decisión tomarías (congelar releases o renegociar SLO) si el consumo supera el 50% antes de mitad de mes.

Fase 5. Alerta de Burn Rate y Entregable (35 min) Configura una regla de alerta en Alertmanager para el burn rate y consigna su umbral. Una alerta preventiva no espera a que el presupuesto se agote: avisa cuando la velocidad de consumo indica que lo agotarás en pocas horas. Consolida el Dashboard SRE en Google Docs: capturas de los paneles, consultas promql documentadas, SLOs acordados y error budget mensual calculado. Sube a Google Classroom.


3. DESAFÍO TÉCNICO
Producir el Dashboard SRE (Grafana + Google Docs): SLIs expresados como fracción con consulta promql, SLOs ≠ 100% con justificación, panel del error budget consumido y regla de burn rate en Alertmanager, sustentado en vivo ante el docente.

-----------------------------------------------------------------
MATERIAL DE APOYO


Guía de referencia rápida - SLIs, SLOs y Error Budget con Prometheus
Semana 14 · IS2-2026
1. MARCO TEÓRICO COMPACTO
En la ingeniería de fiabilidad, el error budget convierte la estabilidad del sistema en un contrato cuantitativo entre el desarrollo ágil y las operaciones (Beyer et al., 2016) [Contenido generado — no proviene de las fuentes cargadas]. En lugar de perseguir la utopía inalcanzable del 100% de fiabilidad, este presupuesto define cuánto riesgo puedes asumir al desplegar nuevas funcionalidades. Si lo agotas, detienes los releases y estabilizas; si tienes margen, sigues innovando. Para que este contrato no sea una ilusión documentada, necesitas observabilidad real. Prometheus hace que tus service level objectives sean verificables en tiempo real, garantizando que cumples con la gestión de capacidad y continuidad dictada por el SWEBOK v4.0a (Washizaki, 2025).

2. JERARQUÍA SLI / SLO / SLA

Categoría
Definición
Pregunta que responde
Consecuencia si se incumple
SLI (service level indicator)
Medida cuantitativa, cuidadosamente definida, de algún aspecto del nivel de servicio proporcionado (Beyer et al., 2016).
¿Cuál es el estado actual real del servicio?
Ninguna directa; es solo el termómetro.
SLO (service level objective)
Valor objetivo o rango del SLI que el servicio se compromete a mantener durante una ventana de tiempo (Beyer et al., 2016).
¿Cuál es el nivel de fiabilidad que prometemos internamente?
Congelamiento de releases de nuevas funcionalidades.
SLA (service level agreement)
Contrato explícito con los usuarios finales que incluye consecuencias si el servicio no cumple los objetivos (Beyer et al., 2016).
¿Qué le pasa al negocio si fallamos gravemente ante el cliente?
Penalizaciones financieras, pérdida de clientes, reembolsos.
error budget
Diferencia entre el 100% de fiabilidad perfecta y el SLO acordado. Cálculo: 100% − SLO (Beyer et al., 2016).
¿Cuánta "infiabilidad" podemos asumir?
El equipo reasigna todos sus esfuerzos a estabilidad.

3. PLANTILLAS PROMQL PARA SLIS COMUNES
Consultas en promql con comentarios en línea, literales y sin traducción [Contenido generado — no proviene de las fuentes cargadas]:
# 1. Availability — fracción de peticiones no-5xx sobre el total
sum(rate(http_requests_total{status!~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))

# 2. Latency p99 — percentil 99 de la duración de peticiones
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# 3. Throughput — tasa de peticiones (contexto de carga, no SLI por sí solo)
sum(rate(http_requests_total[5m]))

# 4. Error budget consumido — orientativo, ajusta al SLO del proyecto
1 - (
  sum(rate(http_requests_total{status!~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
) / 0.99


[Contenido generado — fórmulas orientativas de la industria, no provienen de las fuentes cargadas]
4. TABLA DE ERROR BUDGET POR NIVEL DE SLO
Para una ventana de 30 días (43 200 min) [Contenido generado — no proviene de las fuentes cargadas]:
SLO
Infiabilidad tolerada (%)
Minutos de caída / 30 días
Implicación práctica
99%
1.00%
432 min (~7.2 h)
Amplio margen. Puedes desplegar con frecuencia y tomar riesgos experimentales.
99.9%
0.10%
43.2 min
Margen estándar. CI/CD requiere pruebas rigurosas antes de cada release.
99.95%
0.05%
21.6 min
Margen estricto. Requiere rollback inmediato y alta automatización.
99.99%
0.01%
4.32 min
Tolerancia casi nula. Congelar todo release no crítico si hay incidente.


-------------------------------------------------------

revisar detalladamente las indicaiones de esta practica 14 para aplicarlas al proyecto.
