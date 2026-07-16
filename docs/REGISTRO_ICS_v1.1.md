# Registro Consolidado de Configuration Items (ICs) — v1.1

**Proyecto:** Taller Diego — Sistema de gestión para taller mecánico
**Línea base asociada:** v1.1.0 (tag Git)
**Estándar de referencia:** IEEE Std 828-2012
**Semana de origen:** S10 — Identificación de ICs (IS2-2026)

## Convención de identificación

| Prefijo | Categoría |
|---|---|
| C-xxx | Configuración (documentos y especificaciones) |
| I-xxx | Infraestructura (contenedores, orquestación, CI/CD) |
| CO-xxx | Código (backend, frontend, pruebas) |

## Inventario de ICs

| ID-IC | Categoría | Nombre | Ruta | Versión | Responsable | Criticidad | Descripción |
|---|---|---|---|---|---|---|---|
| C-001 | Configuración | Requisitos Funcionales | docs/HU.md | v1.1 | alex | Alta | Historias de usuario y especificaciones funcionales del MVP |
| C-002 | Configuración | Event Storming | docs/event_storming.md | v1.0 | alex | Media | Análisis de eventos del dominio y flujos de negocio |
| C-003 | Configuración | Context Map | docs/context_map.md | v1.0 | alex | Media | Mapeo de contextos y límites en DDD |
| C-004 | Configuración | Decisión Arquitectónica - Venta | docs/adr_aggregate_root_venta.md | v1.0 | alex | Media | ADR: Decisión de usar Aggregate Root en Venta |
| C-005 | Configuración | Decisión Arquitectónica - Refactorización | docs/adr_refactorizacion.md | v1.0 | alex | Media | ADR: Refactorización a arquitectura hexagonal |
| C-006 | Configuración | Decisión Arquitectónica - Hexagonal Venta | docs/adr_refactorizacion_hexagonal_venta.md | v1.0 | alex | Media | ADR: Implementación hexagonal en módulo Venta |
| C-007 | Configuración | Plan de Pruebas | Test_Plan_v1.md | v1.0 | alex | Media | Estrategia y cobertura de pruebas del MVP |
| C-008 | Configuración | Archivo de Requisitos | requirements.txt | v1.1 | alex | Alta | Dependencias de Python y librerías del backend |
| I-009 | Infraestructura | Dockerfile Principal | Dockerfile | v1.0 | alex | Alta | Imagen Docker para containerización del backend |
| I-010 | Infraestructura | Docker Compose | docker-compose.yml | v1.1 | alex | Alta | Orquestación de servicios (backend, DB, nginx) |
| I-011 | Infraestructura | Configuración Nginx | nginx-optimization.conf | v1.0 | alex | Alta | Proxy inverso y optimización de servidor web |
| I-012 | Infraestructura | GitHub Actions - CI/CD | .github/workflows/*.yml | v1.0 | alex | Alta | Pipeline de integración y despliegue continuo |
| I-013 | Infraestructura | Script de Inicialización BD | backend/database.py | v1.1 | alex | Alta | Script para crear y preparar base de datos |
| I-014 | Infraestructura | Seed de Datos | backend/seed_servicios.py | v1.0 | alex | Media | Script para cargar datos iniciales en la BD |
| CO-015 | Código | Aplicación Principal | backend/main.py | v1.1 | alex | Alta | Punto de entrada de la aplicación FastAPI |
| CO-016 | Código | Configuración del Core | backend/core/ | v1.1 | alex | Alta | Config, auth, cache y value objects |
| CO-017 | Código | Modelos de Base de Datos | backend/db/models/ | v1.1 | alex | Alta | ORM con SQLAlchemy: Venta, Producto, Empleado, etc. |
| CO-018 | Código | Schemas Pydantic | backend/schemas/ | v1.1 | alex | Alta | Validación de datos de entrada/salida |
| CO-019 | Código | Servicios de Negocio | backend/services/ | v1.1 | alex | Alta | Lógica de negocio: VentaService, ProductoService, etc. |
| CO-020 | Código | Repositorios | backend/repositories/ | v1.1 | alex | Alta | Capa de acceso a datos y patrón Repository |
| CO-021 | Código | Dominio Puro (DDD) | backend/domain/ | v1.1 | alex | Media | Lógica de negocio independiente de frameworks |
| CO-022 | Código | Arquitectura Hexagonal | backend/hexagonal/ | v1.0 | alex | Media | Implementación de puertos y adaptadores |
| CO-023 | Código | Rutas API v1 | backend/api/v1/routes/ | v1.1 | alex | Alta | Endpoints REST de la API |
| CO-024 | Código | Suite de Pruebas | tests/ | v1.1 | alex | Media | Pruebas unitarias e integración |
| CO-025 | Código | HTML Principal | frontend/views/index.html | v1.1 | alex | Media | Página de inicio del sistema |
| CO-026 | Código | Hojas de Estilo | frontend/styles/css/ | v1.1 | alex | Media | CSS y TailwindCSS del frontend |
| CO-027 | Código | Scripts JavaScript | frontend/scripts/ | v1.1 | alex | Media | Lógica del cliente y gestión de datos |
| CO-028 | Código | Service Worker | frontend/service-worker.js | v1.0 | alex | Baja | Caché y soporte offline (PWA) |

## Criterios de criticidad

| Criticidad | Candidatos | Criterio |
|---|---|---|
| Alta | ICs cuya falla detiene el servicio o compromete datos | Requieren control de cambios estricto (PR + revisión + CI verde) |
| Media | ICs de soporte, documentación viva y módulos no críticos | Control de cambios estándar por PR |
| Baja | ICs opcionales o de mejora progresiva | Cambios de bajo riesgo |

## ICs incorporados en Unidad 2 (actualización post-S15)

| ID-IC | Categoría | Nombre | Ruta | Versión | Criticidad | Descripción |
|---|---|---|---|---|---|---|
| I-029 | Infraestructura | Manifiesto ArgoCD | deploy/argocd/application.yaml | v1.2 | Alta | Estado declarativo del despliegue GitOps (selfHeal + prune) |
| I-030 | Infraestructura | Manifiesto K8s Backend | deploy/k8s/deployment.yaml | v1.2 | Alta | Deployment + Service del backend (imagen inmutable por tag) |
| I-031 | Infraestructura | Manifiesto Chaos Mesh | deploy/chaos/network-latency-inventory.yaml | v1.0 | Media | Experimento NetworkChaos de inyección de latencia |
| I-032 | Infraestructura | Stack de Observabilidad | observability/ | v1.0 | Alta | Prometheus, Grafana, Alertmanager, Jaeger (docker-compose) |
| I-033 | Infraestructura | Reglas SLO | observability/prometheus/rules/slo_rules.yml | v1.0 | Alta | Recording rules de SLIs, error budget y alertas de burn rate |
| I-034 | Infraestructura | Lockfile de dependencias | requirements.lock.txt | v1.0 | Alta | Árbol completo de dependencias fijadas (pip freeze) |
| CO-035 | Código | Telemetría OTel | backend/telemetry.py | v1.0 | Media | Instrumentación OpenTelemetry → Jaeger (OTLP/gRPC) |
| CO-036 | Código | Arnés de Caos | backend/chaos.py | v1.0 | Media | Inyección controlada de latencia a nivel de aplicación |
| C-037 | Configuración | Script de Auditoría PCA | audit_pca.sh | v1.0 | Alta | Auditoría física de paridad contra la línea base |
