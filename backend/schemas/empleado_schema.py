"""Esquemas Pydantic para Empleado.

Define los modelos de validación y serialización para operaciones de Empleado.
"""

from pydantic import BaseModel
from pydantic import ConfigDict

class EmpleadoBase(BaseModel):
    """Esquema base para Empleado.

    :ivar nombres: Nombre del empleado.
    :ivar apellidos: Apellido del empleado.
    :ivar estado: Estado del empleado.
    :ivar especialidad: Especialidad del empleado.
    """

    nombres: str
    apellidos: str
    estado: str
    especialidad: str

class EmpleadoCreate(EmpleadoBase):
    """Esquema de creación para Empleado.

    Extiende EmpleadoBase para operaciones de creación.
    """

    pass

class EmpleadoResponse(EmpleadoBase):
    """Esquema de respuesta para Empleado.

    Extiende EmpleadoBase con identificador.

    :ivar id: Identificador del empleado.
    """

    id: int

    model_config = ConfigDict(from_attributes=True)