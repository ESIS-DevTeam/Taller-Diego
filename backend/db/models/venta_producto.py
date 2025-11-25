"""Modelo de base de datos para VentaProducto.

Define la relación muchos-a-muchos entre Venta y Producto.
"""

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base


class VentaProducto(Base):
    """Modelo ORM para la relación entre Venta y Producto.

    Tabla intermedia que asocia productos a ventas con la cantidad vendida.

    :ivar id: Identificador único del registro.
    :ivar venta_id: Identificador de la venta.
    :ivar producto_id: Identificador del producto.
    :ivar cantidad: Cantidad del producto vendido.
    :ivar producto: Relación con la entidad Producto.
    :ivar venta: Relación con la entidad Venta.
    """

    __tablename__ = "venta_producto"

    id = Column(Integer, primary_key=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)

    producto = relationship("Producto", back_populates="ventas")
    venta = relationship("Venta", back_populates="productos")