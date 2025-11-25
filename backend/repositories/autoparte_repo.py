"""Repositorio de acceso a datos para Autoparte.

Implementa operaciones CRUD sobre la entidad Autoparte en la base de datos.
"""

from sqlalchemy.orm import Session
from db.models.autoparte import Autoparte
from schemas.autoparte_schema import AutoparteCreate


class AutoparteRepository:
    """Repositorio CRUD para Autoparte.

    Encapsula la lógica de acceso a la tabla de autopartes.

    :ivar db: Sesión de SQLAlchemy para interactuar con la BD.
    """

    def __init__(self, db: Session):
        """Inicializa el repositorio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.db = db
    
    def create(self, autoparte_data: AutoparteCreate):
        """Crea una nueva autoparte.

        :param autoparte_data: Datos de la autoparte a crear.
        :returns: Instancia de Autoparte creada y persistida.
        """

        autoparte = Autoparte(**autoparte_data.model_dump())
        self.db.add(autoparte)
        self.db.commit()
        self.db.refresh(autoparte)
        return autoparte

    def get_all(self):
        """Obtiene todas las autopartes.

        :returns: Lista de instancias Autoparte.
        """

        return self.db.query(Autoparte).all()
    
    def get_by_id(self, id: int):
        """Obtiene una autoparte por su identificador.

        :param id: Identificador de la autoparte.
        :returns: Instancia Autoparte o None si no existe.
        """

        return self.db.query(Autoparte).filter(Autoparte.id == id).first()
    
    def get_by_name(self, nombre: str):
        """Obtiene una autoparte por su nombre.

        :param nombre: Nombre de la autoparte (búsqueda por igualdad).
        :returns: Instancia Autoparte o None si no existe.
        """

        return self.db.query(Autoparte).filter(Autoparte.nombre == nombre).first()

    def update(self, id: int, autoparte_data: AutoparteCreate):
        """Actualiza una autoparte existente.

        :param id: Identificador de la autoparte a actualizar.
        :param autoparte_data: Nuevos datos de la autoparte.
        :returns: Instancia Autoparte actualizada o None si no existe.
        """

        autoparte = self.get_by_id(id)
        if not autoparte:
            return None
        data = autoparte_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(autoparte, key, value)
        self.db.commit()
        self.db.refresh(autoparte)
        return autoparte
    
    def delete(self, id: int):
        """Elimina una autoparte.

        :param id: Identificador de la autoparte a eliminar.
        :returns: Instancia Autoparte eliminada o None si no existe.
        """

        autoparte = self.get_by_id(id)
        if autoparte:
            self.db.delete(autoparte)
            self.db.commit()
        return autoparte

    def get_by_modelo(self, modelo: str):
        """Obtiene autopartes por modelo de vehículo.

        :param modelo: Modelo de vehículo.
        :returns: Lista de instancias Autoparte del modelo especificado.
        """

        return self.db.query(Autoparte).filter(Autoparte.modelo == modelo).all()
    
    def get_by_anio(self, anio: int):
        """Obtiene autopartes por año de vehículo.

        :param anio: Año del vehículo.
        :returns: Lista de instancias Autoparte del año especificado.
        """

        return self.db.query(Autoparte).filter(Autoparte.anio == anio).all()