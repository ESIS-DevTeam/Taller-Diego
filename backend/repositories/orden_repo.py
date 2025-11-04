from sqlalchemy.orm import Session
from db.models import Orden
from sqlalchemy import Date, cast
from db.models import OrdenServicio, Servicio

class OrdenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, fecha):
        orden = Orden(fecha=fecha)
        self.db.add(orden)
        self.db.commit()
        self.db.refresh(orden)
        return orden

    def create_with_services(self, fecha, servicios: list[dict]):
        orden = Orden(fecha=fecha)
        self.db.add(orden)
        try:
            # flush to get orden.id without committing
            self.db.flush()

            for item in servicios:
                sid = item.get("servicio_id")
                cantidad = item.get("cantidad", 0)
                if not sid or cantidad <= 0:
                    raise ValueError("Servicio o cantidad inválida")

                servicio = self.db.query(Servicio).filter(Servicio.id == sid).with_for_update().first()
                if not servicio:
                    raise ValueError(f"Servicio con id {sid} no existe")
                if servicio.stock < cantidad:
                    raise ValueError(f"Stock insuficiente.")

                # create relation orden-servicio
                os = OrdenServicio(orden_id=orden.id, servicio_id=sid, cantidad=cantidad)
                self.db.add(os)

                # update stock
                servicio.stock = servicio.stock - cantidad

            # commit everything
            self.db.commit()
            # refresh to load relationships
            self.db.refresh(orden)
            return orden
        except Exception:
            self.db.rollback()
            raise

    def get_all(self):
        return self.db.query(Orden).all()

    def get_by_id(self, id: int):
        return self.db.query(Orden).filter(Orden.id == id).first()

    def delete(self, id: int):
        orden = self.get_by_id(id)
        if orden:
            self.db.delete(orden)
            self.db.commit()
            return True
        return False

    def get_by_fecha(self, fecha):
        return self.db.query(Orden).filter(
            cast(Orden.fecha, Date) == fecha
        ).all()