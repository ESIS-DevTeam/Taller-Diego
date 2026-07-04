from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.base import SessionLocal
from schemas.orden_schema import OrdenCreate, OrdenResponse
from services.orden_service import OrdenService
from datetime import date
from core.auth import require_supabase_user

router = APIRouter(tags=["Ordenes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_orden_service(db: Session = Depends(get_db)) -> OrdenService:
    return OrdenService(db)

@router.post("/", response_model=OrdenResponse, dependencies=[Depends(require_supabase_user)], summary="Crear nueva orden de trabajo")
def create_orden(
    data: OrdenCreate,
    service: OrdenService = Depends(get_orden_service)
):
    """
    Registra una orden de trabajo con el modelo actual del MVP.

    **Importante para Fase 1:**
    Este endpoint todavía no representa la recepción real por patente,
    cliente y vehículo. Esa estructura se implementará en los nuevos módulos
    de Cliente, Vehículo y OrdenServicio.

    **Modelo actual:**
    - garantia: entero entre 0 y 10.
    - estadoPago: pendiente, parcial o completado.
    - precio: monto base mayor a 0.
    - fecha: fecha de la orden.
    - servicios: lista opcional con `servicio_id` y `precio_servicio`.
    - empleados: lista opcional con `empleado_id`.
    
    **Ejemplo de Request CORRECTO:
    ```json
    {
        "garantia": 1,
        "estadoPago": "pendiente",
        "precio": 1,
        "fecha": "2025-12-04",
        "servicios": [
            {
                "servicio_id": 5,
                "precio_servicio": 150
            },
            {
                "servicio_id": 12,
                "precio_servicio": 80
            }
        ],
        "empleados": [
            {
                "empleado_id": 3
            }
        ]
    }
    ```
    
    **Response EXITOSA:
    ```json
    {
        "id": 78,
        "garantia": 1,
        "estadoPago": "pendiente",
        "precio": 231,
        "fecha": "2025-12-04",
        "servicios": [
            {
                "id": 120,
                "servicio_id": 5,
                "precio_servicio": 150
            },
            {
                "id": 121,
                "servicio_id": 12,
                "precio_servicio": 80
            }
        ],
        "empleados": [
            {
                "id": 45,
                "empleado_id": 3
            }
        ]
    }
    ```
    
    **Ejemplos de Requests INCORRECTOS:
    
    **1. Estado de pago inválido:**
    ```json
    {
        "estadoPago": "finalizado"
    }
    ```
    **Error:** `400 Bad Request - "Estado de pago inválido..."`
    
    **2. Servicio inexistente:**
    ```json
    {
        "servicios": [
            {
                "servicio_id": 9999,
                "precio_servicio": 100
            }
        ]
    }
    ```
    **Error:** `400 Bad Request - "Servicio con id 9999 no existe"`
    
    **3. Precio inválido:**
    ```json
    {
        "precio": 0
    }
    ```
    **Error:** `400 Bad Request - "Precio debe ser mayor a 0"`
    
    **Autenticación:
    Requiere token JWT en header: `Authorization: Bearer <token>`
    """
    return service.create_orden(data)

@router.get("/", response_model=list[OrdenResponse], summary="Listar todas las órdenes de trabajo")
def list_ordens(
    service: OrdenService = Depends(get_orden_service)
):
    """
    Obtiene el listado completo de órdenes del modelo actual del MVP.

    La respuesta incluye garantía, estado de pago, precio, fecha y relaciones
    opcionales con servicios/empleados. Los datos de cliente, patente y vehículo
    entrarán en Fase 1 con el nuevo flujo de recepción.
    
    **Response EXITOSA:
    ```json
    [
        {
            "id": 78,
            "garantia": 1,
            "estadoPago": "pendiente",
            "precio": 151,
            "fecha": "2025-12-04",
            "servicios": [
                {
                    "id": 120,
                    "servicio_id": 5,
                    "precio_servicio": 150
                }
            ],
            "empleados": [
                {
                    "id": 45,
                    "empleado_id": 3
                }
            ]
        }
    ]
    ```
    
    **Estructura de datos:
    - **garantia**: Garantía actual expresada en años.
    - **estadoPago**: Estado de pago de la orden.
    - **precio**: Precio acumulado de la orden.
    - **fecha**: Fecha de registro.
    - **servicios**: Array de servicios aplicados
    - **empleados**: Array de empleados asignados
    
    **Autenticación:
    No requiere autenticación (público)
    """
    return service.list_ordens()

@router.get("/{id}", response_model=OrdenResponse, summary="Obtener orden por ID", description="Busca una orden específica usando su ID único.")
def get_orden_by_id(id: int, service: OrdenService = Depends(get_orden_service)):
    """
    Obtiene los detalles de una orden por su ID.

    Args:
        id: ID único de la orden.

    Returns:
        OrdenResponse: La orden encontrada.

    Raises:
        HTTPException(404): Si la orden no existe.
    """
    orden = service.get_by_id(id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden

@router.get("/fecha/{fecha}", response_model=list[OrdenResponse], summary="Buscar órdenes por fecha", description="Busca todas las órdenes registradas en una fecha específica.")
def get_ordens_by_fecha(fecha: date, service: OrdenService = Depends(get_orden_service)):
    """
    Busca órdenes por fecha.

    Args:
        fecha: Fecha a buscar.

    Returns:
        list[OrdenResponse]: Lista de órdenes de esa fecha.
    """
    return service.get_by_fecha(fecha)

@router.delete("/{id}", dependencies=[Depends(require_supabase_user)], summary="Eliminar orden", description="Elimina una orden del sistema.")
def delete_orden(id: int, service: OrdenService = Depends(get_orden_service)):
    """
    Elimina una orden por su ID.

    Args:
        id: ID de la orden a eliminar.

    Returns:
        dict: Mensaje de confirmación.

    Raises:
        HTTPException(404): Si la orden no existe.
    """
    result = service.delete_orden(id)
    if not result:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return {"detail": "Orden eliminada"}
