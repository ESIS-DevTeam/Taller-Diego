"""Modelo de VentaProducto (tabla de relación).

Define la estructura de la tabla de relación muchos-a-muchos entre Venta y Producto.
"""

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base



class VentaProducto(Base):
    """Modelo SQLAlchemy para VentaProducto.

    Representa la relación entre una venta y un producto con cantidad.

    :ivar id: Identificador único del registro.
    :ivar venta_id: Identificador de la venta asociada (FK).
    :ivar producto_id: Identificador del producto asociado (FK).
    :ivar cantidad: Cantidad de producto vendido.
    :ivar producto: Relación con Producto.
    :ivar venta: Relación con Venta.
    """

    __tablename__ = "venta_producto"

    id = Column(Integer, primary_key=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)

    producto = relationship("Producto", back_populates="ventas")
    venta = relationship("Venta", back_populates="productos")