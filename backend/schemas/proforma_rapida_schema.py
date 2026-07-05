from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ProformaProductoItem(BaseModel):
    producto_id: int | None = None
    nombre: str
    cantidad: int = Field(default=1, ge=1)
    precioVenta: float | None = None
    subtotal: float | None = None


class ProformaRapidaCreate(BaseModel):
    placa: str
    cliente_nombre: str
    celular: str
    diagnostico: str
    precio_estimado: str | None = None
    servicio_sugerido: str | None = None
    modelo_vehiculo: str | None = None
    productos: list[ProformaProductoItem] = Field(default_factory=list)

    @field_validator("placa")
    @classmethod
    def normalize_placa(cls, value: str) -> str:
        value = (value or "").strip().upper()
        if not value:
            raise ValueError("La placa es obligatoria")
        return value

    @field_validator("cliente_nombre", "celular", "diagnostico")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise ValueError("Este campo es obligatorio")
        return value

    @field_validator("precio_estimado", "servicio_sugerido", "modelo_vehiculo")
    @classmethod
    def optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ProformaRapidaEstadoUpdate(BaseModel):
    estado: str

    @field_validator("estado")
    @classmethod
    def validate_estado(cls, value: str) -> str:
        value = (value or "").strip().lower()
        estados_validos = {"pendiente", "revisado", "entregado", "cancelado"}
        if value not in estados_validos:
            raise ValueError("Estado no valido")
        return value


class ProformaRapidaResponse(BaseModel):
    id: int
    codigo: str
    placa: str
    cliente_nombre: str
    celular: str
    diagnostico: str
    precio_estimado: str | None = None
    servicio_sugerido: str | None = None
    modelo_vehiculo: str | None = None
    productos: list[dict[str, Any]] = Field(default_factory=list)
    estado: str
    taller_nombre: str
    taller_direccion: str | None = None
    taller_correo: str | None = None
    taller_web: str | None = None
    fecha_creacion: datetime
    fecha_pendiente: datetime
    fecha_revisado: datetime | None = None
