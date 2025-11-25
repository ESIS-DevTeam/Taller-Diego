"""Repositorio de Ventas - Refactorizado con Genéricos"""
from datetime import datetime

from sqlalchemy import Date, cast
from sqlalchemy.orm import Session

from db.models import Venta
from db.models import VentaProducto
from db.models import Producto
from repositories.base_repository import BaseRepository


class VentaRepository(BaseRepository[Venta]):
    """
    Repositorio específico para Ventas.
    Hereda operaciones CRUD básicas y agrega lógica compleja de transacciones.
    """
    
    def __init__(self, db: Session):
        super().__init__(Venta, db)

    def create_simple(self, fecha: datetime):
        """Crea una venta simple sin productos (backwards-compatible)."""
        venta = Venta(fecha=fecha)
        return super().create(venta)

    def create_with_products(self, fecha: datetime, productos: list[dict]):

        venta = Venta(fecha=fecha)
        self.db.add(venta)
        try:
            # flush to get venta.id without committing
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
                    raise ValueError(f"Stock insuficiente.")
                
                # create relation venta-producto
                vp = VentaProducto(venta_id=venta.id, producto_id=pid, cantidad=cantidad)
                self.db.add(vp)

                # update stock
                producto.stock = producto.stock - cantidad

            # commit everything
            self.db.commit()
            # refresh to load relationships
            self.db.refresh(venta)
            return venta
        except Exception:
            self.db.rollback()
            raise

    def get_by_fecha(self, fecha: datetime):
        return self.db.query(Venta).filter(
            cast(Venta.fecha, Date) == fecha.date()
        ).all()
