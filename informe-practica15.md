# Informe de Chaos Engineering — Taller de Diego

**Semana 15 · IS2-2026 — Inyección de fallos e instrumentación con OpenTelemetry**

**Equipo:** ESIS-DevTeam · **Servicio:** backend FastAPI del Taller de Diego
**Repositorio:** https://github.com/ESIS-DevTeam/Taller-Diego

---

## Resumen de lo realizado

Se dotó al backend de **trazabilidad distribuida** con OpenTelemetry (exportando a **Jaeger**) y se ejecutó un **experimento de caos** inyectando 1500ms de latencia en el servicio de inventario, observando en tiempo real cómo el sistema abandona su *steady state*. Todo quedó versionado en el repositorio.

| Fase | Qué se hizo | Archivo(s) |
|---|---|---|
| 1 · Telemetría | OpenTelemetry SDK → trazas a Jaeger (OTLP/gRPC); auto-instrumentación de HTTP y SQLAlchemy | `backend/telemetry.py`, `backend/main.py` |
| 2 · Chaos Mesh | Manifiesto `NetworkChaos` de latencia con selector de etiquetas (blast radius) | `deploy/chaos/network-latency-inventory.yaml` |
| 3 · Steady State | SLI de latencia p95 < 200ms + hipótesis + baseline | `observability/prometheus/rules/slo_rules.yml` |
| 4 · Ejecución | Inyección de 1500ms y monitoreo en Grafana | `backend/chaos.py` |
| 5 · Análisis | Trazas en Jaeger con la latencia, verificación del impacto | este informe |

> **Nota sobre Chaos Mesh:** el operador Chaos Mesh requiere un clúster Kubernetes. Como el entorno es Docker (sin K8s), el manifiesto `NetworkChaos` se entrega como artefacto y el experimento se **ejecutó realmente** con un arnés de caos equivalente a nivel de aplicación (`backend/chaos.py`), que inyecta el mismo retardo de 1500ms sobre el mismo objetivo (inventario). Los resultados (métricas y trazas) son reales.

---

## Fase 1 · Instrumentación de Telemetría (OpenTelemetry → Jaeger)

Se integró el **OpenTelemetry SDK** en el backend (`backend/telemetry.py`), configurando un exportador **OTLP/gRPC hacia Jaeger** (`jaeger:4317`). La auto-instrumentación de FastAPI y SQLAlchemy genera un span raíz por cada petición HTTP y spans hijos por cada consulta a la base de datos, propagando el contexto de traza por las cabeceras (`traceparent`) para garantizar trazabilidad distribuida.

Verificación: al arrancar el stack y generar tráfico, Jaeger reconoce el servicio:
```
GET /api/v1/services  →  {"data":["taller-diego-backend"], ...}
```

> 📷 **EVIDENCIA 1:** UI de Jaeger (http://localhost:16686) mostrando el servicio `taller-diego-backend` y una traza baseline de `GET /api/v1/productos/` (~6ms), con el span hijo de la consulta SQL.

`[PEGAR CAPTURA AQUÍ]`

---

## Fase 2 · Manifiesto de Chaos Mesh (inyección de fallo de red)

Se creó el manifiesto `deploy/chaos/network-latency-inventory.yaml` (`kind: NetworkChaos`), que inyecta **1500ms de latencia** con un **selector de etiquetas preciso** (`app: taller-diego-backend`) y `mode: one` para **acotar el blast radius** a un solo pod, con `duration: 5m` para proteger el error budget.

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: latency-injection-inventory
  namespace: taller-diego
spec:
  action: delay
  mode: one                 # blast radius mínimo: un solo pod
  selector:
    labelSelectors:
      app: taller-diego-backend
  delay:
    latency: "1500ms"
    jitter: "10ms"
  direction: to
  duration: "5m"            # protege el error budget
```

> 📷 **EVIDENCIA 2:** El manifiesto YAML `network-latency-inventory.yaml` abierto en el editor.

`[PEGAR CAPTURA AQUÍ]`

---

## Fase 3 · Steady State e Hipótesis

**Steady state (comportamiento normal medible):**
- Latencia **p95 < 200ms**
- Tasa de éxito **> 99%** (disponibilidad)

Se añadió el SLI de p95 como recording rule en Prometheus:
```promql
sli:latency_p95:seconds_1m =
  histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))
```

**Hipótesis del experimento (Principles of Chaos Engineering):**
> «Inyectando 1500ms de latencia en el servicio de inventario (`/api/v1/productos/`), el sistema **abandonará su steady state** (p95 subirá muy por encima de 200ms), pero **mantendrá la disponibilidad** (sin errores 5xx): el fallo es de *latencia*, no de caída. Esto evidencia la **ausencia de un circuit breaker / timeout local** que debería cortar la espera y activar un fallback.»

**Línea base registrada (antes del caos):**

| Métrica | Valor baseline | Steady state |
|---|---|---|
| Latencia p95 | **0.047 s (47ms)** | ✅ < 200ms |
| Disponibilidad | **100%** | ✅ > 99% |

> 📷 **EVIDENCIA 3:** Panel de Grafana "S15 · Chaos — Latencia p95 vs Steady State" mostrando la línea **verde y plana bajo los 200ms** (baseline estable).

`[PEGAR CAPTURA AQUÍ]`

---

## Fase 4 · Ejecución del Experimento

Se inyectó el fallo (equivalente al `kubectl apply` del manifiesto):
```
POST /api/v1/_chaos?latency_ms=1500&path=/api/v1/productos/
→ {"chaos_activo": true, "latency_ms": 1500, "path_objetivo": "/api/v1/productos/"}
```

Bajo carga concurrente, el sistema **abandonó el steady state** de inmediato:

| Métrica | Baseline | Bajo caos | ¿Steady state? |
|---|---|---|---|
| Latencia p95 | 0.047 s | **2.42 s** | ❌ VIOLADO (>200ms) |
| Disponibilidad | 100% | **100%** | ✅ (fallo de latencia, no de error) |

El endpoint pasó de ~6ms a **1.51s** por petición, confirmando la inyección. La disponibilidad se mantuvo en 100%: **ninguna alerta de error se disparó**, solo la degradación de latencia — validando la hipótesis sobre la falta de circuit breaker.

> 📷 **EVIDENCIA 4:** Panel de Grafana mostrando el **salto del p95 a ~2.4s cruzando la línea roja de 200ms** (contraste con el baseline plano). Opcional: consulta p95 en Prometheus (http://localhost:9090).

`[PEGAR CAPTURA AQUÍ]`

---

## Fase 5 · Análisis y Reporte de Trazas

En Jaeger se localizaron las trazas inyectadas: las peticiones a `GET /api/v1/productos/` bajo caos muestran una **duración de ~1.516s** (frente a los ~6ms del baseline), con la latencia concentrada en el span raíz de la petición.

```
Trazas productos bajo caos (duration en µs):
  1516652   1516143   1514193   1507576   1505968     (≈ 1.5s = latencia inyectada)
```

**Comportamiento observado y verificación del fallback:** el servicio **no activó ningún fallback ni caché de emergencia**; simplemente absorbió los 1500ms y los propagó al cliente. Esto **confirma la hipótesis**: falta un mecanismo de *circuit breaker* con *timeout local* que corte la espera. En el gráfico de Prometheus esto se refleja como una latencia sostenida en ~1.5s+ sin ninguna caída de disponibilidad — una **falla latente** que el monitoreo de caja blanca (métricas + trazas) permite detectar antes de que escale.

Al detener la inyección, el p95 **regresó al steady state** (~42ms), demostrando que el experimento fue controlado y reversible.

> 📷 **EVIDENCIA 5:** Traza en Jaeger de una petición bajo caos (~1.5s), con el detalle del span. Idealmente, comparación baseline (~6ms) vs caos (~1.5s). **Este es el "Reporte de Trazas", el entregable estrella.**

`[PEGAR CAPTURA AQUÍ]`

---

## Plantilla de experimento (resumen)

| Campo | Valor |
|---|---|
| **ID Exp** | EXP-01 |
| **Hipótesis** | Inyectando 1500ms en inventario, el p95 supera 200ms pero la disponibilidad se mantiene (falta circuit breaker). |
| **Métrica de Steady State** | Latencia p95 < 200ms; disponibilidad > 99%. |
| **Manifiesto de inyección** | `latency-injection-inventory` (NetworkChaos, 1500ms) |
| **Comportamiento observado** | p95 subió de 47ms a **2.42s**; disponibilidad se mantuvo en 100%; sin fallback. |
| **Trazas en Jaeger** | `GET /api/v1/productos/` con duración ~1.516s |
| **Resultado** | **Debilidad detectada** — ausencia de circuit breaker/timeout; latencia se propaga al usuario. |

---

## Respuesta a la pregunta detonante

> *«Si al inyectar latencia el servicio falla, ¿qué mecanismo de Circuit Breaker faltó y cómo se refleja en el gráfico de Prometheus?»*

Faltó un **circuit breaker con timeout local** en el consumidor del servicio de inventario: al no cortar la espera tras un umbral (p. ej. 500ms), los 1500ms se propagan íntegros. En el gráfico de Prometheus se refleja como una **meseta de latencia p95 en ~1.5–2.4s** que **no genera errores 5xx** (la disponibilidad sigue en 100%). Justamente por eso es una falla peligrosa: no dispara alertas basadas en errores, solo se ve en las métricas de latencia y en las trazas de Jaeger. Un circuit breaker habría "abierto" el circuito, devolviendo rápido un fallback y manteniendo el p95 bajo control.

---

## Cómo reproducir

```bash
# 1. Levantar el stack (backend + Prometheus + Grafana + Alertmanager + Jaeger)
docker compose -f observability/docker-compose.observability.yml up -d

# 2. Generar tráfico baseline sobre el objetivo
while true; do curl -s -o /dev/null http://localhost:8000/api/v1/productos/; done &

# 3. Inyectar el caos (1500ms)
curl -X POST "http://localhost:8000/api/v1/_chaos?latency_ms=1500&path=/api/v1/productos/"

# 4. Observar:
#    Grafana → http://localhost:3000  (panel de latencia p95)
#    Jaeger  → http://localhost:16686 (trazas con 1.5s)

# 5. Detener el experimento (recuperación)
curl -X POST "http://localhost:8000/api/v1/_chaos?latency_ms=0"
```

En Kubernetes con Chaos Mesh, el paso 3 se sustituye por:
`kubectl apply -f deploy/chaos/network-latency-inventory.yaml`

---

## Conclusión

El experimento validó empíricamente la resiliencia del sistema bajo latencia inyectada: se comprobó que el backend **mantiene la disponibilidad pero no la latencia** ante 1500ms de retardo, revelando de forma proactiva una **falla latente** (ausencia de circuit breaker) antes de que impacte al usuario final. La combinación de **métricas (Prometheus/Grafana)** y **trazas distribuidas (OpenTelemetry/Jaeger)** —observabilidad de caja blanca— permitió correlacionar el síntoma (p95 disparado) con su causa exacta (el span de 1.5s en inventario), que es precisamente el valor del chaos engineering: convertir la fiabilidad en un proceso de aprendizaje continuo y verificable.
