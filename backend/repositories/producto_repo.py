from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db.models import Producto
from schemas.producto_schema import ProductoCreate

class ProductoRepository:

    def __init__(self, db: Session):
        self.db = db
    
    def create(self, producto_data: ProductoCreate):
        try:
            producto = Producto(**producto_data.model_dump())
            self.db.add(producto)
            self.db.commit()
            self.db.refresh(producto)
            return producto
        except SQLAlchemyError as e:
            # Rollback to keep the session usable and raise a generic error
            self.db.rollback()
            raise RuntimeError("Error de base de datos al crear producto") from e

    def get_all(self):
        try:
            return self.db.query(Producto).all()
        except SQLAlchemyError as e:
            raise RuntimeError("Error de base de datos al listar productos") from e
    
    def get_by_id(self, id: int):
        try:
            return self.db.query(Producto).filter(Producto.id == id).first()
        except SQLAlchemyError as e:
            raise RuntimeError("Error de base de datos al obtener producto por id") from e
    
    def get_by_name(self, nombre: str):
        try:
            return self.db.query(Producto).filter(Producto.nombre == nombre).first()
        except SQLAlchemyError as e:
            raise RuntimeError("Error de base de datos al obtener producto por nombre") from e

    def update(self, id: int, producto_data: ProductoCreate):
        try:
            producto = self.get_by_id(id)
            if not producto:
                return None
            data = producto_data.model_dump(exclude_unset=True)
            for key, value in data.items():
                setattr(producto, key, value)
            self.db.commit()
            self.db.refresh(producto)
            return producto
        except SQLAlchemyError as e:
            self.db.rollback()
            raise RuntimeError("Error de base de datos al actualizar producto") from e
    
    def delete(self, id: int):
        try:
            producto = self.get_by_id(id)
            if producto:
                self.db.delete(producto)
                self.db.commit()
            return producto
        except SQLAlchemyError as e:
            self.db.rollback()
            raise RuntimeError("Error de base de datos al eliminar producto") from e