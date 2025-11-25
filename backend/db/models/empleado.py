"""Modelo de base de datos para Empleado.

Define la estructura y relaciones de la entidad Empleado en la BD.
"""

from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship


class Empleado(Base):
    """Modelo ORM para empleados del taller.

    Representa personal que trabaja en el taller y que puede ser asignado a órdenes de trabajo.

    :ivar id: Identificador único del empleado.
    :ivar nombres: Nombre del empleado (único).
    :ivar apellidos: Apellido del empleado.
    :ivar estado: Estado del empleado (activo/inactivo).
    :ivar especialidad: Especialidad laboral del empleado.
    :ivar ordenes: Relación con órdenes asignadas al empleado.
    """

    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True)
    nombres = Column(String, nullable=False, unique=True)
    apellidos = Column(String, nullable=False)
    estado = Column(String, nullable=False, default="activo")
    especialidad = Column(String, nullable=False)

    ordenes = relationship("OrdenEmpleado", back_populates="empleado")