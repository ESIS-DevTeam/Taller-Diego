from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from db.base import SessionLocal
from services.caja_service import CajaService
from schemas.caja_schema import (
    CierreCajaResponse, NotaPagoCreate, NotaPagoResponse, NotasPagoLista,
    ReporteVentasResponse, DeudoresLista,
)
from core.auth import require_supabase_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_service(db: Session = Depends(get_db)) -> CajaService:
    return CajaService(db)


def _ejecutar(fn):
    try:
        return fn()
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- Cierre diario ----------

@router.get("/cierre", response_model=CierreCajaResponse,
            summary="Cierre de caja del día: ingresos, egresos y balance")
def cierre_diario(fecha: date | None = Query(None, description="YYYY-MM-DD, por defecto hoy"),
                  service: CajaService = Depends(get_service)):
    return _ejecutar(lambda: service.cierre_diario(fecha or date.today()))


# ---------- Notas de pago ----------

@router.get("/notas", response_model=NotasPagoLista,
            summary="Listar notas de pago con alertas de vencimiento")
def listar_notas(estado: str | None = Query(
        None, description="todas | vigente | por_vencer | vencida | pagada"),
        service: CajaService = Depends(get_service)):
    return _ejecutar(lambda: service.listar_notas(estado))


@router.post("/notas", response_model=NotaPagoResponse, status_code=201,
             dependencies=[Depends(require_supabase_user)],
             summary="Registrar nota de pago (compra a proveedor o gasto)")
def crear_nota(datos: NotaPagoCreate,
               service: CajaService = Depends(get_service)):
    return _ejecutar(lambda: service.crear_nota(datos.model_dump()))


@router.patch("/notas/{nota_id}/pagar", response_model=NotaPagoResponse,
              dependencies=[Depends(require_supabase_user)],
              summary="Marcar nota como pagada (se registra como egreso del día)")
def pagar_nota(nota_id: int,
               service: CajaService = Depends(get_service)):
    return _ejecutar(lambda: service.pagar_nota(nota_id))


@router.delete("/notas/{nota_id}", status_code=204,
               dependencies=[Depends(require_supabase_user)],
               summary="Eliminar nota pendiente (las pagadas no se pueden eliminar)")
def eliminar_nota(nota_id: int,
                  service: CajaService = Depends(get_service)):
    _ejecutar(lambda: service.eliminar_nota(nota_id))


# ---------- Reporte de ventas ----------

@router.get("/reporte-ventas", response_model=ReporteVentasResponse,
            summary="Reporte de ventas por día, semana o mes (productos vs servicios)")
def reporte_ventas(desde: date, hasta: date,
                   agrupar: str = Query("dia", description="dia | semana | mes"),
                   service: CajaService = Depends(get_service)):
    return _ejecutar(lambda: service.reporte_ventas(desde, hasta, agrupar))


# ---------- Clientes deudores ----------

@router.get("/deudores", response_model=DeudoresLista,
            summary="Clientes con saldo pendiente (entregas con deuda)")
def deudores(service: CajaService = Depends(get_service)):
    return _ejecutar(lambda: service.deudores())
