"""Modelo de Venta.

Define la estructura de la tabla de ventas en la base de datos.
"""

from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import relationship
from db.base import Base



class Venta(Base):
    """Modelo SQLAlchemy para Venta.

    Representa una venta con fecha y lista de productos asociados.

    :ivar id: Identificador único de la venta.
    :ivar fecha: Fecha y hora de la venta.
    :ivar productos: Relación con VentaProducto (productos vendidos).
    """

    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False)

    productos = relationship("VentaProducto", back_populates="venta")