"""Servicio de Empleados - Refactorizado con Genéricos"""
from sqlalchemy.orm import Session
from repositories.empleado_repo import EmpleadoRepository
from schemas.empleado_schema import EmpleadoCreate
from services.base_service import BaseService
from db.models import Empleado


class EmpleadoService(BaseService[Empleado, EmpleadoCreate, EmpleadoCreate]):
    """
    Servicio específico para Empleados.
    Hereda toda la funcionalidad CRUD de BaseService.
    """

    def __init__(self, db: Session):
        repository = EmpleadoRepository(db)
        super().__init__(Empleado, repository)
        self.repo = repository
    
    def _validate_create(self, data: EmpleadoCreate) -> None:
        """Valida que no exista un empleado con el mismo nombre."""
        if self.repo.get_by_nombres(data.nombres):
            raise ValueError("Ya existe un empleado con ese nombre")
    
    def get_by_cargo(self, cargo: str):
        """Busca empleados por cargo."""
        return self.repo.get_by_cargo(cargo)