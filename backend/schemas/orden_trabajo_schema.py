from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


# ---------- Cliente / Vehículo ----------

class ClienteResponse(BaseModel):
    id: int
    nombre: str
    celular: str
    correo: str | None = None
    model_config = ConfigDict(from_attributes=True)


class VehiculoResponse(BaseModel):
    id: int
    placa: str
    modelo: str | None = None
    anio: str | None = None
    color: str | None = None
    kilometraje: str | None = None
    cliente: ClienteResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class VehiculoSugerencia(BaseModel):
    """Resultado de búsqueda en vivo por placa o nombre del dueño."""
    placa: str
    modelo: str | None = None
    anio: str | None = None
    cliente_nombre: str
    cliente_celular: str
    visitas: int


# ---------- Ítems de la orden ----------

class ServicioItemCreate(BaseModel):
    servicio_id: int | None = None
    nombre: str = Field(min_length=1)
    precio: int = Field(ge=0)
    es_extra: bool = False


class ServicioItemResponse(ServicioItemCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ProductoItemCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)


class ProductoItemResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: int
    nombre: str | None = None
    model_config = ConfigDict(from_attributes=True)


# ---------- Pagos ----------

class PagoCreate(BaseModel):
    monto: int = Field(gt=0)
    metodo: str


class PagoResponse(PagoCreate):
    id: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------- Orden de trabajo ----------

class RecepcionCreate(BaseModel):
    """Datos mínimos de la recepción rápida (Proforma 1)."""
    placa: str = Field(min_length=1)
    nombre_cliente: str = Field(min_length=1)
    celular: str = Field(min_length=1)
    diagnostico: str = Field(min_length=1)
    modelo: str | None = None
    anio: str | None = None
    mecanico_id: int | None = None
    servicio_sugerido: ServicioItemCreate | None = None


class MecanicoResponse(BaseModel):
    id: int
    nombres: str
    apellidos: str
    model_config = ConfigDict(from_attributes=True)


class OrdenTrabajoResponse(BaseModel):
    id: int
    codigo: str
    diagnostico: str
    estado: str
    fecha_ingreso: datetime
    fecha_listo: datetime | None = None
    fecha_entrega: datetime | None = None
    garantia_dias: int
    proforma2_completa: bool
    entregado_con_deuda: bool
    vehiculo: VehiculoResponse | None = None
    mecanico: MecanicoResponse | None = None
    servicios: list[ServicioItemResponse] = []
    productos: list[ProductoItemResponse] = []
    pagos: list[PagoResponse] = []
    # Totales calculados
    total: int = 0
    abonado: int = 0
    saldo: int = 0
    estado_pago: str = "pendiente"

    model_config = ConfigDict(from_attributes=True)


class CambioEstadoRequest(BaseModel):
    estado: str
    entregar_con_deuda: bool = False


class Proforma2Update(BaseModel):
    """Datos ampliados que completa la cajera en la Proforma 2."""
    color: str | None = None
    kilometraje: str | None = None
    correo: str | None = None
    marcar_completa: bool = True


class HistorialVehiculoResponse(BaseModel):
    vehiculo: VehiculoResponse
    visitas: list[OrdenTrabajoResponse]
    total_visitas: int
