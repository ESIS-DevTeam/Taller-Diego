"""Servicio de Servicios - Refactorizado con Genéricos"""
from sqlalchemy.orm import Session
from repositories.servicio_repo import ServicioRepository
from schemas.servicio_schema import ServicioCreate
from services.base_service import BaseService
from db.models import Servicio


class ServicioService(BaseService[Servicio, ServicioCreate, ServicioCreate]):
    """
    Servicio específico para Servicios del taller.
    Hereda toda la funcionalidad CRUD de BaseService.
    """

    def __init__(self, db: Session):
        repository = ServicioRepository(db)
        super().__init__(Servicio, repository)
        self.repo = repository
    
    def _validate_create(self, data: ServicioCreate) -> None:
        """Valida que no exista un servicio con el mismo nombre."""
        if self.repo.get_by_nombre(data.nombre):
            raise ValueError("Ya existe un servicio con ese nombre")
    
    def get_by_nombre(self, nombre: str):
        """Busca un servicio por nombre."""
        return self.repo.get_by_nombre(nombre)
    
    def get_servicios_activos(self):
        """Obtiene los servicios disponibles/activos."""
        return self.repo.get_servicios_activos()