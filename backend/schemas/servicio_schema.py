"""
Esquemas Pydantic para validación y serialización de Servicio.

Define los modelos de datos para crear y retornar servicios.
"""

from pydantic import BaseModel, Field, field_validator
from decimal import Decimal


class ServicioBase(BaseModel):
    """Esquema base con los campos comunes de Servicio."""
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre del servicio")
    descripcion: str = Field(..., min_length=1, max_length=500, description="Descripción del servicio")
    precio: float = Field(..., gt=0, le=9999999, description="Precio del servicio")
    
    @field_validator('nombre')
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        """Valida que el nombre no esté vacío después de limpiar espacios."""
        v = v.strip()
        if not v:
            raise ValueError('El nombre no puede estar vacío')
        if len(v) > 100:
            raise ValueError('El nombre no puede exceder los 100 caracteres')
        return v
    
    @field_validator('descripcion')
    @classmethod
    def validate_descripcion(cls, v: str) -> str:
        """Valida que la descripción no esté vacía después de limpiar espacios."""
        v = v.strip()
        if not v:
            raise ValueError('La descripción no puede estar vacía')
        if len(v) > 500:
            raise ValueError('La descripción no puede exceder los 500 caracteres')
        return v
    
    @field_validator('precio')
    @classmethod
    def validate_precio(cls, v: float) -> float:
        """Valida que el precio esté en un rango válido."""
        if v <= 0:
            raise ValueError('El precio debe ser mayor a 0')
        if v > 9999999:
            raise ValueError('El precio no puede exceder $9,999,999')
        # Redondear a 2 decimales
        return round(v, 2)


class ServicioCreate(ServicioBase):
    """Esquema para crear un nuevo servicio."""
    pass


class ServicioUpdate(ServicioBase):
    """Esquema para actualizar un servicio existente."""
    pass


class ServicioResponse(ServicioBase):
    """Esquema para retornar un servicio (incluye ID)."""
    id: int

    class Config:
        from_attributes = True
