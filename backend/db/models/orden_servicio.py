"""Modelo de base de datos para OrdenServicio.

Define la relación muchos-a-muchos entre Orden y Servicio.
"""

from sqlalchemy import Column, Integer, ForeignKey
from db.base import Base
from sqlalchemy.orm import relationship


class OrdenServicio(Base):
    """Modelo ORM para la relación entre Orden y Servicio.

    Tabla intermedia que asocia servicios a órdenes con su precio específico.

    :ivar id: Identificador único del registro.
    :ivar orden_id: Identificador de la orden.
    :ivar servicio_id: Identificador del servicio.
    :ivar precio_servicio: Precio del servicio en la orden.
    :ivar servicio: Relación con la entidad Servicio.
    :ivar orden: Relación con la entidad Orden.
    """

    __tablename__ = "orden_servicio"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey("ordenes.id"), nullable=False)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=False)
    precio_servicio = Column(Integer, nullable=False)

    servicio = relationship("Servicio", back_populates="ordenes")
    orden = relationship("Orden", back_populates="servicios")