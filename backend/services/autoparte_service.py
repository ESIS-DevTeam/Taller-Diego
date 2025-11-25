"""Servicio de Autopartes - Refactorizado con Genéricos"""
from sqlalchemy.orm import Session
from repositories.autoparte_repo import AutoparteRepository
from schemas.autoparte_schema import AutoparteCreate
from services.base_service import BaseService
from db.models.autoparte import Autoparte


class AutoparteService(BaseService[Autoparte, AutoparteCreate, AutoparteCreate]):
    """
    Servicio específico para Autopartes.
    Hereda toda la funcionalidad CRUD de BaseService.
    """

    def __init__(self, db: Session):
        repository = AutoparteRepository(db)
        super().__init__(Autoparte, repository)
        self.repo = repository
    
    def _validate_create(self, data: AutoparteCreate) -> None:
        """Valida que no exista una autoparte con el mismo nombre."""
        if self.repo.get_by_nombre(data.nombre):
            raise ValueError("Ya existe una autoparte con ese nombre")
    
    def get_by_nombre(self, nombre: str):
        """Busca una autoparte por nombre."""
        return self.repo.get_by_nombre(nombre)
    
    def get_by_modelo(self, modelo: str):
        """Busca autopartes por modelo de vehículo."""
        return self.repo.get_by_modelo(modelo)
    
    def get_by_anio(self, anio: int):
        """Busca autopartes por año."""
        return self.repo.get_by_anio(anio)