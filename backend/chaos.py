"""
Arnés de Chaos Engineering a nivel de aplicación (Semana 15).

Sustituye a Chaos Mesh (que requiere Kubernetes) para poder EJECUTAR el
experimento de inyección de latencia en un entorno Docker: añade un retardo
controlado a las peticiones cuyo path coincide con el objetivo, emulando el
NetworkChaos `delay` de 1500ms del manifiesto deploy/chaos/network-latency.yaml.

Está DESACTIVADO por defecto. Solo se activa si CHAOS_ENABLED=1 (lo pone el
docker-compose del experimento), de modo que el código de producción queda
limpio. El experimento se controla en caliente con:

    POST /api/v1/_chaos?latency_ms=1500&path=/api/v1/productos/   → activar
    POST /api/v1/_chaos?latency_ms=0                              → desactivar
    GET  /api/v1/_chaos                                           → estado actual
"""
import asyncio
import os

from fastapi import Request
from fastapi.responses import JSONResponse

# Estado del experimento en memoria (se controla vía el endpoint).
_state = {
    "latency_ms": 0,          # retardo a inyectar
    "path": "/api/v1/productos/",  # objetivo (blast radius acotado)
}


def chaos_enabled() -> bool:
    return os.getenv("CHAOS_ENABLED", "0") == "1"


def register_chaos(app):
    """Registra el middleware de latencia y el endpoint de control.

    No hace nada si CHAOS_ENABLED != 1 (producción queda intacta).
    """
    if not chaos_enabled():
        return False

    @app.middleware("http")
    async def _chaos_latency(request: Request, call_next):
        latency = _state["latency_ms"]
        target = _state["path"]
        # Inyecta el retardo solo al objetivo del experimento (blast radius).
        # asyncio.sleep NO bloquea el event loop: retarda solo esta petición.
        if latency > 0 and request.url.path.startswith(target):
            await asyncio.sleep(latency / 1000.0)
        return await call_next(request)

    @app.post("/api/v1/_chaos", include_in_schema=False)
    async def _set_chaos(latency_ms: int = 0, path: str = "/api/v1/productos/"):
        _state["latency_ms"] = max(0, latency_ms)
        _state["path"] = path
        activo = _state["latency_ms"] > 0
        return JSONResponse({
            "chaos_activo": activo,
            "latency_ms": _state["latency_ms"],
            "path_objetivo": _state["path"],
        })

    @app.get("/api/v1/_chaos", include_in_schema=False)
    async def _get_chaos():
        return JSONResponse({
            "chaos_activo": _state["latency_ms"] > 0,
            "latency_ms": _state["latency_ms"],
            "path_objetivo": _state["path"],
        })

    return True
