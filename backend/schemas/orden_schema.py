from pydantic import BaseModel
from datetime import datetime
from schemas.servicio_schema import ServicioResponse

class OrdenBase(BaseModel):
    garantia: int
    estadoPago: str
    precio: int
    fecha: datetime.date

class OrdenServicioBase(BaseModel):
    servicio_id: int
    precioServicio: int

class OrdenServicioResponse(OrdenServicioBase):
    servicio: ServicioResponse | None = None
    class Config:
        from_attributes = True

class OrdenCreate(OrdenBase):
    servicios: list[OrdenServicioBase] | None = []

class OrdenResponse(OrdenBase):
    id: int
    servicios: list[OrdenServicioResponse] | None = None

    class Config:
        from_attributes = True