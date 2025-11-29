"""Modelo de Servicio.

Define la estructura de la tabla de servicios en la base de datos.
"""

from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship

class Servicio(Base):
    """Modelo SQLAlchemy para Servicio.

    Representa un servicio que puede ser incluido en órdenes.

    :ivar id: Identificador único del servicio.
    :ivar nombre: Nombre del servicio (único).
    :ivar descripcion: Descripción del servicio.
    :ivar ordenes: Relación con OrdenServicio (órdenes que incluyen este servicio).
    """

    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(String, nullable=False, default="")

    ordenes = relationship("OrdenServicio", back_populates="servicio")