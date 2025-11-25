"""
Repositorio Genérico Base
Implementa el patrón Repository con Genéricos para eliminar código duplicado.
Este es el corazón de la reutilización de código en la capa de persistencia.
"""
from typing import TypeVar, Generic, List, Optional, Type
from sqlalchemy.orm import Session
from db.base import Base

# T representa cualquier modelo que herede de Base (Usuario, Producto, Servicio, etc.)
# Esto es equivalente a <T extends Base> en Java
ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Repositorio Genérico que implementa operaciones CRUD básicas.
    
    Beneficios:
    - DRY (Don't Repeat Yourself): La lógica CRUD se escribe UNA sola vez
    - Type Safety: Python type hints aseguran que trabajamos con el tipo correcto
    - Mantenibilidad: Un cambio en la lógica de persistencia se aplica a TODOS los modelos
    
    Uso:
        class ProductoRepository(BaseRepository[Producto]):
            pass  # Automáticamente hereda create, get_all, get_by_id, update, delete
    """
    
    def __init__(self, model: Type[ModelType], db: Session):
        """
        Constructor del repositorio genérico.
        
        Args:
            model: La clase del modelo SQLAlchemy (Producto, Servicio, etc.)
            db: La sesión de base de datos
        """
        self.model = model
        self.db = db
    
    def create(self, entity: ModelType) -> ModelType:
        """
        Crea una nueva entidad en la base de datos.
        
        Args:
            entity: Instancia del modelo a guardar
            
        Returns:
            La entidad guardada con su ID asignado
        """
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def get_all(self) -> List[ModelType]:
        """
        Obtiene todas las entidades de este tipo.
        
        Returns:
            Lista con todas las entidades
        """
        return self.db.query(self.model).all()
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        """
        Busca una entidad por su ID.
        
        Args:
            id: El identificador único
            
        Returns:
            La entidad si existe, None si no se encuentra
        """
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def update(self, entity: ModelType) -> ModelType:
        """
        Actualiza una entidad existente.
        
        Args:
            entity: La entidad con los cambios a persistir
            
        Returns:
            La entidad actualizada
        """
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def delete(self, id: int) -> bool:
        """
        Elimina una entidad por su ID.
        
        Args:
            id: El identificador de la entidad a eliminar
            
        Returns:
            True si se eliminó, False si no se encontró
        """
        entity = self.get_by_id(id)
        if entity:
            self.db.delete(entity)
            self.db.commit()
            return True
        return False
    
    def get_by_field(self, field_name: str, value) -> Optional[ModelType]:
        """
        Busca una entidad por un campo específico.
        Método genérico para búsquedas por cualquier atributo.
        
        Args:
            field_name: Nombre del campo (ej: "nombre", "email")
            value: Valor a buscar
            
        Returns:
            La primera entidad que coincida
        """
        return self.db.query(self.model).filter(
            getattr(self.model, field_name) == value
        ).first()
    
    def get_many_by_field(self, field_name: str, value) -> List[ModelType]:
        """
        Busca múltiples entidades por un campo específico.
        
        Args:
            field_name: Nombre del campo
            value: Valor a buscar
            
        Returns:
            Lista de entidades que coincidan
        """
        return self.db.query(self.model).filter(
            getattr(self.model, field_name) == value
        ).all()
    
    def exists(self, id: int) -> bool:
        """
        Verifica si existe una entidad con el ID dado.
        
        Args:
            id: El identificador a verificar
            
        Returns:
            True si existe, False en caso contrario
        """
        return self.db.query(self.model).filter(self.model.id == id).count() > 0
    
    def count(self) -> int:
        """
        Cuenta el total de entidades de este tipo.
        
        Returns:
            Número total de registros
        """
        return self.db.query(self.model).count()
