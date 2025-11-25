"""
Repositorio de Servicios - Refactorizado con Genéricos
Elimina ~40 líneas de código duplicado usando BaseRepository.
"""
from sqlalchemy.orm import Session
from db.models import Servicio
from repositories.base_repository import BaseRepository


class ServicioRepository(BaseRepository[Servicio]):
    """
    Repositorio específico para Servicios.
    Hereda toda la funcionalidad CRUD de BaseRepository.
    """
    
    def __init__(self, db: Session):
        super().__init__(Servicio, db)
    
    def get_by_nombre(self, nombre: str):
        """Busca un servicio por nombre."""
        return self.get_by_field("nombre", nombre)
    
    def get_servicios_activos(self):
        """
        Obtiene servicios disponibles/activos.
        Ejemplo de lógica específica de negocio.
        """
        return self.db.query(Servicio).filter(
            Servicio.disponible == True
        ).all()