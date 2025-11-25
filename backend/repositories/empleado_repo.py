"""Repositorio de Empleados - Refactorizado con Genéricos"""
from sqlalchemy.orm import Session
from db.models import Empleado
from repositories.base_repository import BaseRepository


class EmpleadoRepository(BaseRepository[Empleado]):
    """
    Repositorio específico para Empleados.
    Hereda toda la funcionalidad CRUD de BaseRepository.
    """
    
    def __init__(self, db: Session):
        super().__init__(Empleado, db)
    
    def get_by_nombres(self, nombres: str):
        """Busca un empleado por nombres."""
        return self.get_by_field("nombres", nombres)
    
    def get_by_cargo(self, cargo: str):
        """Busca empleados por cargo."""
        return self.get_many_by_field("cargo", cargo)