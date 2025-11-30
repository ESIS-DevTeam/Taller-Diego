"""Esquemas Pydantic para Orden.

Define los modelos de validación y serialización para operaciones de Orden.
"""

from pydantic import BaseModel
from datetime import date
from schemas.servicio_schema import ServicioResponse
from schemas.empleado_schema import EmpleadoResponse

class OrdenBase(BaseModel):
    """Esquema base para Orden.

    :ivar garantia: Período de garantía en meses.
    :ivar estadoPago: Estado del pago.
    :ivar precio: Precio total de la orden.
    :ivar fecha: Fecha de la orden.
    """

    garantia: int
    estadoPago: str
    precio: int
    fecha: date


class OrdenServicioBase(BaseModel):
    """Esquema base para OrdenServicio.

    :ivar servicio_id: Identificador del servicio.
    :ivar precio_servicio: Precio del servicio en la orden.
    """

    servicio_id: int
    precio_servicio: int

class OrdenServicioResponse(OrdenServicioBase):
    """Esquema de respuesta para OrdenServicio.

    Extiende OrdenServicioBase con datos de respuesta.

    :ivar servicio: Datos del servicio asociado.
    """

    servicio: ServicioResponse | None = None
    class Config:
        from_attributes = True


class OrdenEmpleadoBase(BaseModel):
    """Esquema base para OrdenEmpleado.

    :ivar empleado_id: Identificador del empleado.
    """

    empleado_id: int

class OrdenEmpleadoResponse(OrdenEmpleadoBase):
    """Esquema de respuesta para OrdenEmpleado.

    Extiende OrdenEmpleadoBase con datos de respuesta.

    :ivar empleado: Datos del empleado asociado.
    """

    empleado: EmpleadoResponse | None = None
    class Config:
        from_attributes = True


class OrdenCreate(OrdenBase):
    """Esquema de creación para Orden.

    Extiende OrdenBase con listas de servicios y empleados.

    :ivar servicios: Lista de servicios a incluir en la orden.
    :ivar empleados: Lista de empleados a asignar a la orden.
    """

    servicios: list[OrdenServicioBase] | None = []
    empleados: list[OrdenEmpleadoBase] | None = []

class OrdenResponse(OrdenBase):
    """Esquema de respuesta para Orden.

    Extiende OrdenBase con identificador y datos de servicios y empleados.

    :ivar id: Identificador de la orden.
    :ivar servicios: Lista de servicios de la orden con detalles.
    :ivar empleados: Lista de empleados asignados con detalles.
    """

    id: int
    servicios: list[OrdenServicioResponse] | None = None
    empleados: list[OrdenEmpleadoResponse] | None = None

    class Config:
        from_attributes = True