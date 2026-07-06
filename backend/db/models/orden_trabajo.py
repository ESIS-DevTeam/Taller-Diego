from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from db.base import Base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone


class OrdenTrabajo(Base):
    """Orden de trabajo del taller (recepción de vehículo → entrega).

    Aggregate root del flujo operativo: diagnóstico inicial (Proforma 1),
    servicios y repuestos usados, pagos parciales y estados
    en_proceso → esperando_repuestos → listo → entregado (o cancelado).
    """

    __tablename__ = "ordenes_trabajo"

    id = Column(Integer, primary_key=True)
    codigo = Column(String, nullable=False, unique=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    mecanico_id = Column(Integer, ForeignKey("empleados.id"), nullable=True)
    diagnostico = Column(Text, nullable=False)
    estado = Column(String, nullable=False, default="en_proceso", index=True)
    fecha_ingreso = Column(DateTime, nullable=False,
                           default=lambda: datetime.now(timezone.utc))
    fecha_listo = Column(DateTime, nullable=True)
    fecha_entrega = Column(DateTime, nullable=True)
    garantia_dias = Column(Integer, nullable=False, default=180)
    proforma2_completa = Column(Boolean, nullable=False, default=False)
    entregado_con_deuda = Column(Boolean, nullable=False, default=False)

    vehiculo = relationship("Vehiculo", back_populates="ordenes_trabajo")
    mecanico = relationship("Empleado")
    servicios = relationship("OrdenTrabajoServicio", back_populates="orden",
                             cascade="all, delete-orphan")
    productos = relationship("OrdenTrabajoProducto", back_populates="orden",
                             cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="orden",
                         cascade="all, delete-orphan")

    # ------ Totales calculados (no almacenados) ------

    def total(self) -> int:
        total_servicios = sum(s.precio for s in self.servicios)
        total_productos = sum(
            p.precio_unitario * p.cantidad for p in self.productos)
        return total_servicios + total_productos

    def abonado(self) -> int:
        return sum(p.monto for p in self.pagos)

    def saldo(self) -> int:
        return self.total() - self.abonado()

    def estado_pago(self) -> str:
        """pendiente | parcial | completado según los abonos registrados."""
        total = self.total()
        abonado = self.abonado()
        if total > 0 and abonado >= total:
            return "completado"
        if abonado > 0:
            return "parcial"
        return "pendiente"


class OrdenTrabajoServicio(Base):
    """Servicio incluido en una orden de trabajo. Guarda snapshot del
    nombre y precio para no alterar registros históricos si el catálogo
    cambia. `servicio_id` es opcional (servicio sugerido escrito libre)."""

    __tablename__ = "orden_trabajo_servicios"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey(
        "ordenes_trabajo.id"), nullable=False)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True)
    nombre = Column(String, nullable=False)
    precio = Column(Integer, nullable=False, default=0)
    es_extra = Column(Boolean, nullable=False, default=False)

    orden = relationship("OrdenTrabajo", back_populates="servicios")
    servicio = relationship("Servicio")


class OrdenTrabajoProducto(Base):
    """Repuesto/producto del inventario usado en una orden de trabajo.
    Descuenta stock al agregarse y lo repone si se quita o se cancela
    la orden. Guarda snapshot del precio de venta."""

    __tablename__ = "orden_trabajo_productos"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey(
        "ordenes_trabajo.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Integer, nullable=False, default=0)

    orden = relationship("OrdenTrabajo", back_populates="productos")
    producto = relationship("Producto")
