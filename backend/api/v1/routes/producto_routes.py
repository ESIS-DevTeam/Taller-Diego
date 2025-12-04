from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.producto_schema import ProductoCreate, ProductoResponse
from services.producto_service import ProductoService
from services.auditoria_service import AuditoriaService
from core.auditoria_utils import obtener_ip_cliente, obtener_usuario_actual

router = APIRouter(tags=["Productos"])



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 

def get_producto_service(db: Session = Depends(get_db)) -> ProductoService:
    return ProductoService(db)

@router.post("/", response_model=ProductoResponse)
def create_producto(
    data: ProductoCreate,
    request: Request,
    service: ProductoService = Depends(get_producto_service),
    db: Session = Depends(get_db)
):
    producto = service.create_producto(data)
    
    # Registrar en auditoría
    AuditoriaService.registrar_accion(
        db=db,
        modulo="inventario",
        accion="CREATE",
        tabla="productos",
        registro_id=producto.id,
        usuario=obtener_usuario_actual(request),
        datos_nuevos={
            "nombre": producto.nombre,
            "precioCompra": float(producto.precioCompra),
            "precioVenta": float(producto.precioVenta),
            "stock": producto.stock
        },
        descripcion=f"Producto '{producto.nombre}' creado",
        ip_address=obtener_ip_cliente(request)
    )
    
    return producto


@router.get("/", response_model=list[ProductoResponse])
def list_productos(
    service: ProductoService = Depends(get_producto_service)
):
    return service.list_productos()


@router.get("/barcode/{codBarras}", response_model=ProductoResponse)
def get_producto_by_barcode(codBarras: str, service: ProductoService = Depends(get_producto_service)):
    producto = service.get_by_barcode(codBarras)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    producto = service.get_by_id(id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.put("/{id}", response_model=ProductoResponse)
def update_producto(
    id: int,
    data: ProductoCreate,
    request: Request,
    service: ProductoService = Depends(get_producto_service),
    db: Session = Depends(get_db)
):
    # Obtener datos anteriores
    producto_anterior = service.get_by_id(id)
    if not producto_anterior:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    datos_anteriores = {
        "nombre": producto_anterior.nombre,
        "precioCompra": float(producto_anterior.precioCompra),
        "precioVenta": float(producto_anterior.precioVenta),
        "stock": producto_anterior.stock
    }
    
    # Actualizar producto
    producto = service.update_producto(id, data)
    
    datos_nuevos = {
        "nombre": producto.nombre,
        "precioCompra": float(producto.precioCompra),
        "precioVenta": float(producto.precioVenta),
        "stock": producto.stock
    }
    
    # Registrar en auditoría
    AuditoriaService.registrar_accion(
        db=db,
        modulo="inventario",
        accion="UPDATE",
        tabla="productos",
        registro_id=producto.id,
        usuario=obtener_usuario_actual(request),
        datos_anteriores=datos_anteriores,
        datos_nuevos=datos_nuevos,
        descripcion=f"Producto '{producto.nombre}' actualizado",
        ip_address=obtener_ip_cliente(request)
    )
    
    return producto


@router.delete("/{id}")
def delete_producto(
    id: int,
    request: Request,
    service: ProductoService = Depends(get_producto_service),
    db: Session = Depends(get_db)
):
    try:
        # Obtener datos antes de eliminar
        producto_anterior = service.get_by_id(id)
        if not producto_anterior:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        datos_anteriores = {
            "nombre": producto_anterior.nombre,
            "precioCompra": float(producto_anterior.precioCompra),
            "precioVenta": float(producto_anterior.precioVenta),
            "stock": producto_anterior.stock
        }
        
        # Eliminar producto
        producto = service.delete_producto(id)
        
        # Registrar en auditoría
        AuditoriaService.registrar_accion(
            db=db,
            modulo="inventario",
            accion="DELETE",
            tabla="productos",
            registro_id=id,
            usuario=obtener_usuario_actual(request),
            datos_anteriores=datos_anteriores,
            descripcion=f"Producto '{datos_anteriores['nombre']}' eliminado",
            ip_address=obtener_ip_cliente(request)
        )
        
        return {"detail": "Producto eliminado"}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/{id}/historial")
def get_historial_producto(
    id: int,
    db: Session = Depends(get_db)
):
    """Obtener el historial completo de cambios de un producto"""
    historial_orm = AuditoriaService.obtener_historial(db, "productos", id)
    
    # Convertir a dict
    historial = [{
        "id": h.id,
        "modulo": h.modulo,
        "accion": h.accion,
        "tabla": h.tabla,
        "registro_id": h.registro_id,
        "usuario": h.usuario,
        "fecha": h.fecha.isoformat(),
        "datos_anteriores": h.datos_anteriores,
        "datos_nuevos": h.datos_nuevos,
        "descripcion": h.descripcion,
        "ip_address": h.ip_address
    } for h in historial_orm]
    
    return {"producto_id": id, "historial": historial}