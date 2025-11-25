"""Repositorio de acceso a datos para Servicio.

Implementa operaciones CRUD sobre la entidad Servicio en la base de datos.
"""

from sqlalchemy.orm import Session
from db.models import Servicio

from schemas.servicio_schema import ServicioCreate


class ServicioRepository:
    """Repositorio CRUD para Servicio.

    Encapsula la lógica de acceso a la tabla de servicios.

    :ivar db: Sesión de SQLAlchemy para interactuar con la BD.
    """

    def __init__(self, db: Session):
        """Inicializa el repositorio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.db = db
    
    def create(self, servicio_data: ServicioCreate):
        """Crea un nuevo servicio.

        :param servicio_data: Datos del servicio a crear.
        :returns: Instancia de Servicio creada y persistida.
        """

        servicio = Servicio(**servicio_data.model_dump())
        self.db.add(servicio)
        self.db.commit()
        self.db.refresh(servicio)
        return servicio

    def get_all(self):
        """Obtiene todos los servicios.

        :returns: Lista de instancias Servicio.
        """

        return self.db.query(Servicio).all()
    
    def get_by_id(self, id: int):
        """Obtiene un servicio por su identificador.

        :param id: Identificador del servicio.
        :returns: Instancia Servicio o None si no existe.
        """

        return self.db.query(Servicio).filter(Servicio.id == id).first()
    
    def get_by_name(self, nombre: str):
        """Obtiene un servicio por su nombre.

        :param nombre: Nombre del servicio (búsqueda por igualdad).
        :returns: Instancia Servicio o None si no existe.
        """

        return self.db.query(Servicio).filter(Servicio.nombre == nombre).first()

    def update(self, id: int, servicio_data: ServicioCreate):
        """Actualiza un servicio existente.

        :param id: Identificador del servicio a actualizar.
        :param servicio_data: Nuevos datos del servicio.
        :returns: Instancia Servicio actualizada o None si no existe.
        """

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
        """Elimina un servicio.

        :param id: Identificador del servicio a eliminar.
        :returns: Instancia Servicio eliminada o None si no existe.
        """

        servicio = self.get_by_id(id)
        if servicio:
            self.db.delete(servicio)
            self.db.commit()
        return servicio