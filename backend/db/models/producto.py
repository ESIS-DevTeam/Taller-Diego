"""Modelo de base de datos para Producto.

Define la estructura y relaciones de la entidad Producto en la BD.
"""

from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship


class Producto(Base):
    """Modelo ORM para productos del taller.

    Entidad base que puede ser especializada en Autoparte.
    Representa artículos que se pueden vender o utilizar en servicios.

    :ivar id: Identificador único del producto.
    :ivar nombre: Nombre del producto (único).
    :ivar descripcion: Descripción detallada del producto.
    :ivar precioVenta: Precio de venta al público.
    :ivar precioCompra: Precio de costo de adquisición.
    :ivar marca: Marca o fabricante del producto.
    :ivar categoria: Categoría de clasificación del producto.
    :ivar stock: Cantidad actual en existencia.
    :ivar stockMin: Cantidad mínima para alertas de reorden.
    :ivar codBarras: Código de barras (opcional, único).
    :ivar img: URL o ruta de imagen del producto.
    :ivar tipo: Tipo de producto (discriminador de herencia).
    :ivar ventas: Relación con órdenes de venta.
    """

    __tablename__ = "productos"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(String, nullable=False, default="")
    precioVenta = Column(Integer, nullable=False)
    precioCompra = Column(Integer, nullable=False)
    marca = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    stockMin = Column(Integer, nullable=False, default=0)
    codBarras = Column(String, nullable=True, unique=True)
    img = Column(String, nullable=True)
    tipo = Column(String, nullable=False)

    ventas = relationship("VentaProducto", back_populates="producto")
    
    __mapper_args__ = {
        'polymorphic_identity': 'producto',
        'polymorphic_on': tipo
    }