from sqlalchemy.orm import Session
from db.models import Servicio

from schemas.servicio_schema import ServicioCreate

class ServicioRepository:

    def __init__(self, db: Session):
        self.db = db
    
    def create(self, servicio_data: ServicioCreate):
        servicio = Servicio(**servicio_data.model_dump())
        self.db.add(servicio)
        self.db.commit()
        self.db.refresh(servicio)
        return servicio

    def get_all(self):
        return self.db.query(Servicio).all()
    
    def get_by_id(self, id: int):
        return self.db.query(Servicio).filter(Servicio.id == id).first()
    
    def get_by_name(self, nombre: str):
        return self.db.query(Servicio).filter(Servicio.nombre == nombre).first()

    def get_paginated(self, pagina: int = 1, cantidad_por_pagina: int = 10, nombre: str = None):
        query = self.db.query(Servicio)
        if nombre:
            query = query.filter(Servicio.nombre.ilike(f"%{nombre}%"))
        total = query.count()
        skip = (pagina - 1) * cantidad_por_pagina
        servicios = query.offset(skip).limit(cantidad_por_pagina).all()
        cantidad_paginas = (total + cantidad_por_pagina - 1) // cantidad_por_pagina
        return {
            "data": servicios,
            "total": total,
            "pagina": pagina,
            "cantidad_paginas": cantidad_paginas,
            "cantidad_por_pagina": cantidad_por_pagina
        }

    def update(self, id: int, servicio_data: ServicioCreate):
        servicio = self.get_by_id(id)
        if not servicio:
            return None
        data = servicio_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(servicio, key, value)
        self.db.commit()
        self.db.refresh(servicio)
        return servicio
    
    def delete(self, id: int):
        servicio = self.get_by_id(id)
        if servicio:
            self.db.delete(servicio)
            self.db.commit()
        return servicio