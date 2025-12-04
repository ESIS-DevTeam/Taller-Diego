from .producto_schema import ProductoBase
from pydantic import field_validator
import re


class AutoparteBase(ProductoBase):
    modelo: str
    anio: int
    
    @field_validator('modelo')
    @classmethod
    def sanitize_modelo(cls, v: str) -> str:
        """Prevenir inyección de scripts en modelo"""
        if v is None:
            return v
        # Eliminar tags HTML y scripts
        v = re.sub(r'<[^>]*>', '', v)
        # Eliminar caracteres peligrosos
        v = re.sub(r'[<>"\']', '', v)
        return v.strip()


class AutoparteCreate(AutoparteBase):
    codBarras: str | None = None
    img: str | None = None


class AutoparteResponse(AutoparteBase):
    id: int
    codBarras: str | None = None
    img: str | None = None

    class Config:
        from_attributes = True