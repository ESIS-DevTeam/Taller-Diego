"""Modelo de OrdenEmpleado (tabla de relación).

Define la estructura de la tabla de relación muchos-a-muchos entre Orden y Empleado.
"""

from sqlalchemy import Column, Integer, ForeignKey
from db.base import Base
from sqlalchemy.orm import relationship

class OrdenEmpleado(Base):
    """Modelo SQLAlchemy para OrdenEmpleado.

    Representa la asignación de un empleado a una orden.

    :ivar id: Identificador único del registro.
    :ivar orden_id: Identificador de la orden asociada (FK).
    :ivar empleado_id: Identificador del empleado asociado (FK).
    :ivar empleado: Relación con Empleado.
    :ivar orden: Relación con Orden.
    """

    __tablename__ = "orden_empleado"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey("ordenes.id"), nullable=False)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)

    empleado = relationship("Empleado", back_populates="ordenes")
    orden = relationship("Orden", back_populates="empleados")