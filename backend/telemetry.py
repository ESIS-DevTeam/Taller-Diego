"""
Telemetría distribuida con OpenTelemetry (Semana 15 · Chaos Engineering).

Instrumenta el backend para emitir *trazas* (spans) que se exportan a Jaeger
vía OTLP/gRPC. Cada petición HTTP genera un span raíz y las consultas a la
base de datos (SQLAlchemy) generan spans hijos, dando trazabilidad completa
del flujo — indispensable para ver, bajo el experimento de caos, DÓNDE se
acumula la latencia inyectada.

Se activa solo si la variable OTEL_EXPORTER_OTLP_ENDPOINT está definida
(la pone el docker-compose). En local sin Jaeger, el backend arranca igual.
"""
import os

from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor


def setup_telemetry(app):
    """Configura el proveedor de trazas y auto-instrumenta FastAPI + SQLAlchemy."""
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if not endpoint:
        # Sin colector configurado (ej. corriendo local sin Jaeger): no instrumentar.
        return False

    service_name = os.getenv("OTEL_SERVICE_NAME", "taller-diego-backend")

    # Recurso: identifica el servicio en Jaeger
    resource = Resource.create({
        "service.name": service_name,
        "service.namespace": "taller-diego",
    })

    provider = TracerProvider(resource=resource)
    # Exportador OTLP/gRPC hacia Jaeger (Jaeger acepta OTLP nativo en :4317)
    exporter = OTLPSpanExporter(endpoint=endpoint, insecure=True)
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    # Auto-instrumentación: spans automáticos de peticiones HTTP y del ORM.
    # La instrumentación de FastAPI propaga el contexto de traza por las
    # cabeceras (traceparent), asegurando trazabilidad distribuida.
    FastAPIInstrumentor.instrument_app(app)
    try:
        from db.base import engine
        SQLAlchemyInstrumentor().instrument(engine=engine)
    except Exception:
        # Si la BD no está disponible al arrancar, seguimos con trazas HTTP.
        pass

    return True
