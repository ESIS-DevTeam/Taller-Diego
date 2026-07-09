from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship


class Cliente(Base):
    """Dueño de uno o más vehículos que atiende el taller."""

    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    celular = Column(String, nullable=False)
    correo = Column(String, nullable=True)

    vehiculos = relationship("Vehiculo", back_populates="cliente")
