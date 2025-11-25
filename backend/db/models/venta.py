"""Modelo de base de datos para Venta.

Define la estructura y relaciones de la entidad Venta en la BD.
"""

from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import relationship
from db.base import Base


class Venta(Base):
    """Modelo ORM para ventas de productos.

    Representa una venta que agrupa productos vendidos en una transacción.

    :ivar id: Identificador único de la venta.
    :ivar fecha: Fecha y hora de la venta.
    :ivar productos: Relación con productos incluidos en la venta.
    """

    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False)

    productos = relationship("VentaProducto", back_populates="venta")