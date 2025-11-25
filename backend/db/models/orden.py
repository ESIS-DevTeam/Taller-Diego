"""Modelo de base de datos para Orden.

Define la estructura y relaciones de la entidad Orden en la BD.
"""

from sqlalchemy import Column, Integer, String, Date
from db.base import Base
from sqlalchemy.orm import relationship


class Orden(Base):
    """Modelo ORM para órdenes de trabajo del taller.

    Representa una orden de servicio que agrupa servicios y empleados asignados.

    :ivar id: Identificador único de la orden.
    :ivar garantia: Período de garantía en días.
    :ivar estadoPago: Estado del pago (pendiente/pagado/parcial).
    :ivar precio: Precio total de la orden.
    :ivar fecha: Fecha de creación de la orden.
    :ivar servicios: Relación con servicios incluidos en la orden.
    :ivar empleados: Relación con empleados asignados a la orden.
    """

    __tablename__ = "ordenes"

    id = Column(Integer, primary_key=True)
    garantia = Column(Integer, nullable=False)
    estadoPago = Column(String, nullable=False)
    precio = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=False)

    servicios = relationship("OrdenServicio", back_populates="orden")
    empleados = relationship("OrdenEmpleado", back_populates="orden")