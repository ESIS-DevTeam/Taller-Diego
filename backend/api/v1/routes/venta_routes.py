from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.base import SessionLocal
from schemas.venta_schema import VentaCreate, VentaResponse
from services.venta_service import VentaService
from core.auth import require_supabase_user

router = APIRouter(tags=["Ventas"])



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 

def get_venta_service(db: Session = Depends(get_db)) -> VentaService:
    return VentaService(db)

@router.post("/", response_model=VentaResponse, dependencies=[Depends(require_supabase_user)], summary="Registrar nueva venta")
def create_venta(
    data: VentaCreate,
    service: VentaService = Depends(get_venta_service)
):
    """
    Registra una nueva venta en el sistema
    
    Permite registrar ventas de productos con múltiples ítems y actualiza el inventario automáticamente.
    
    **Modelo actual del MVP:**
    - fecha: fecha/hora de la venta.
    - productos: lista de productos con `producto_id` y `cantidad`.

    El cliente, método de pago y precio unitario histórico se incorporarán en
    fases siguientes. Actualmente el precio se obtiene desde el producto y el
    stock se descuenta automáticamente al registrar la venta.
    
    **Ejemplo de Request CORRECTO:
    ```json
    {
        "fecha": "2025-12-04T10:30:00",
        "productos": [
            {
                "producto_id": 15,
                "cantidad": 2
            },
            {
                "producto_id": 14,
                "cantidad": 1
            }
        ]
    }
    ```
    
    **Response EXITOSA:
    ```json
    {
        "id": 42,
        "fecha": "2025-12-04T10:30:00",
        "productos": [
            {
                "id": 85,
                "producto_id": 15,
                "cantidad": 2
            },
            {
                "id": 86,
                "producto_id": 14,
                "cantidad": 1
            }
        ]
    }
    ```
    
    **Ejemplos de Requests INCORRECTOS:
    
    **1. Stock insuficiente:**
    ```json
    {
        "productos": [
            {
                "producto_id": 15,
                "cantidad": 100  // Solo hay 25 en stock
            }
        ]
    }
    ```
    **Error:** `400 Bad Request - "Stock insuficiente para el producto"`
    
    **2. Sin productos:**
    ```json
    {
        "productos": []  // Debe tener al menos 1 producto
    }
    ```
    **Error:** `400 Bad Request - "La venta debe incluir al menos un producto"`
    
    **3. Producto no existe:**
    ```json
    {
        "productos": [
            {
                "producto_id": 9999,  // No existe
                "cantidad": 1
            }
        ]
    }
    ```
    **Error:** `404 Not Found - "Producto no encontrado"`
    
    **Nota:
    - El stock se descuenta automáticamente al registrar la venta.
    - La fecha debe enviarse en formato datetime.
    
    **Autenticación:
    Requiere token JWT en header: `Authorization: Bearer <token>`
    """
    return service.create_venta(data)


@router.get("/", response_model=list[VentaResponse], summary="Listar todas las ventas")
def list_ventas(
    service: VentaService = Depends(get_venta_service)
):
    """
    Obtiene el listado completo de ventas
    
    Retorna todas las ventas registradas con sus productos asociados.
    
    **Response EXITOSA:
    ```json
    [
        {
            "id": 42,
            "fecha": "2025-12-04T10:30:00",
            "productos": [
                {
                    "id": 85,
                    "producto_id": 15,
                    "cantidad": 2
                },
                {
                    "id": 86,
                    "producto_id": 14,
                    "cantidad": 1
                }
            ]
        }
    ]
    ```
    
    **Estructura de datos:
    - **id**: Identificador único de la venta
    - **fecha**: Fecha/hora de la transacción
    - **total**: Monto total de la venta
    - **productos**: Array de productos vendidos con:
      - **producto_id**: ID del producto en inventario
      - **cantidad**: Unidades vendidas
    
    **Autenticación:
    No requiere autenticación (público)
    """
    return service.list_ventas()


@router.get("/{id}", response_model=VentaResponse, summary="Obtener venta por ID", description="Busca una venta específica usando su ID único.")
def get_venta_by_id(id: int, service: VentaService = Depends(get_venta_service)):
    """
    Obtiene los detalles de una venta por su ID.

    Args:
        id: ID único de la venta.

    Returns:
        VentaResponse: La venta encontrada.

    Raises:
        HTTPException(404): Si la venta no existe.
    """
    venta = service.get_by_id(id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return venta


@router.get("/fecha/{fecha}", response_model=list[VentaResponse], summary="Buscar ventas por fecha", description="Busca todas las ventas registradas en una fecha específica.")
def get_ventas_by_fecha(fecha: datetime, service: VentaService = Depends(get_venta_service)):
    """
    Busca ventas por fecha.

    Args:
        fecha: Fecha a buscar.

    Returns:
        list[VentaResponse]: Lista de ventas de esa fecha.
    """
    return service.get_by_fecha(fecha)


@router.delete("/{id}", dependencies=[Depends(require_supabase_user)], summary="Eliminar venta", description="Elimina una venta del sistema.")
def delete_venta(id: int, service: VentaService = Depends(get_venta_service)):
    """
    Elimina una venta por su ID.

    Args:
        id: ID de la venta a eliminar.

    Returns:
        dict: Mensaje de confirmación.

    Raises:
        HTTPException(404): Si la venta no existe.
    """
    result = service.delete_venta(id)
    if not result:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return {"detail": "Venta eliminada"}
