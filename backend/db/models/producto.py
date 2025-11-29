"""Modelo de datos para Producto.

Representa un producto base en el sistema. Utiliza herencia polimórfica
a través del campo 'tipo' para permitir subclases como Autoparte.
"""

from sqlalchemy import Column, Integer, String
from db.base import Base
from sqlalchemy.orm import relationship

class Producto(Base):
    """Producto base del sistema.

    Modelo SQLAlchemy que almacena datos de productos. Implementa
    herencia polimórfica mediante el campo 'tipo'.

    :ivar id: Identificador único del producto.
    :ivar nombre: Nombre del producto (único).
    :ivar descripcion: Descripción del producto.
    :ivar precio_venta: Precio unitario de venta.
    :ivar precio_compra: Precio unitario de compra.
    :ivar marca: Marca o fabricante del producto.
    :ivar categoria: Categoría del producto.
    :ivar stock: Cantidad disponible en inventario.
    :ivar stock_min: Umbral mínimo de stock.
    :ivar cod_barras: Código de barras (puede ser nulo).
    :ivar img: URL o ruta de imagen (puede ser nulo).
    :ivar tipo: Identidad polimórfica ('producto' o 'autoparte').
    :ivar ventas: Relación a VentaProducto (productos vendidos).
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