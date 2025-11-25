"""Repositorio de Autopartes - Refactorizado con Genéricos"""
from sqlalchemy.orm import Session
from db.models.autoparte import Autoparte
from repositories.base_repository import BaseRepository


class AutoparteRepository(BaseRepository[Autoparte]):
    """
    Repositorio específico para Autopartes.
    Hereda toda la funcionalidad CRUD de BaseRepository.
    """
    
    def __init__(self, db: Session):
        super().__init__(Autoparte, db)
    
    def get_by_nombre(self, nombre: str):
        """Busca una autoparte por nombre."""
        return self.get_by_field("nombre", nombre)
    
    # Métodos específicos para autopartes
    def get_by_modelo(self, modelo: str):
        """Busca autopartes por modelo de vehículo."""
        return self.get_many_by_field("modelo", modelo)
    
    def get_by_anio(self, anio: int):
        """Busca autopartes por año de fabricación."""
        return self.get_many_by_field("anio", anio)