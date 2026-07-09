from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from db.base import Base
from datetime import date


class NotaPago(Base):
    """Nota de pago del taller: compras a proveedores o gastos pequeños,
    con fecha límite para recibir alertas de vencimiento.

    El estado almacenado es `pendiente` o `pagada`; el matiz
    vigente / por vencer / vencida se calcula con la fecha límite.
    """

    __tablename__ = "notas_pago"

    id = Column(Integer, primary_key=True)
    concepto = Column(String, nullable=False)
    proveedor = Column(String, nullable=False)
    tipo = Column(String, nullable=False, default="compra")  # compra | gasto
    monto = Column(Integer, nullable=False)
    fecha_emision = Column(Date, nullable=False, default=date.today)
    fecha_limite = Column(Date, nullable=False)
    estado = Column(String, nullable=False, default="pendiente")  # pendiente | pagada
    fecha_pago = Column(DateTime, nullable=True)
    observacion = Column(Text, nullable=True)
