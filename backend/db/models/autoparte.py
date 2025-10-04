from sqlalchemy import Column, Integer, String, ForeignKey
from .producto import Producto

class Autoparte(Producto):
    __tablename__ = "autopartes"
    
    id = Column(Integer, ForeignKey('productos.id'), primary_key=True)
    modelo = Column(String, nullable=False)
    anio = Column(Integer, nullable=False)
    
    __mapper_args__ = {
        'polymorphic_identity': 'autoparte',
    }