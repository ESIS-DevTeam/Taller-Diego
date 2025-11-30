"""Modelo de OrdenServicio (tabla de relación).

Define la estructura de la tabla de relación muchos-a-muchos entre Orden y Servicio.
"""

from sqlalchemy import Column, Integer, ForeignKey
from db.base import Base
from sqlalchemy.orm import relationship

class OrdenServicio(Base):
    """Modelo SQLAlchemy para OrdenServicio.

    Representa la inclusión de un servicio en una orden con su precio.

    :ivar id: Identificador único del registro.
    :ivar orden_id: Identificador de la orden asociada (FK).
    :ivar servicio_id: Identificador del servicio asociado (FK).
    :ivar precio_servicio: Precio del servicio en esta orden.
    :ivar servicio: Relación con Servicio.
    :ivar orden: Relación con Orden.
    """

    __tablename__ = "orden_servicio"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey("ordenes.id"), nullable=False)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=False)
    precio_servicio = Column(Integer, nullable=False)

    servicio = relationship("Servicio", back_populates="ordenes")
    orden = relationship("Orden", back_populates="servicios")