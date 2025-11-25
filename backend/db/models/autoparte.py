"""Modelo de base de datos para Autoparte.

Define la estructura y relaciones de la entidad Autoparte, especialización de Producto.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from .producto import Producto


class Autoparte(Producto):
    """Modelo ORM para autopartes específicas.

    Especialización de Producto para artículos automotrices específicos de modelo y año.
    Implementa herencia joined-table con la entidad Producto.

    :ivar id: Identificador único (heredado de Producto).
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