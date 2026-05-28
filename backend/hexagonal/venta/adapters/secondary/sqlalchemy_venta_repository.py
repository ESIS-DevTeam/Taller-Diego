from datetime import datetime
from sqlalchemy import Date, cast
from sqlalchemy.orm import Session

from db.models import Venta, VentaProducto, Producto
from backend.domain.venta import Venta as DomainVenta
from hexagonal.venta.ports.venta_driven_port import VentaRepository


class SqlAlchemyVentaRepository(VentaRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, fecha: datetime):
        venta = Venta(fecha=fecha)
        self.db.add(venta)
        self.db.commit()
        self.db.refresh(venta)
        return venta

    def create_with_products(self, fecha: datetime, productos: list[dict]):
        venta = Venta(fecha=fecha)
        self.db.add(venta)
        try:
            self.db.flush()
            for item in productos:
                pid = item.get("producto_id")
                cantidad = item.get("cantidad", 0)
                if not pid or cantidad <= 0:
                    raise ValueError("Producto o cantidad inválida")
                producto = self.db.query(Producto).filter(Producto.id == pid).with_for_update().first()
                if not producto:
                    raise ValueError(f"Producto con id {pid} no existe")
                if producto.stock < cantidad:
                    raise ValueError(f"Stock insuficiente para producto {pid}")
                vp = VentaProducto(venta_id=venta.id, producto_id=pid, cantidad=cantidad)
                domain = DomainVenta(fecha=venta.fecha, productos=venta.productos)
                domain.agregar_producto(vp)
                producto.stock = producto.stock - cantidad
            self.db.commit()
            self.db.refresh(venta)
            return venta
        except Exception:
            self.db.rollback()
            raise

    def save(self, venta: Venta) -> Venta:
        self.db.merge(venta)
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
        return self.db.query(Venta).filter(cast(Venta.fecha, Date) == fecha.date()).all()
