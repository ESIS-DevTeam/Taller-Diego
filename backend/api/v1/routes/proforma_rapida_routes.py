import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from core.auth import require_supabase_user
from db.base import SessionLocal
from db.models.proforma_rapida import ProformaRapida
from schemas.proforma_rapida_schema import (
    ProformaRapidaCreate,
    ProformaRapidaEstadoUpdate,
    ProformaRapidaResponse,
)

router = APIRouter(tags=["Proformas Rapidas"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _decode_productos(value: str | None) -> list[dict]:
    if not value:
        return []
    try:
        data = json.loads(value)
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def _to_response(proforma: ProformaRapida) -> ProformaRapidaResponse:
    return ProformaRapidaResponse(
        id=proforma.id,
        codigo=proforma.codigo or f"P1-{proforma.id:06d}",
        placa=proforma.placa,
        cliente_nombre=proforma.cliente_nombre,
        celular=proforma.celular,
        diagnostico=proforma.diagnostico,
        precio_estimado=proforma.precio_estimado,
        servicio_sugerido=proforma.servicio_sugerido,
        modelo_vehiculo=proforma.modelo_vehiculo,
        productos=_decode_productos(proforma.productos_json),
        estado=proforma.estado,
        taller_nombre=proforma.taller_nombre,
        taller_direccion=proforma.taller_direccion,
        taller_correo=proforma.taller_correo,
        taller_web=proforma.taller_web,
        fecha_creacion=proforma.fecha_creacion,
        fecha_pendiente=proforma.fecha_pendiente,
        fecha_revisado=proforma.fecha_revisado,
    )


@router.post(
    "/rapidas",
    response_model=ProformaRapidaResponse,
    dependencies=[Depends(require_supabase_user)],
    summary="Crear Proforma 1 rapida",
)
def create_proforma_rapida(data: ProformaRapidaCreate, db: Session = Depends(get_db)):
    productos = [item.model_dump() for item in data.productos]
    proforma = ProformaRapida(
        placa=data.placa,
        cliente_nombre=data.cliente_nombre,
        celular=data.celular,
        diagnostico=data.diagnostico,
        precio_estimado=data.precio_estimado,
        servicio_sugerido=data.servicio_sugerido,
        modelo_vehiculo=data.modelo_vehiculo,
        productos_json=json.dumps(productos, ensure_ascii=False),
        estado="pendiente",
        taller_nombre="TALLER DE DIEGO",
        taller_direccion="Datos del taller",
        taller_correo="correo@tallerdiego.cl",
        taller_web="www.tallerdiego.cl",
    )
    db.add(proforma)
    db.flush()
    proforma.codigo = f"P1-{proforma.id:06d}"
    db.commit()
    db.refresh(proforma)
    return _to_response(proforma)


@router.get("/rapidas", response_model=list[ProformaRapidaResponse], summary="Listar proformas rapidas")
def list_proformas_rapidas(
    estado: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(ProformaRapida)
    if estado:
        query = query.filter(ProformaRapida.estado == estado.strip().lower())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ProformaRapida.placa.ilike(pattern),
                ProformaRapida.cliente_nombre.ilike(pattern),
            )
        )
    proformas = query.order_by(ProformaRapida.fecha_creacion.desc()).all()
    return [_to_response(proforma) for proforma in proformas]


@router.get("/rapidas/{proforma_id}", response_model=ProformaRapidaResponse, summary="Obtener Proforma 1")
def get_proforma_rapida(proforma_id: int, db: Session = Depends(get_db)):
    proforma = db.query(ProformaRapida).filter(ProformaRapida.id == proforma_id).first()
    if not proforma:
        raise HTTPException(status_code=404, detail="Proforma no encontrada")
    return _to_response(proforma)


@router.put(
    "/rapidas/{proforma_id}/estado",
    response_model=ProformaRapidaResponse,
    dependencies=[Depends(require_supabase_user)],
    summary="Cambiar estado de Proforma 1",
)
def update_proforma_estado(
    proforma_id: int,
    data: ProformaRapidaEstadoUpdate,
    db: Session = Depends(get_db),
):
    proforma = db.query(ProformaRapida).filter(ProformaRapida.id == proforma_id).first()
    if not proforma:
        raise HTTPException(status_code=404, detail="Proforma no encontrada")

    proforma.estado = data.estado
    if data.estado == "revisado" and proforma.fecha_revisado is None:
        proforma.fecha_revisado = datetime.now(timezone.utc)

    db.commit()
    db.refresh(proforma)
    return _to_response(proforma)
