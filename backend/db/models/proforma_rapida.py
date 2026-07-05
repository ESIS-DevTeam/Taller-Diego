from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from db.base import Base


class ProformaRapida(Base):
    __tablename__ = "proformas_rapidas"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=True, unique=True, index=True)
    placa = Column(String, nullable=False, index=True)
    cliente_nombre = Column(String, nullable=False, index=True)
    celular = Column(String, nullable=False)
    diagnostico = Column(Text, nullable=False)
    precio_estimado = Column(String, nullable=True)
    servicio_sugerido = Column(String, nullable=True)
    modelo_vehiculo = Column(String, nullable=True)
    productos_json = Column(Text, nullable=False, default="[]")
    estado = Column(String, nullable=False, default="pendiente", index=True)
    taller_nombre = Column(String, nullable=False, default="TALLER DE DIEGO")
    taller_direccion = Column(String, nullable=True, default="")
    taller_correo = Column(String, nullable=True, default="")
    taller_web = Column(String, nullable=True, default="")
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_pendiente = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_revisado = Column(DateTime(timezone=True), nullable=True)
