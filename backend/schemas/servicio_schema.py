"""Esquemas Pydantic para Servicio.

Define los modelos de validación y serialización para operaciones de Servicio.
"""

from pydantic import BaseModel
from pydantic import ConfigDict

class ServicioBase(BaseModel):
    """Esquema base para Servicio.

    :ivar nombre: Nombre del servicio.
    :ivar descripcion: Descripción del servicio.
    """

    nombre: str
    descripcion: str


class ServicioCreate(ServicioBase):
    """Esquema de creación para Servicio.

    Extiende ServicioBase para operaciones de creación.
    """

    pass


class ServicioResponse(ServicioBase):
    """Esquema de respuesta para Servicio.

    Extiende ServicioBase con identificador.

    :ivar id: Identificador del servicio.
    """

    id: int

    model_config = ConfigDict(from_attributes=True)