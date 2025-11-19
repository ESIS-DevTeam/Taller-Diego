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


class ServicioPaginado(BaseModel):
    data: list[ServicioResponse]
    total: int
    pagina: int
    cantidad_paginas: int
    cantidad_por_pagina: int