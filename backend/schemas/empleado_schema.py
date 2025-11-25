"""Esquemas Pydantic para Empleado.

Define modelos de validación y serialización para operaciones de empleado.
"""

from pydantic import BaseModel
from pydantic import ConfigDict


class EmpleadoBase(BaseModel):
    """Datos comunes de un empleado.

    :ivar nombres: Nombre del empleado.
    :ivar apellidos: Apellido del empleado.
    :ivar estado: Estado laboral (activo/inactivo).
    :ivar especialidad: Especialidad técnica del empleado.
    """

    nombres: str
    apellidos: str
    estado: str
    especialidad: str


class EmpleadoCreate(EmpleadoBase):
    """Payload de creación/actualización de empleado."""

    pass


class EmpleadoResponse(EmpleadoBase):
    """Modelo de respuesta para empleado.

    :ivar id: Identificador único del empleado.
    """

    id: int

    model_config = ConfigDict(from_attributes=True)