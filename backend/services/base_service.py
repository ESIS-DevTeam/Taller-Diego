"""
Servicio Genérico Base
Implementa la lógica de negocio común para todas las entidades.
Trabaja con el BaseRepository para proporcionar operaciones CRUD con validaciones.
"""
from typing import TypeVar, Generic, List, Optional, Type
from sqlalchemy.orm import Session
from pydantic import BaseModel
from repositories.base_repository import BaseRepository
from db.base import Base

# T representa el modelo de SQLAlchemy (Producto, Servicio, etc.)
ModelType = TypeVar("ModelType", bound=Base)
# CreateSchemaType representa el esquema Pydantic para crear (ProductoCreate, ServicioCreate, etc.)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
# UpdateSchemaType representa el esquema Pydantic para actualizar
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Servicio Genérico que implementa la lógica de negocio básica.
    
    Beneficios:
    - Centraliza la lógica de validación y transformación
    - Reduce duplicación de código en servicios específicos
    - Facilita agregar comportamientos comunes (logging, cache, etc.)
    
    Uso:
        class ProductoService(BaseService[Producto, ProductoCreate, ProductoCreate]):
            def __init__(self, db: Session):
                super().__init__(Producto, ProductoRepository(Producto, db))
    """
    
    def __init__(self, model: Type[ModelType], repository: BaseRepository[ModelType]):
        """
        Constructor del servicio genérico.
        
        Args:
            model: La clase del modelo SQLAlchemy
            repository: El repositorio que maneja la persistencia
        """
        self.model = model
        self.repository = repository
    
    def create(self, data: CreateSchemaType) -> ModelType:
        """
        Crea una nueva entidad.
        Convierte el esquema Pydantic a instancia del modelo y lo persiste.
        
        Args:
            data: Datos validados para crear la entidad
            
        Returns:
            La entidad creada
            
        Raises:
            ValueError: Si hay errores de validación de negocio
        """
        # Hook para validaciones personalizadas antes de crear
        self._validate_create(data)
        
        # Convertir schema Pydantic a modelo SQLAlchemy
        entity = self.model(**data.model_dump())
        
        # Persistir usando el repositorio genérico
        return self.repository.create(entity)
    
    def get_all(self) -> List[ModelType]:
        """
        Obtiene todas las entidades.
        
        Returns:
            Lista de todas las entidades
        """
        return self.repository.get_all()
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """
        Busca una entidad por ID.
        
        Args:
            id: El identificador único
            
        Returns:
            La entidad si existe, None si no
        """
        return self.repository.get_by_id(id)
    
    def update(self, id: int, data: UpdateSchemaType) -> Optional[ModelType]:
        """
        Actualiza una entidad existente.
        
        Args:
            id: El identificador de la entidad a actualizar
            data: Los nuevos datos
            
        Returns:
            La entidad actualizada, o None si no existe
            
        Raises:
            ValueError: Si hay errores de validación
        """
        entity = self.repository.get_by_id(id)
        if not entity:
            return None
        
        # Hook para validaciones personalizadas
        self._validate_update(id, data)
        
        # Actualizar campos
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(entity, key, value)
        
        return self.repository.update(entity)
    
    def delete(self, id: int) -> bool:
        """
        Elimina una entidad.
        
        Args:
            id: El identificador de la entidad a eliminar
            
        Returns:
            True si se eliminó, False si no existía
        """
        # Hook para validaciones antes de eliminar
        self._validate_delete(id)
        
        return self.repository.delete(id)
    
    def exists(self, id: int) -> bool:
        """
        Verifica si existe una entidad con el ID dado.
        
        Args:
            id: El identificador a verificar
            
        Returns:
            True si existe
        """
        return self.repository.exists(id)
    
    def count(self) -> int:
        """
        Cuenta el total de entidades.
        
        Returns:
            Número total de registros
        """
        return self.repository.count()
    
    # Hooks para que las clases hijas puedan agregar validaciones personalizadas
    # Estos métodos están diseñados para ser sobrescritos (Override)
    
    def _validate_create(self, data: CreateSchemaType) -> None:
        """
        Hook para validaciones personalizadas antes de crear.
        Las clases hijas pueden sobrescribir este método.
        
        Args:
            data: Los datos a validar
            
        Raises:
            ValueError: Si la validación falla
        """
        pass
    
    def _validate_update(self, id: int, data: UpdateSchemaType) -> None:
        """
        Hook para validaciones personalizadas antes de actualizar.
        Las clases hijas pueden sobrescribir este método.
        
        Args:
            id: El ID de la entidad a actualizar
            data: Los nuevos datos
            
        Raises:
            ValueError: Si la validación falla
        """
        pass
    
    def _validate_delete(self, id: int) -> None:
        """
        Hook para validaciones personalizadas antes de eliminar.
        Las clases hijas pueden sobrescribir este método.
        
        Args:
            id: El ID de la entidad a eliminar
            
        Raises:
            ValueError: Si la validación falla (ej: tiene dependencias)
        """
        pass
