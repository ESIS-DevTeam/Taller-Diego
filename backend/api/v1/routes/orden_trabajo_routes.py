from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.base import SessionLocal
from services.orden_trabajo_service import OrdenTrabajoService
from schemas.orden_trabajo_schema import (
    RecepcionCreate, OrdenTrabajoResponse, VehiculoSugerencia,
    VehiculoResponse, HistorialVehiculoResponse, ServicioItemCreate,
    ProductoItemCreate, PagoCreate, CambioEstadoRequest, Proforma2Update,
)
from core.auth import require_supabase_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_service(db: Session = Depends(get_db)) -> OrdenTrabajoService:
    return OrdenTrabajoService(db)


def _ejecutar(fn):
    """Traduce errores de dominio a HTTP: LookupError→404, ValueError→400."""
    try:
        return fn()
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- Vehículos (búsqueda / autocompletado) ----------

@router.get("/vehiculos/buscar", response_model=list[VehiculoSugerencia],
            summary="Búsqueda en vivo por placa o nombre del dueño")
def buscar_vehiculos(q: str = Query("", description="Texto parcial de placa o nombre"),
                     service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.buscar_vehiculos(q))


@router.get("/vehiculos/{placa}", response_model=VehiculoResponse,
            summary="Datos de vehículo y dueño por placa (autocompletar recepción)")
def get_vehiculo(placa: str,
                 service: OrdenTrabajoService = Depends(get_service)):
    vehiculo, _ = _ejecutar(lambda: service.get_vehiculo(placa))
    return vehiculo


@router.get("/historial/{placa}", response_model=HistorialVehiculoResponse,
            summary="Historial de visitas del vehículo por placa")
def historial(placa: str,
              service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.historial(placa))


# ---------- Órdenes de trabajo ----------

@router.post("/", response_model=OrdenTrabajoResponse, status_code=201,
             dependencies=[Depends(require_supabase_user)],
             summary="Recepción rápida de vehículo (crea la orden y Proforma 1)")
def crear_recepcion(datos: RecepcionCreate,
                    service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.crear_recepcion(datos.model_dump()))


@router.get("/", response_model=list[OrdenTrabajoResponse],
            summary="Listar órdenes filtrando por estados (coma-separados)")
def listar(estado: str | None = Query(
        None, description="ej: en_proceso,esperando_repuestos,listo"),
        service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.listar(estado))


@router.get("/{orden_id}", response_model=OrdenTrabajoResponse,
            summary="Detalle completo de la orden (alimenta Proformas 1 y 2)")
def detalle(orden_id: int,
            service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.detalle(orden_id))


# ---------- Ítems ----------

@router.post("/{orden_id}/servicios", response_model=OrdenTrabajoResponse,
             dependencies=[Depends(require_supabase_user)],
             summary="Agregar servicio a la orden")
def agregar_servicio(orden_id: int, item: ServicioItemCreate,
                     service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.agregar_servicio(orden_id, item.model_dump()))


@router.post("/{orden_id}/productos", response_model=OrdenTrabajoResponse,
             dependencies=[Depends(require_supabase_user)],
             summary="Agregar producto del inventario (valida y descuenta stock)")
def agregar_producto(orden_id: int, item: ProductoItemCreate,
                     service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.agregar_producto(
        orden_id, item.producto_id, item.cantidad))


@router.delete("/{orden_id}/servicios/{item_id}",
               response_model=OrdenTrabajoResponse,
               dependencies=[Depends(require_supabase_user)],
               summary="Quitar servicio de la orden")
def quitar_servicio(orden_id: int, item_id: int,
                    service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.quitar_servicio(orden_id, item_id))


@router.delete("/{orden_id}/productos/{item_id}",
               response_model=OrdenTrabajoResponse,
               dependencies=[Depends(require_supabase_user)],
               summary="Quitar producto de la orden (repone stock)")
def quitar_producto(orden_id: int, item_id: int,
                    service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.quitar_producto(orden_id, item_id))


# ---------- Estados / pagos / proforma 2 ----------

@router.patch("/{orden_id}/estado", response_model=OrdenTrabajoResponse,
              dependencies=[Depends(require_supabase_user)],
              summary="Cambiar estado (listo, entregado, cancelado, volver a pendientes)")
def cambiar_estado(orden_id: int, body: CambioEstadoRequest,
                   service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.cambiar_estado(
        orden_id, body.estado, body.entregar_con_deuda))


@router.post("/{orden_id}/pagos", response_model=OrdenTrabajoResponse,
             dependencies=[Depends(require_supabase_user)],
             summary="Registrar abono (efectivo o tarjeta, no excede el saldo)")
def registrar_pago(orden_id: int, pago: PagoCreate,
                   service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.registrar_pago(
        orden_id, pago.monto, pago.metodo))


@router.put("/{orden_id}/proforma2", response_model=OrdenTrabajoResponse,
            dependencies=[Depends(require_supabase_user)],
            summary="Completar datos ampliados de la Proforma 2")
def actualizar_proforma2(orden_id: int, datos: Proforma2Update,
                         service: OrdenTrabajoService = Depends(get_service)):
    return _ejecutar(lambda: service.actualizar_proforma2(
        orden_id, datos.model_dump()))
