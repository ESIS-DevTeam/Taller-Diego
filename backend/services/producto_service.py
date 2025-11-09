from sqlalchemy.orm import Session
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate

class ProductoService:

    def __init__(self, db: Session):
        self.repo = ProductoRepository(db)
    
    def create_producto(self, data: ProductoCreate):
        producto_data = data
        producto = self.repo.create(producto_data)
        return producto
    
    def list_productos(self, filtros: dict | None = None):
        if filtros:
            return self.repo.get_by_filters(filtros)
        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        return self.repo.get_by_id(id)
    
    def update_producto(self, id: int, data: ProductoCreate):
        return self.repo.update(id, data)
    
    def delete_producto(self, id: int):
        return self.repo.delete(id)

    def count_low_stock(self) -> int:
        return self.repo.count_low_stock()