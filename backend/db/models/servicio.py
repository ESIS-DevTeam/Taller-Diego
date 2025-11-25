"""Modelo de base de datos para Servicio.

Define la estructura y relaciones de la entidad Servicio en la BD.
"""

from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship


class Servicio(Base):
    """Modelo ORM para servicios de taller.

    Representa un servicio que puede ser ofrecido a los clientes.
    Cada servicio puede estar asociado a múltiples órdenes de trabajo.

    :ivar id: Identificador único del servicio.
    :ivar nombre: Nombre del servicio (único).
    :ivar descripcion: Descripción detallada del servicio.
    :ivar ordenes: Relación con órdenes de servicio.
    """

    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(String, nullable=False, default="")

    ordenes = relationship("OrdenServicio", back_populates="servicio")