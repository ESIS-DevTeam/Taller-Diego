"""Esquemas Pydantic para Orden.

Define modelos de validación y serialización para operaciones de orden.
"""

from pydantic import BaseModel
from datetime import date
from schemas.servicio_schema import ServicioResponse
from schemas.empleado_schema import EmpleadoResponse


class OrdenBase(BaseModel):
    """Datos comunes de una orden.

    :ivar garantia: Período de garantía en días.
    :ivar estadoPago: Estado del pago.
    :ivar precio: Precio total de la orden.
    :ivar fecha: Fecha de la orden.
    """

    garantia: int
    estadoPago: str
    precio: int
    fecha: date


class OrdenServicioBase(BaseModel):
    """Datos de un servicio en una orden.

    :ivar servicio_id: Identificador del servicio.
    :ivar precio_servicio: Precio del servicio en la orden.
    """

    servicio_id: int
    precio_servicio: int


class OrdenServicioResponse(OrdenServicioBase):
    """Respuesta de servicio en orden con detalles.

    :ivar servicio: Detalles del servicio.
    """

    servicio: ServicioResponse | None = None
    
    class Config:
        from_attributes = True


class OrdenEmpleadoBase(BaseModel):
    """Datos de un empleado asignado a una orden.

    :ivar empleado_id: Identificador del empleado.
    """

    empleado_id: int


class OrdenEmpleadoResponse(OrdenEmpleadoBase):
    """Respuesta de empleado en orden con detalles.

    :ivar empleado: Detalles del empleado.
    """

    empleado: EmpleadoResponse | None = None
    
    class Config:
        from_attributes = True


class OrdenCreate(OrdenBase):
    """Payload de creación de orden.

    :ivar servicios: Lista de servicios a incluir.
    :ivar empleados: Lista de empleados a asignar.
    """

    servicios: list[OrdenServicioBase] | None = []
    empleados: list[OrdenEmpleadoBase] | None = []


class OrdenResponse(OrdenBase):
    """Modelo de respuesta para orden.

    :ivar id: Identificador único de la orden.
    :ivar servicios: Servicios incluidos en la orden.
    :ivar empleados: Empleados asignados a la orden.
    """

    id: int
    servicios: list[OrdenServicioResponse] | None = None
    empleados: list[OrdenEmpleadoResponse] | None = None

    class Config:
        from_attributes = True