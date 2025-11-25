"""Servicio de negocio para Producto.

Orquesta la lógica de negocio y validaciones de producto.
"""

from sqlalchemy.orm import Session
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate


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
        return producto
    
    def list_productos(self):
        """Obtiene todos los productos.

        :returns: Lista de instancias Producto.
        """

        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        """Obtiene un producto por su identificador.

        :param id: Identificador del producto.
        :returns: Instancia Producto o None si no existe.
        """

        return self.repo.get_by_id(id)
    
    def get_by_name(self, nombre: str):
        """Obtiene un producto por su nombre.

        :param nombre: Nombre del producto.
        :returns: Instancia Producto o None si no existe.
        """

        return self.repo.get_by_name(nombre)
    
    def update_producto(self, id: int, data: ProductoCreate):
        """Actualiza un producto existente.

        :param id: Identificador del producto a actualizar.
        :param data: Nuevos datos del producto.
        :returns: Instancia Producto actualizada o None si no existe.
        """

        return self.repo.update(id, data)
    
    def delete_producto(self, id: int):
        """Elimina un producto.

        :param id: Identificador del producto a eliminar.
        :returns: Instancia Producto eliminada o None si no existe.
        """

        return self.repo.delete(id)