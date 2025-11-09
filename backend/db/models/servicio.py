"""
Modelo de datos para Servicio.

Define la entidad Servicio que representa los servicios mecánicos
ofrecidos por el taller (cambio de aceite, alineación, etc.).
"""

from sqlalchemy import Column, Integer, String, Float
from db.base import Base


class Servicio(Base):
    """
    Modelo de Servicio del taller.
    
    Representa un servicio mecánico que se puede ofrecer a los clientes,
    con su nombre, descripción y precio.
    """
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(String, nullable=False)
    precio = Column(Float, nullable=False)
