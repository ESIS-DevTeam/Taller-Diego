"""
Servicio para gestionar la lógica de negocio de Servicio.

Implementa validaciones y reglas de negocio para servicios.
"""

from sqlalchemy.orm import Session
from repositories.servicio_repo import ServicioRepository
from schemas.servicio_schema import ServicioCreate, ServicioUpdate


class ServicioService:
    """
    Servicio que encapsula la lógica de negocio para servicios del taller.
    
    Valida reglas de negocio antes de delegar operaciones al repositorio.
    """

    def __init__(self, db: Session):
        """
        Inicializa el servicio con una sesión de BD.
        
        Args:
            db (Session): Sesión activa de SQLAlchemy
        """
        self.repo = ServicioRepository(db)

    def create_servicio(self, data: ServicioCreate):
        """
        Crea un nuevo servicio validando que no exista duplicado.
        
        Args:
            data: Datos del servicio a crear
            
        Returns:
            Servicio: Servicio creado
            
        Raises:
            ValueError: Si ya existe un servicio con ese nombre
        """
        # Validación de negocio: No permitir nombres duplicados
        if self.repo.get_by_name(data.nombre):
            raise ValueError(f"Ya existe un servicio con el nombre '{data.nombre}'")
        
        return self.repo.create(data)

    def list_servicios(self):
        """
        Obtiene todos los servicios.
        
        Returns:
            list[Servicio]: Lista de servicios
        """
        return self.repo.get_all()

    def get_by_id(self, id: int):
        """
        Busca un servicio por ID.
        
        Args:
            id: ID del servicio
            
        Returns:
            Servicio: Servicio encontrado
            
        Raises:
            ValueError: Si el servicio no existe
        """
        servicio = self.repo.get_by_id(id)
        if not servicio:
            raise ValueError(f"No se encontró el servicio con ID {id}")
        return servicio

    def update_servicio(self, id: int, data: ServicioUpdate):
        """
        Actualiza un servicio existente.
        
        Args:
            id: ID del servicio a actualizar
            data: Nuevos datos del servicio
            
        Returns:
            Servicio: Servicio actualizado
            
        Raises:
            ValueError: Si el servicio no existe o el nombre está duplicado
        """
        # Validar que el servicio existe
        servicio = self.repo.get_by_id(id)
        if not servicio:
            raise ValueError(f"No se encontró el servicio con ID {id}")
        
        # Validar que no haya duplicados (excepto consigo mismo)
        existing = self.repo.get_by_name(data.nombre)
        if existing and existing.id != id:
            raise ValueError(f"Ya existe otro servicio con el nombre '{data.nombre}'")
        
        return self.repo.update(id, data)

    def delete_servicio(self, id: int):
        """
        Elimina un servicio.
        
        Args:
            id: ID del servicio a eliminar
            
        Returns:
            bool: True si se eliminó exitosamente
            
        Raises:
            ValueError: Si el servicio no existe
        """
        servicio = self.repo.get_by_id(id)
        if not servicio:
            raise ValueError(f"No se encontró el servicio con ID {id}")
        
        return self.repo.delete(id)
