"""
Repositorio para operaciones de base de datos de Servicio.

Maneja el acceso a datos (CRUD) para la entidad Servicio.
"""

from sqlalchemy.orm import Session
from db.models.servicio import Servicio
from schemas.servicio_schema import ServicioCreate, ServicioUpdate


class ServicioRepository:
    """
    Repositorio para gestionar operaciones de BD de servicios.
    
    Proporciona métodos para crear, leer, actualizar y eliminar servicios.
    """

    def __init__(self, db: Session):
        """
        Inicializa el repositorio con una sesión de base de datos.
        
        Args:
            db (Session): Sesión activa de SQLAlchemy
        """
        self.db = db

    def create(self, servicio_data: ServicioCreate) -> Servicio:
        """
        Crea un nuevo servicio en la base de datos.
        
        Args:
            servicio_data: Datos del servicio a crear
            
        Returns:
            Servicio: Servicio creado con ID asignado
        """
        servicio = Servicio(
            nombre=servicio_data.nombre,
            descripcion=servicio_data.descripcion,
            precio=servicio_data.precio
        )
        self.db.add(servicio)
        self.db.commit()
        self.db.refresh(servicio)
        return servicio

    def get_all(self):
        """
        Obtiene todos los servicios.
        
        Returns:
            list[Servicio]: Lista de todos los servicios
        """
        return self.db.query(Servicio).all()

    def get_by_id(self, id: int):
        """
        Busca un servicio por su ID.
        
        Args:
            id: ID del servicio
            
        Returns:
            Servicio | None: Servicio encontrado o None
        """
        return self.db.query(Servicio).filter(Servicio.id == id).first()

    def get_by_name(self, nombre: str):
        """
        Busca un servicio por su nombre.
        
        Args:
            nombre: Nombre del servicio
            
        Returns:
            Servicio | None: Servicio encontrado o None
        """
        return self.db.query(Servicio).filter(Servicio.nombre == nombre).first()

    def update(self, id: int, servicio_data: ServicioUpdate) -> Servicio:
        """
        Actualiza un servicio existente.
        
        Args:
            id: ID del servicio a actualizar
            servicio_data: Nuevos datos del servicio
            
        Returns:
            Servicio: Servicio actualizado
        """
        servicio = self.get_by_id(id)
        if servicio:
            servicio.nombre = servicio_data.nombre
            servicio.descripcion = servicio_data.descripcion
            servicio.precio = servicio_data.precio
            self.db.commit()
            self.db.refresh(servicio)
        return servicio

    def delete(self, id: int) -> bool:
        """
        Elimina un servicio de la base de datos.
        
        Args:
            id: ID del servicio a eliminar
            
        Returns:
            bool: True si se eliminó, False si no existía
        """
        servicio = self.get_by_id(id)
        if servicio:
            self.db.delete(servicio)
            self.db.commit()
            return True
        return False
