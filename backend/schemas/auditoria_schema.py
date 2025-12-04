from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class AuditoriaBase(BaseModel):
    modulo: str
    accion: str
    tabla: str
    registro_id: int
    usuario: str
    datos_anteriores: Optional[Dict[str, Any]] = None
    datos_nuevos: Optional[Dict[str, Any]] = None
    descripcion: Optional[str] = None
    ip_address: Optional[str] = None

class AuditoriaCreate(AuditoriaBase):
    pass

class AuditoriaResponse(AuditoriaBase):
    id: int
    fecha: datetime

    class Config:
        from_attributes = True

class AuditoriaFilter(BaseModel):
    modulo: Optional[str] = None
    accion: Optional[str] = None
    tabla: Optional[str] = None
    usuario: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    registro_id: Optional[int] = None
