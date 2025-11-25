"""Modelo de base de datos para OrdenEmpleado.

Define la relación muchos-a-muchos entre Orden y Empleado.
"""

from sqlalchemy import Column, Integer, ForeignKey
from db.base import Base
from sqlalchemy.orm import relationship


class OrdenEmpleado(Base):
    """Modelo ORM para la relación entre Orden y Empleado.

    Tabla intermedia que asocia empleados a órdenes de trabajo.

    :ivar id: Identificador único del registro.
    :ivar orden_id: Identificador de la orden.
    :ivar empleado_id: Identificador del empleado.
    :ivar empleado: Relación con la entidad Empleado.
    :ivar orden: Relación con la entidad Orden.
    """

    __tablename__ = "orden_empleado"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey("ordenes.id"), nullable=False)
    empleado_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)

    empleado = relationship("Empleado", back_populates="ordenes")
    orden = relationship("Orden", back_populates="empleados")