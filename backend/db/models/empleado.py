"""Modelo de Empleado.

Define la estructura de la tabla de empleados en la base de datos.
"""

from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship

class Empleado(Base):
    """Modelo SQLAlchemy para Empleado.

    Representa un empleado con información de contacto y especialidad.

    :ivar id: Identificador único del empleado.
    :ivar nombres: Nombre del empleado (único).
    :ivar apellidos: Apellido del empleado.
    :ivar estado: Estado del empleado (activo/inactivo).
    :ivar especialidad: Especialidad del empleado.
    :ivar ordenes: Relación con OrdenEmpleado (órdenes asignadas).
    """

    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True)
    nombres = Column(String, nullable=False, unique=True)
    apellidos = Column(String, nullable=False)
    estado = Column(String, nullable=False, default="activo")
    especialidad = Column(String, nullable=False)

    ordenes = relationship("OrdenEmpleado", back_populates="empleado")