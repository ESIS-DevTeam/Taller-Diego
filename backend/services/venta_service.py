from sqlalchemy.orm import Session
from repositories.venta_repo import VentaRepository
from schemas.venta_schema import VentaCreate
from datetime import datetime

class VentaService:
    
    def __init__(self, db: Session):
        self.repo = VentaRepository(db)

    def create_venta(self, data: VentaCreate):
        return self.repo.create(data.fecha)

    def list_ventas(self):
        return self.repo.get_all()

    def get_by_id(self, id: int):
        return self.repo.get_by_id(id)

    def get_by_fecha(self, fecha: datetime):
        return self.repo.get_by_fecha(fecha)

    def delete_venta(self, id: int):
        return self.repo.delete(id)
