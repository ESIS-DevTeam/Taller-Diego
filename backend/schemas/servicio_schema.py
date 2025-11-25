"""Esquemas Pydantic para Servicio.

Define modelos de validación y serialización para operaciones de servicio.
"""

from pydantic import BaseModel
from pydantic import ConfigDict


class ServicioBase(BaseModel):
    """Datos comunes de un servicio.

    :ivar nombre: Nombre único del servicio.
    :ivar descripcion: Descripción detallada del servicio.
    """

    nombre: str
    descripcion: str


class ServicioCreate(ServicioBase):
    """Payload de creación/actualización de servicio.

    Hereda todos los campos de ServicioBase.
    """

    pass


class ServicioResponse(ServicioBase):
    """Modelo de respuesta para servicio.

    Incluye identificador único.

    :ivar id: Identificador único del servicio.
    """

    id: int

    model_config = ConfigDict(from_attributes=True)