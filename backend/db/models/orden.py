"""Modelo de Orden.

Define la estructura de la tabla de órdenes en la base de datos.
"""

from sqlalchemy import Column, Integer, String, Date
from db.base import Base
from sqlalchemy.orm import relationship

class Orden(Base):
    """Modelo SQLAlchemy para Orden.

    Representa una orden de servicio con servicios y empleados asignados.

    :ivar id: Identificador único de la orden.
    :ivar garantia: Período de garantía en meses.
    :ivar estadoPago: Estado del pago de la orden.
    :ivar precio: Precio total de la orden.
    :ivar fecha: Fecha de creación de la orden.
    :ivar servicios: Relación con OrdenServicio (servicios en la orden).
    :ivar empleados: Relación con OrdenEmpleado (empleados asignados).
    """

    __tablename__ = "ordenes"

    id = Column(Integer, primary_key=True)
    garantia = Column(Integer, nullable=False)
    estadoPago = Column(String, nullable=False)
    precio = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=False)

    servicios = relationship("OrdenServicio", back_populates="orden")
    empleados = relationship("OrdenEmpleado", back_populates="orden")