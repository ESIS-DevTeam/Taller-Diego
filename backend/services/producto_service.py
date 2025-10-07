from sqlalchemy.orm import Session
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate

class ProductoService:

    def __init__(self, db: Session):
        self.repo = ProductoRepository(db)
    
    def create_producto(self, data: ProductoCreate):
        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe un producto con ese nombre")
        producto_data = data
        producto = self.repo.create(producto_data)
        return producto
    
    def list_productos(self):
        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        return self.repo.get_by_id(id)
    
    def get_by_name(self, nombre: str):
        return self.repo.get_by_name(nombre)
    
    def update_producto(self, id: int, data: ProductoCreate):
        return self.repo.update(id, data)
    
    def delete_producto(self, id: int):
        return self.repo.delete(id)