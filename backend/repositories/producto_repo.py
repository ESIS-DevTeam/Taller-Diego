"""Repositorio de acceso a datos para Producto.

Implementa operaciones CRUD sobre la entidad Producto en la base de datos.
"""

from sqlalchemy.orm import Session
from db.models import Producto
from schemas.producto_schema import ProductoCreate



class ProductoRepository:
    """Repositorio CRUD para Producto.

    Encapsula la lógica de acceso a la tabla de productos.

    :ivar db: Sesión de SQLAlchemy para interactuar con la BD.
    """

    def __init__(self, db: Session):
        """Inicializa el repositorio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.db = db

    def create(self, producto_data: ProductoCreate):
        """Crea un nuevo producto.

        :param producto_data: Datos del producto a crear (ProductoCreate).
        :returns: Instancia de Producto creada y persistida.
        :raises sqlalchemy.exc.IntegrityError: Si viola restricción única.
        """

        producto = Producto(**producto_data.model_dump())
        self.db.add(producto)
        self.db.commit()
        self.db.refresh(producto)
        return producto

    def get_all(self):
        """Obtiene todos los productos.

        :returns: Lista de instancias Producto.
        """

        return self.db.query(Producto).all()

    def get_by_id(self, id: int):
        """Obtiene un producto por su identificador.

        :param id: Identificador del producto.
        :returns: Instancia Producto o None si no existe.
        """

        return self.db.query(Producto).filter(Producto.id == id).first()

    def get_by_name(self, nombre: str):
        """Obtiene un producto por su nombre.

        :param nombre: Nombre del producto (búsqueda por igualdad).
        :returns: Instancia Producto o None si no existe.
        """

        return self.db.query(Producto).filter(Producto.nombre == nombre).first()
    
    def get_by_barcode(self, codBarras: str):
        return self.db.query(Producto).filter(Producto.codBarras == codBarras).first()

    def update(self, id: int, producto_data: ProductoCreate):
        """Actualiza un producto existente.

        :param id: Identificador del producto a actualizar.
        :param producto_data: Nuevos datos del producto.
        :returns: Instancia Producto actualizada o None si no existe.
        """

        producto = self.get_by_id(id)
        if not producto:
            return None
        data = producto_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(producto, key, value)
        self.db.commit()
        self.db.refresh(producto)
        return producto

    def delete(self, id: int):
        """Elimina un producto.

        :param id: Identificador del producto a eliminar.
        :returns: Instancia Producto eliminada o None si no existe.
        """

        producto = self.get_by_id(id)
        if producto:
            self.db.delete(producto)
            self.db.commit()
        return producto