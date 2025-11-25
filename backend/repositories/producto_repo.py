"""
Repositorio de Productos - Refactorizado con Genéricos
Ahora hereda de BaseRepository eliminando TODO el código CRUD duplicado.
Solo contiene métodos específicos del dominio de Producto.
"""
from sqlalchemy.orm import Session
from db.models import Producto
from repositories.base_repository import BaseRepository


class ProductoRepository(BaseRepository[Producto]):
    """
    Repositorio específico para Productos.
    
    Hereda automáticamente de BaseRepository:
    - create(entity)
    - get_all()
    - get_by_id(id)
    - update(entity)
    - delete(id)
    - get_by_field(field_name, value)
    - exists(id)
    - count()
    
    Solo agregamos métodos específicos de negocio si son necesarios.
    """
    
    def __init__(self, db: Session):
        # Llamamos al constructor del padre pasando el modelo Producto
        super().__init__(Producto, db)
    
    def get_by_nombre(self, nombre: str):
        """
        Busca un producto por nombre.
        Método específico del dominio de Producto.
        """
        return self.get_by_field("nombre", nombre)
    
    def get_by_categoria(self, categoria: str):
        """
        Busca productos por categoría.
        Ejemplo de método específico de negocio.
        """
        return self.get_many_by_field("categoria", categoria)
    
    def get_productos_bajo_stock(self):
        """
        Obtiene productos con stock menor al mínimo.
        Lógica específica de negocio que no está en BaseRepository.
        """
        return self.db.query(Producto).filter(
            Producto.stock < Producto.stockMin
        ).all()