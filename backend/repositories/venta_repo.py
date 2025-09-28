from sqlalchemy.orm import Session
from db.models import Venta
from datetime import datetime

class VentaRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, fecha: datetime):
        venta = Venta(fecha=fecha)
        self.db.add(venta)
        self.db.commit()
        self.db.refresh(venta)
        return venta

    def get_all(self):
        return self.db.query(Venta).all()

    def get_by_id(self, id: int):
        return self.db.query(Venta).filter(Venta.id == id).first()

    def delete(self, id: int):
        venta = self.get_by_id(id)
        if venta:
            self.db.delete(venta)
            self.db.commit()
            return True
        return False

    def get_by_fecha(self, fecha: datetime):
        return self.db.query(Venta).filter(Venta.fecha == fecha).all()
