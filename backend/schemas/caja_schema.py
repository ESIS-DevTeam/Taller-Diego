from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime


# ---------- Notas de pago ----------

class NotaPagoCreate(BaseModel):
    concepto: str = Field(min_length=1)
    proveedor: str = Field(min_length=1)
    tipo: str = "compra"  # compra | gasto
    monto: int = Field(gt=0)
    fecha_limite: date
    observacion: str | None = None


class NotaPagoResponse(NotaPagoCreate):
    id: int
    fecha_emision: date
    estado: str
    fecha_pago: datetime | None = None
    # Calculado: vigente | por_vencer | vencida | pagada
    estado_visual: str = "vigente"
    model_config = ConfigDict(from_attributes=True)


class NotasAlertas(BaseModel):
    """Resumen para la franja de alertas de la vista."""
    por_vencer: int
    vencidas: int
    mensaje: str | None = None


class NotasPagoLista(BaseModel):
    notas: list[NotaPagoResponse]
    alertas: NotasAlertas


# ---------- Cierre de caja diario ----------

class LineaCierre(BaseModel):
    etiqueta: str
    monto: int
    cantidad: int | None = None


class CierreCajaResponse(BaseModel):
    fecha: date
    # Totales
    total_ingresos: int
    total_egresos: int
    balance: int
    # Contadores para las tarjetas
    num_ventas: int
    num_servicios_cobrados: int
    num_compras: int
    num_gastos: int
    # Desglose
    ingresos: list[LineaCierre]
    egresos: list[LineaCierre]
    # Desglose por método de pago (efectivo/tarjeta) de los cobros de órdenes
    cobros_efectivo: int
    cobros_tarjeta: int


# ---------- Reporte de ventas ----------

class PuntoReporte(BaseModel):
    """Un intervalo del reporte (un día, una semana o un mes)."""
    etiqueta: str          # "Lun 29", "Semana 27", "Julio 2026"
    fecha_inicio: date
    productos: int         # $ vendido en productos
    servicios: int         # $ cobrado por servicios (abonos de órdenes)
    total: int
    transacciones: int


class ResumenAmigable(BaseModel):
    """Datos en lenguaje simple para que el cliente entienda su reporte."""
    mejor_dia: str | None = None
    mejor_dia_monto: int = 0
    porcentaje_servicios: int = 0
    porcentaje_productos: int = 0
    promedio_por_transaccion: int = 0
    comparacion_anterior: str | None = None


class ReporteVentasResponse(BaseModel):
    desde: date
    hasta: date
    agrupar: str
    puntos: list[PuntoReporte]
    total_productos: int
    total_servicios: int
    total_general: int
    total_transacciones: int
    efectivo: int
    tarjeta: int
    resumen: ResumenAmigable


# ---------- Clientes deudores ----------

class DeudorResponse(BaseModel):
    orden_id: int
    codigo: str
    cliente_nombre: str
    cliente_celular: str
    placa: str
    monto_adeudado: int
    fecha_entrega: datetime | None = None
    fecha_vencimiento: date | None = None
    estado: str  # pendiente | vencida


class DeudoresLista(BaseModel):
    deudores: list[DeudorResponse]
    total_adeudado: int
    clientes_con_deuda: int
    deudas_vencidas: int
