"""Servicio de negocio para Producto.

Orquesta la lógica de negocio y validaciones de producto.
"""

from sqlalchemy.orm import Session
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate
from core.cache import cache


class ProductoService:
    """Servicio CRUD para Producto.

    Implementa reglas de negocio y validaciones específicas de producto.

    :ivar repo: Instancia de ProductoRepository.
    """

    def __init__(self, db: Session):
        """Inicializa el servicio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.repo = ProductoRepository(db)

    def create_producto(self, data: ProductoCreate):
        """Crea un nuevo producto.

        Valida que no exista otro producto con el mismo nombre.

        :param data: Datos de creación del producto.
        :returns: Instancia de Producto creada.
        :raises ValueError: Si ya existe un producto con ese nombre.
        """

        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe un producto con ese nombre")
        producto_data = data
        producto = self.repo.create(producto_data)
        
        # Invalidar caché de productos
        cache.invalidate_pattern('productos')
        
        return producto

    def list_productos(self):
        # Intentar obtener del caché
        cached = cache.get('productos_list')
        if cached is not None:
            return cached
        
        # Si no está en caché, obtener de la BD
        productos = self.repo.get_all()
        
        # Guardar en caché por 5 minutos
        cache.set('productos_list', productos, ttl_seconds=300)
        
        return productos
    
    def get_by_id(self, id: int):
        # Intentar obtener del caché
        cache_key = f'producto_{id}'
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        
        # Si no está en caché, obtener de la BD
        producto = self.repo.get_by_id(id)
        
        # Guardar en caché
        if producto:
            cache.set(cache_key, producto, ttl_seconds=300)
        
        return producto
    
    def get_by_name(self, nombre: str):
        """Obtiene un producto por su nombre.

        :param nombre: Nombre del producto.
        :returns: Instancia Producto o None si no existe.
        """

        return self.repo.get_by_name(nombre)
    
    def get_by_barcode(self, codBarras: str):
        return self.repo.get_by_barcode(codBarras)
    
    def update_producto(self, id: int, data: ProductoCreate):
        producto = self.repo.update(id, data)
        
        # Invalidar caché
        cache.delete(f'producto_{id}')
        cache.invalidate_pattern('productos')
        
        return producto
    
    def delete_producto(self, id: int):
        result = self.repo.delete(id)
        
        # Invalidar caché
        cache.delete(f'producto_{id}')
        cache.invalidate_pattern('productos')
        
        return result
