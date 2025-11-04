from sqlalchemy.orm import Session
import logging
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate

logger = logging.getLogger(__name__)

class ProductoService:

    def __init__(self, db: Session):
        self.repo = ProductoRepository(db)
    
    def create_producto(self, data: ProductoCreate):
        try:
            if self.repo.get_by_name(data.nombre):
                # Business rule: unique product name
                raise ValueError("Ya existe un producto con ese nombre")
            producto_data = data
            producto = self.repo.create(producto_data)
            return producto
        except ValueError:
            # Propagate business errors (duplicate name)
            raise
        except Exception as e:
            logger.exception("Error creando producto")
            raise RuntimeError("Ocurrió un error al crear el producto") from e
    
    def list_productos(self):
        try:
            return self.repo.get_all()
        except Exception as e:
            logger.exception("Error listando productos")
            raise RuntimeError("Ocurrió un error al listar los productos") from e
    
    def get_by_id(self, id: int):
        try:
            return self.repo.get_by_id(id)
        except Exception as e:
            logger.exception("Error obteniendo producto por id")
            raise RuntimeError("Ocurrió un error al obtener el producto") from e
    
    def get_by_name(self, nombre: str):
        try:
            return self.repo.get_by_name(nombre)
        except Exception as e:
            logger.exception("Error obteniendo producto por nombre")
            raise RuntimeError("Ocurrió un error al obtener el producto") from e
    
    def update_producto(self, id: int, data: ProductoCreate):
        try:
            producto = self.repo.update(id, data)
            return producto
        except Exception as e:
            logger.exception("Error actualizando producto")
            raise RuntimeError("Ocurrió un error al actualizar el producto") from e
    
    def delete_producto(self, id: int):
        try:
            producto = self.repo.delete(id)
            return producto
        except Exception as e:
            logger.exception("Error eliminando producto")
            raise RuntimeError("Ocurrió un error al eliminar el producto") from e