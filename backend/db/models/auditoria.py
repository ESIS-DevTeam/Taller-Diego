from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from ..base import Base

class Auditoria(Base):
    __tablename__ = "auditoria"

    id = Column(Integer, primary_key=True, index=True)
    modulo = Column(String(50), nullable=False)  # 'producto', 'servicio', 'venta', etc.
    accion = Column(String(20), nullable=False)  # 'CREATE', 'UPDATE', 'DELETE'
    tabla = Column(String(50), nullable=False)  # Nombre de la tabla afectada
    registro_id = Column(Integer, nullable=False)  # ID del registro modificado
    usuario = Column(String(100), nullable=False)  # Usuario que realizó la acción
    fecha = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    datos_anteriores = Column(JSON, nullable=True)  # Datos antes del cambio (para UPDATE/DELETE)
    datos_nuevos = Column(JSON, nullable=True)  # Datos después del cambio (para CREATE/UPDATE)
    descripcion = Column(Text, nullable=True)  # Descripción detallada del cambio
    ip_address = Column(String(45), nullable=True)  # Dirección IP del usuario
    
    def __repr__(self):
        return f"<Auditoria {self.modulo} - {self.accion} - {self.fecha}>"
