from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import Response
from api.v1.routes import producto_routes, venta_routes, autoparte_routes, orden_routes, servicio_routes, empleado_routes, status_routes
import time

app = FastAPI()

# Middleware de compresión gzip (reduce tamaño de respuestas)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    
    # Agregar headers de caché para endpoints de API
    if request.url.path.startswith("/api/v1/"):
        # Caché de 5 minutos para datos que no cambian frecuentemente
        response.headers["Cache-Control"] = "public, max-age=300"
    
    return response

app.include_router(status_routes.router,
                   prefix="/api/v1/status", tags=["Status"])
app.include_router(producto_routes.router,
                   prefix="/api/v1/productos", tags=["Productos"])
app.include_router(autoparte_routes.router,
                   prefix="/api/v1/autopartes", tags=["Autopartes"])
app.include_router(venta_routes.router,
                   prefix="/api/v1/ventas", tags=["Ventas"])
app.include_router(orden_routes.router,
                   prefix="/api/v1/ordenes", tags=["Ordenes"])
app.include_router(servicio_routes.router,
                   prefix="/api/v1/servicios", tags=["Servicios"])
app.include_router(empleado_routes.router,
                   prefix="/api/v1/empleados", tags=["Empleados"])

@app.get("/")
def read_root():
    return {"Hello": "World"}