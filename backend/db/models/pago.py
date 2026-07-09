from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from db.base import Base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone


class Pago(Base):
    """Abono (parcial o total) registrado sobre una orden de trabajo.
    Método restringido a efectivo o tarjeta (validado en el service con
    el Value Object MetodoPago)."""

    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True)
    orden_id = Column(Integer, ForeignKey(
        "ordenes_trabajo.id"), nullable=False)
    monto = Column(Integer, nullable=False)
    metodo = Column(String, nullable=False)
    fecha = Column(DateTime, nullable=False,
                   default=lambda: datetime.now(timezone.utc))

    orden = relationship("OrdenTrabajo", back_populates="pagos")
