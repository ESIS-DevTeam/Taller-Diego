from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import Response, HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html
from api.v1.routes import producto_routes, autoparte_routes, orden_routes, servicio_routes, empleado_routes, status_routes, auth_routes, orden_trabajo_routes, caja_routes
from hexagonal.venta.adapters.primary.venta_api_adapter import router as venta_hex_router
from prometheus_fastapi_instrumentator import Instrumentator, metrics
from telemetry import setup_telemetry
from chaos import register_chaos
import time

app = FastAPI(
    title="Taller Diego API",
    description="Sistema de gestión para taller mecánico",
    version="1.0.0",
    docs_url=None,
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ========================================
# CHAOS ENGINEERING (Semana 15) — inyección de latencia controlada.
# Se registra PRIMERO para que quede como el middleware más interno:
# así el retardo inyectado queda DENTRO de la medición de Prometheus y
# del span de OpenTelemetry (de lo contrario el 1500ms no se mediría).
# Desactivado salvo que CHAOS_ENABLED=1 (solo en el experimento).
# ========================================
register_chaos(app)

# ========================================
# OBSERVABILIDAD SRE (Semana 14)
# Expone métricas en /metrics para Prometheus:
#   - http_requests_total{status=...}        → SLI de Availability
#   - http_request_duration_seconds_bucket   → SLI de Latency p99
# El scraping se define en observability/prometheus/prometheus.yml
# ========================================
instrumentator = Instrumentator(
    should_group_status_codes=True,      # agrupa en 2xx/4xx/5xx (compatible con status!~"5..")
    excluded_handlers=["/metrics"],      # no medir el propio endpoint de métricas
)
instrumentator.add(metrics.requests())   # contador http_requests_total
instrumentator.add(metrics.latency(      # histograma http_request_duration_seconds
    buckets=(0.05, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 10)
))
instrumentator.instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# ========================================
# TRAZAS DISTRIBUIDAS (Semana 15) — OpenTelemetry → Jaeger
# Emite spans de cada petición y consulta a BD. Se activa si
# OTEL_EXPORTER_OTLP_ENDPOINT está definido (docker-compose).
# ========================================
setup_telemetry(app)

# Middleware de compresión gzip (reduce tamaño de respuestas)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middleware de CORS
# En desarrollo el frontend corre en localhost con puerto variable
# (Live Server usa 5500/5501, etc.), por eso se permite por regex.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.1.100:8080"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para agregar headers de caché y performance
@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Agregar header de tiempo de procesamiento
    response.headers["X-Process-Time"] = str(process_time)
    
    # Los datos de la API son autenticados y cambian a cada rato (stock,
    # estados de órdenes, caja). Cachearlos hacía que el navegador mostrara
    # valores viejos (p. ej. stock desactualizado en venta de productos).
    # Por eso se fuerza "no-store": siempre datos frescos del servidor.
    if request.url.path.startswith("/api/v1/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response

app.include_router(status_routes.router,
                   prefix="/api/v1/status", tags=["Status"])
app.include_router(auth_routes.router,
                   prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(producto_routes.router,
                   prefix="/api/v1/productos", tags=["Productos"])
app.include_router(autoparte_routes.router,
                   prefix="/api/v1/autopartes", tags=["Autopartes"])
app.include_router(venta_hex_router,
                   prefix="/api/v1/ventas", tags=["Ventas"])
app.include_router(orden_routes.router,
                   prefix="/api/v1/ordenes", tags=["Ordenes"])
app.include_router(servicio_routes.router,
                   prefix="/api/v1/servicios", tags=["Servicios"])
app.include_router(orden_trabajo_routes.router,
                   prefix="/api/v1/ordenes-trabajo", tags=["Órdenes de Trabajo"])
app.include_router(caja_routes.router,
                   prefix="/api/v1/caja", tags=["Caja"])
app.include_router(empleado_routes.router,
                   prefix="/api/v1/empleados", tags=["Empleados"])

# Documentación personalizada con colores oscuros
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Documentación",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_ui_parameters={
            "syntaxHighlight.theme": "monokai",
            "defaultModelsExpandDepth": -1,
            "displayRequestDuration": True,
        },
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
    )

@app.get("/")
def read_root():
    return {"Hello": "World"}