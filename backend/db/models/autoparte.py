"""Modelo de datos para Autoparte.

Representa una autoparte, subclase polimórfica de Producto.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from .producto import Producto



class Autoparte(Producto):
    """Autoparte como especialización de Producto.

    Hereda de Producto e implementa herencia single-table con campos
    adicionales específicos de autopartes.

    :ivar id: Identificador (clave foránea a productos.id).
    :ivar modelo: Modelo de vehículo compatible.
    :ivar anio: Año del modelo de vehículo.
    """

    __tablename__ = "autopartes"
    
    id = Column(Integer, ForeignKey('productos.id'), primary_key=True)
    modelo = Column(String, nullable=False)
    anio = Column(Integer, nullable=False)
    
    __mapper_args__ = {
        'polymorphic_identity': 'autoparte',
    }