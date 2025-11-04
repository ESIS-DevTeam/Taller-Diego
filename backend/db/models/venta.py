from sqlalchemy import Column, Integer, DateTime
from db.base import Base
from sqlalchemy.orm import relationship

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False)

    productos = relationship("VentaProducto", back_populates="venta")