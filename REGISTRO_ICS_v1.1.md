# 📋 Registro Consolidado de Items de Configuración (ICs)
## MVP v1.1 - Taller Diego

**Fecha de Auditoría**: 11 de Junio de 2026  
**Versión del Registro**: 1.1.0  
**Equipo**: Taller Diego  
**Profesor**: [Tu Profesor]  

---

## 📊 Resumen Ejecutivo

- **Total de ICs identificados**: 24
- **ICs Configuración**: 8
- **ICs Infraestructura**: 6
- **ICs Código**: 10
- **Estado del repositorio**: Operativo
- **Baseline declarada**: v1.1.0

---

## 📋 CATEGORÍA 1: CONFIGURACIÓN (8 ICs)

| ID-IC | Nombre | Ruta | Versión | Responsable | Criticidad | Descripción |
|-------|--------|------|---------|-------------|------------|-------------|
| **C-001** | Requisitos Funcionales | docs/HU.md | v1.1 | Diego | **Alta** | Historias de usuario y especificaciones funcionales del MVP |
| **C-002** | Event Storming | docs/event_storming.md | v1.0 | Diego | **Media** | Análisis de eventos del dominio y flujos de negocio |
| **C-003** | Context Map | docs/context_map.md | v1.0 | Diego | **Media** | Mapeo de contextos y límites en DDD |
| **C-004** | Decisión Arquitectónica - Venta | docs/adr_aggregate_root_venta.md | v1.0 | Diego | **Media** | ADR: Decisión de usar Aggregate Root en Venta |
| **C-005** | Decisión Arquitectónica - Refactorización | docs/adr_refactorizacion.md | v1.0 | Diego | **Media** | ADR: Refactorización a arquitectura hexagonal |
| **C-006** | Decisión Arquitectónica - Hexagonal Venta | docs/adr_refactorizacion_hexagonal_venta.md | v1.0 | Diego | **Media** | ADR: Implementación hexagonal en módulo Venta |
| **C-007** | Plan de Pruebas | Test_Plan_v1.md | v1.0 | Diego | **Media** | Estrategia y cobertura de pruebas del MVP |
| **C-008** | Archivo de Requisitos (requirements.txt) | requirements.txt | v1.1 | Diego | **Alta** | Dependencias de Python y librerías del backend |

---

## 🏗️ CATEGORÍA 2: INFRAESTRUCTURA (6 ICs)

| ID-IC | Nombre | Ruta | Versión | Responsable | Criticidad | Descripción |
|-------|--------|------|---------|-------------|------------|-------------|
| **I-001** | Dockerfile Principal | backend/Dockerfile | v1.0 | Diego | **Alta** | Imagen Docker para containerización del backend |
| **I-002** | Docker Compose | docker-compose.yml | v1.1 | Diego | **Alta** | Orquestación de servicios (backend, DB, nginx) |
| **I-003** | Configuración Nginx | nginx-optimization.conf | v1.0 | Diego | **Alta** | Proxy inverso y optimización de servidor web |
| **I-004** | GitHub Actions - CI/CD | .github/workflows/*.yml | v1.0 | Diego | **Alta** | Pipeline de integración y despliegue continuo |
| **I-005** | Script de Inicialización BD | backend/database.py | v1.1 | Diego | **Alta** | Script para crear y preparar base de datos |
| **I-006** | Seed de Datos | backend/seed_servicios.py | v1.0 | Diego | **Media** | Script para cargar datos iniciales en la BD |

---

## 💻 CATEGORÍA 3: CÓDIGO (10 ICs)

| ID-IC | Nombre | Ruta | Versión | Responsable | Criticidad | Descripción |
|-------|--------|------|---------|-------------|------------|-------------|
| **CO-001** | Aplicación Principal | backend/main.py | v1.1 | Diego | **Alta** | Punto de entrada de la aplicación FastAPI |
| **CO-002** | Configuración del Core | backend/core/ | v1.1 | Diego | **Alta** | Config, auth, cache y value objects |
| **CO-003** | Modelos de Base de Datos | backend/db/models/ | v1.1 | Diego | **Alta** | ORM con SQLAlchemy: Venta, Producto, Empleado, etc. |
| **CO-004** | Schemas Pydantic | backend/schemas/ | v1.1 | Diego | **Alta** | Validación de datos de entrada/salida |
| **CO-005** | Servicios de Negocio | backend/services/ | v1.1 | Diego | **Alta** | Lógica de negocio: VentaService, ProductoService, etc. |
| **CO-006** | Repositorios (Data Access) | backend/repositories/ | v1.1 | Diego | **Alta** | Capa de acceso a datos y patrón Repository |
| **CO-007** | Dominio Puro (DDD) | backend/domain/ | v1.1 | Diego | **Media** | Lógica de negocio independiente de frameworks |
| **CO-008** | Arquitectura Hexagonal | backend/hexagonal/ | v1.0 | Diego | **Media** | Implementación de puertos y adaptadores |
| **CO-009** | Rutas API v1 | backend/api/v1/routes/ | v1.1 | Diego | **Alta** | Endpoints REST de la API |
| **CO-010** | Suite de Pruebas | tests/ | v1.1 | Diego | **Media** | Pruebas unitarias e integración |

---

## 🎨 CATEGORÍA 4: FRONTEND (4 ICs) *Adicional*

| ID-IC | Nombre | Ruta | Versión | Responsable | Criticidad | Descripción |
|-------|--------|------|---------|-------------|------------|-------------|
| **F-001** | HTML Principal | frontend/views/index.html | v1.1 | Diego | **Media** | Página de inicio del sistema |
| **F-002** | Hojas de Estilo | frontend/styles/css/ | v1.1 | Diego | **Media** | CSS y TailwindCSS del frontend |
| **F-003** | Scripts JavaScript | frontend/scripts/ | v1.1 | Diego | **Media** | Lógica del cliente y gestión de datos |
| **F-004** | Service Worker | frontend/service-worker.js | v1.0 | Diego | **Baja** | Caché y soporte offline (PWA) |

---

## 📊 Matriz de Criticidad

| Criticidad | Cantidad | Justificación | Ejemplos |
|-----------|----------|----------------|---------|
| **Alta** | 13 | Pérdida < 30 min bloquea despliegue | main.py, Dockerfile, schemas, services, BD models |
| **Media** | 10 | Pérdida 30 min - 4 horas detiene flujo | ADRs, scripts seed, domain, frontend assets |
| **Baja** | 1 | Pérdida > 4 horas (impacto menor) | Service Worker, documentación secundaria |

---

## 🔄 Ciclo de Vida de ICs

### Creación
- ICs de **Código** creados inicialmente durante Sprint 1
- ICs de **Configuración** establecidos durante Setup inicial
- ICs de **Infraestructura** configurados en Sprint 2

### Gestión Actual
- **Control de Versiones**: Git + GitHub
- **Rama Principal**: `main` (protegida)
- **Política**: Todos los cambios requieren Pull Request y Code Review

### Actualización
- **Código**: Actualizado en cada Sprint según necesidad
- **Infraestructura**: Versionado en Docker Compose y scripts
- **Configuración**: Documentado en `docs/`

---

## ✅ Checklist de Auditoría

- [x] Se identificaron ICs explícitamente en las 4 categorías (Configuración, Infraestructura, Código, Frontend)
- [x] Cada IC tiene ID único e irrepetible
- [x] Se asignó criticidad basada en impacto de tiempo (30 min / 4 horas)
- [x] Se identificaron ICs críticos para compilación/despliegue (Alta)
- [x] Se documentó justificación de no-ICs (ej: Service Worker es Baja por ser PWA opcional)
- [x] Cada IC tiene responsable nominal único
- [x] Se definió ruta física exacta para cada elemento
- [x] Se incluyó versión actual del IC

---

## 📝 Notas de Auditoría

1. **main.py** se clasificó como **Alta** porque sin este archivo el backend no inicia.
2. **Service Worker** se clasificó como **Baja** porque el sistema funciona sin él (es feature de PWA, no obligatorio).
3. Los **ADRs** están catalogados como **Media** porque no bloquean el despliegue inmediato, pero son críticos para entender decisiones de arquitectura.
4. Las **Historias de Usuario** son **Alta** porque documentan requisitos; sin ellas se pierden especificaciones funcionales.
5. **requirements.txt** es **Alta** porque sin dependencias correctas, la aplicación no ejecuta.

---

## 🔒 Elementos NO incluidos como IC (Justificación)

| Elemento | Ubicación | Razón |
|----------|-----------|-------|
| Cache de pytest | `.pytest_cache/` | Generado automáticamente, no es código fuente |
| Archivos compilados | `__pycache__/` | Regenerados en cada ejecución |
| Virtual Environment | `venv/` | Local del desarrollador, no se versionea |
| Build artifacts | `.coverage` | Salida de herramientas de testing |
| VSCode settings | `.vscode/` | Preferencias personales del IDE |

---

## 📅 Historial de Cambios

| Versión | Fecha | Cambios | Responsable |
|---------|-------|---------|-------------|
| 1.0 | 10/06/2026 | Creación inicial del registro | Diego |
| 1.1 | 11/06/2026 | Adición de Frontend y refinamiento | Diego |

---

**Documento auditado y validado en: 11 de Junio de 2026**

