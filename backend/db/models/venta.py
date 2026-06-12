from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import relationship
from db.base import Base
from core.value_objects import Cantidad, CantidadProductos
from datetime import datetime, timezone

# Delegar validaciones y comportamiento al dominio puro
from domain.venta import Venta as DomainVenta


class Venta(Base):
    
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True)
    fecha = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    productos = relationship("VentaProducto", back_populates="venta", cascade="all, delete-orphan")

    def __init__(self, fecha=None):

        self.fecha = fecha or datetime.now(timezone.utc)

    def agregar_producto(self, venta_producto: 'VentaProducto') -> None:
        # Crear un Aggregate Root de dominio que comparte la lista de productos
        domain = DomainVenta(fecha=self.fecha, productos=self.productos)
        domain.agregar_producto(venta_producto)

    def remover_producto(self, venta_producto: 'VentaProducto') -> None:
        domain = DomainVenta(fecha=self.fecha, productos=self.productos)
        domain.remover_producto(venta_producto)

    def obtener_cantidad_productos(self) -> int:
        domain = DomainVenta(fecha=self.fecha, productos=self.productos)
        return domain.obtener_cantidad_productos()

    def tiene_productos(self) -> bool:
        domain = DomainVenta(fecha=self.fecha, productos=self.productos)
        return domain.tiene_productos()

    def obtener_fecha(self) -> datetime:
        """Retorna la fecha de la venta."""
        return self.fecha

    def calcular_total(self) -> float:
        domain = DomainVenta(fecha=self.fecha, productos=self.productos)
        return domain.calcular_total()

    def obtener_cantidad_total_items(self) -> int:
        domain = DomainVenta(fecha=self.fecha, productos=self.productos)
        return domain.obtener_cantidad_total_items()