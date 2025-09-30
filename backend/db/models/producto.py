from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(String, nullable=False, default="")
    precio = Column(Integer, nullable=False)
    marca = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    stockMin = Column(Integer, nullable=False, default=0)
    codBarras = Column(String, nullable=True, unique=True)
    img = Column(String, nullable=True)

    ventas = relationship("VentaProducto", back_populates="producto")