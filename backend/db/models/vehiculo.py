from sqlalchemy import Column, Integer, String, ForeignKey
from db.base import Base
from sqlalchemy.orm import relationship


class Vehiculo(Base):
    """Vehículo identificado por su placa (patente). La placa es la llave
    de negocio con la que se busca el historial de servicios."""

    __tablename__ = "vehiculos"

    id = Column(Integer, primary_key=True)
    placa = Column(String, nullable=False, unique=True, index=True)
    modelo = Column(String, nullable=True)
    anio = Column(String(20), nullable=True)
    color = Column(String, nullable=True)
    kilometraje = Column(String(30), nullable=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)

    cliente = relationship("Cliente", back_populates="vehiculos")
    ordenes_trabajo = relationship("OrdenTrabajo", back_populates="vehiculo")
