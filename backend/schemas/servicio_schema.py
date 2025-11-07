from pydantic import BaseModel
from pydantic import ConfigDict

class ServicioBase(BaseModel):
    nombre: str
    descripcion: str


class ServicioCreate(ServicioBase):
    pass


class ServicioResponse(ServicioBase):
    id: int

    model_config = ConfigDict(from_attributes=True)