"""
Servicio de Productos - Refactorizado con Genéricos
Elimina ~30 líneas de código duplicado usando BaseService.
Solo contiene lógica específica del dominio de Producto.
"""
from sqlalchemy.orm import Session
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate
from services.base_service import BaseService
from db.models import Producto


class ProductoService(BaseService[Producto, ProductoCreate, ProductoCreate]):
    """
    Servicio específico para Productos.
    
    Hereda automáticamente de BaseService:
    - create(data)
    - get_all()
    - get_by_id(id)
    - update(id, data)
    - delete(id)
    - exists(id)
    - count()
    """
    
    def __init__(self, db: Session):
        repository = ProductoRepository(db)
        super().__init__(Producto, repository)
        self.repo = repository
    
    # Sobrescribimos el hook de validación para agregar lógica de negocio
    def _validate_create(self, data: ProductoCreate) -> None:
        """
        Valida que no exista un producto con el mismo nombre.
        Este es un hook que se ejecuta ANTES de crear.
        """
        if self.repo.get_by_nombre(data.nombre):
            raise ValueError("Ya existe un producto con ese nombre")
    
    # Métodos específicos de negocio
    def get_by_nombre(self, nombre: str):
        """Busca un producto por nombre."""
        return self.repo.get_by_nombre(nombre)
    
    def get_by_categoria(self, categoria: str):
        """Obtiene productos de una categoría."""
        return self.repo.get_by_categoria(categoria)
    
    def get_productos_bajo_stock(self):
        """Obtiene productos con stock menor al mínimo."""
        return self.repo.get_productos_bajo_stock()