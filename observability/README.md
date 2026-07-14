# Observabilidad SRE — Taller de Diego (Semana 14)

Stack de fiabilidad: el backend expone métricas, **Prometheus** las recolecta,
**Grafana** dibuja los SLIs/SLOs y el error budget, y **Alertmanager** dispara
la alerta de burn rate.

## Cómo levantarlo

```bash
docker compose -f observability/docker-compose.observability.yml up -d
```

| Servicio | URL | Notas |
|---|---|---|
| Backend `/metrics` | http://localhost:8000/metrics | métricas Prometheus |
| Prometheus | http://localhost:9090 | consultas PromQL y estado de targets |
| Grafana | http://localhost:3000 | usuario `admin` / `admin` → dashboard "Taller de Diego · SRE" |
| Alertmanager | http://localhost:9093 | alertas activas |

Generar tráfico para poblar los paneles:

```bash
bash observability/generar-trafico.sh            # tráfico OK
bash observability/generar-trafico.sh errores    # inyecta errores para ver caer el SLO
```

## SLIs y SLOs acordados

| SLI | Consulta (recording rule) | SLO |
|---|---|---|
| Availability | `sli:availability:ratio_5m` | ≥ 99.0% |
| Latency p99 | `sli:latency_p99:seconds_5m` | < 1 s |
| Error budget consumido | `slo:error_budget_consumed:ratio` | < 100% |
| Burn rate | `slo:burn_rate:ratio_5m` | alerta > 14.4x |

Las reglas están en `prometheus/rules/slo_rules.yml` y los paneles en
`grafana/provisioning/dashboards/taller-sre.json`.

## Sin Docker

Si no tienes Docker, puedes ver la Fase 1 corriendo solo el backend y abriendo
`/metrics` en el navegador:

```bash
cd backend && uvicorn main:app --port 8000
# luego: http://localhost:8000/metrics
```

Prometheus/Grafana/Alertmanager sí requieren el stack (Docker o binarios locales).
