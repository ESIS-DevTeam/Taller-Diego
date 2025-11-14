"""Esquemas Pydantic para Venta.

Define los modelos de validación y serialización para operaciones de Venta.
"""

from pydantic import BaseModel
from datetime import datetime
from schemas.producto_schema import ProductoResponse



class VentaBase(BaseModel):
    """Esquema base para Venta.

    :ivar fecha: Fecha y hora de la venta.
    """

    fecha: datetime



class VentaProductoBase(BaseModel):
    """Esquema base para VentaProducto.

    :ivar producto_id: Identificador del producto.
    :ivar cantidad: Cantidad vendida.
    """

    producto_id: int
    cantidad: int


class VentaProductoResponse(VentaProductoBase):
    """Esquema de respuesta para VentaProducto.

    Extiende VentaProductoBase con datos de respuesta.

    :ivar producto: Datos del producto asociado.
    """

    producto: ProductoResponse | None = None

    class Config:
        from_attributes = True



class VentaCreate(VentaBase):
    """Esquema de creación para Venta.

    Extiende VentaBase con lista de productos a vender.

    :ivar productos: Lista de productos a incluir en la venta.
    """

    productos: list[VentaProductoBase] | None = []



class VentaResponse(VentaBase):
    """Esquema de respuesta para Venta.

    Extiende VentaBase con identificador y datos de productos vendidos.

    :ivar id: Identificador de la venta.
    :ivar productos: Lista de productos vendidos con detalles.
    """

    id: int
    productos: list[VentaProductoResponse] | None = None

    class Config:
        from_attributes = True