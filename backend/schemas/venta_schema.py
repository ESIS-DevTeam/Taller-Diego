"""Esquemas Pydantic para Venta.

Define modelos de validación y serialización para operaciones de venta.
"""

from pydantic import BaseModel
from datetime import datetime
from schemas.producto_schema import ProductoResponse


class VentaBase(BaseModel):
    """Datos comunes de una venta.

    :ivar fecha: Fecha y hora de la venta.
    """

    fecha: datetime


class VentaProductoBase(BaseModel):
    """Datos de un producto en una venta.

    :ivar producto_id: Identificador del producto.
    :ivar cantidad: Cantidad vendida del producto.
    """

    producto_id: int
    cantidad: int


class VentaProductoResponse(VentaProductoBase):
    """Respuesta de producto en venta con detalles.

    :ivar producto: Detalles del producto.
    """

    producto: ProductoResponse | None = None

    class Config:
        from_attributes = True


class VentaCreate(VentaBase):
    """Payload de creación de venta.

    :ivar productos: Lista de productos a vender.
    """

    productos: list[VentaProductoBase] | None = []


class VentaResponse(VentaBase):
    """Modelo de respuesta para venta.

    :ivar id: Identificador único de la venta.
    :ivar productos: Productos incluidos en la venta.
    """

    id: int
    productos: list[VentaProductoResponse] | None = None

    class Config:
        from_attributes = True