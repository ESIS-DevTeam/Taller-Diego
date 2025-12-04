"""
Ejemplo de cómo usar la auditoría en las rutas de productos
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from ...database import get_db
from ...schemas.producto_schema import ProductoCreate, ProductoUpdate, ProductoResponse
from ...services.producto_service import ProductoService
from ...services.auditoria_service import AuditoriaService
from ...core.auditoria_utils import obtener_ip_cliente, obtener_usuario_actual

router = APIRouter(prefix="/productos", tags=["Productos con Auditoría"])

@router.post("/", response_model=ProductoResponse)
def crear_producto(
    producto: ProductoCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Crear un nuevo producto con registro de auditoría"""
    try:
        service = ProductoService(db)
        nuevo_producto = service.create_producto(producto)
        
        # Registrar en auditoría
        usuario = obtener_usuario_actual(request)
        ip = obtener_ip_cliente(request)
        
        AuditoriaService.registrar_accion(
            db=db,
            modulo="inventario",
            accion="CREATE",
            tabla="productos",
            registro_id=nuevo_producto.id,
            usuario=usuario,
            datos_nuevos={
                "nombre": nuevo_producto.nombre,
                "precioVenta": nuevo_producto.precioVenta,
                "stock": nuevo_producto.stock
            },
            descripcion=f"Producto '{nuevo_producto.nombre}' creado",
            ip_address=ip
        )
        
        return nuevo_producto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    producto: ProductoUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Actualizar un producto con registro de auditoría"""
    service = ProductoService(db)
    
    # Obtener datos anteriores
    producto_anterior = service.get_by_id(producto_id)
    if not producto_anterior:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    datos_anteriores = {
        "nombre": producto_anterior.nombre,
        "precioVenta": producto_anterior.precioVenta,
        "stock": producto_anterior.stock
    }
    
    # Actualizar
    producto_actualizado = service.repo.update(producto_id, producto)
    
    datos_nuevos = {
        "nombre": producto_actualizado.nombre,
        "precioVenta": producto_actualizado.precioVenta,
        "stock": producto_actualizado.stock
    }
    
    # Registrar auditoría
    usuario = obtener_usuario_actual(request)
    ip = obtener_ip_cliente(request)
    descripcion = AuditoriaService.generar_descripcion_cambio("UPDATE", datos_anteriores, datos_nuevos)
    
    AuditoriaService.registrar_accion(
        db=db,
        modulo="inventario",
        accion="UPDATE",
        tabla="productos",
        registro_id=producto_id,
        usuario=usuario,
        datos_anteriores=datos_anteriores,
        datos_nuevos=datos_nuevos,
        descripcion=descripcion,
        ip_address=ip
    )
    
    return producto_actualizado

@router.delete("/{producto_id}")
def eliminar_producto(
    producto_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Eliminar un producto con registro de auditoría"""
    service = ProductoService(db)
    
    # Obtener datos antes de eliminar
    producto = service.get_by_id(producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    datos_anteriores = {
        "nombre": producto.nombre,
        "precioVenta": producto.precioVenta,
        "stock": producto.stock
    }
    
    # Eliminar
    service.repo.delete(producto_id)
    
    # Registrar auditoría
    usuario = obtener_usuario_actual(request)
    ip = obtener_ip_cliente(request)
    
    AuditoriaService.registrar_accion(
        db=db,
        modulo="inventario",
        accion="DELETE",
        tabla="productos",
        registro_id=producto_id,
        usuario=usuario,
        datos_anteriores=datos_anteriores,
        descripcion=f"Producto '{producto.nombre}' eliminado",
        ip_address=ip
    )
    
    return {"message": "Producto eliminado exitosamente"}

@router.get("/{producto_id}/historial")
def obtener_historial_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    """Obtener el historial completo de cambios de un producto"""
    historial = AuditoriaService.obtener_historial(db, "productos", producto_id)
    return historial
