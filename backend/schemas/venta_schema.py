from pydantic import BaseModel
from datetime import datetime

class VentaBase(BaseModel):
    fecha: datetime

class VentaCreate(VentaBase):
    pass

class VentaResponse(VentaBase):
    id: int

    class Config:
        from_attributes = True
