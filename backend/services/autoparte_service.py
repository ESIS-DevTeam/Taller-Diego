"""Servicio de negocio para Autoparte.

Orquesta la lógica de negocio y validaciones de autoparte.
"""

from sqlalchemy.orm import Session
from repositories.autoparte_repo import AutoparteRepository
from schemas.autoparte_schema import AutoparteCreate



class AutoparteService:
    """Servicio CRUD para Autoparte.

    Implementa reglas de negocio y validaciones específicas de autoparte.

    :ivar repo: Instancia de AutoparteRepository.
    """

    def __init__(self, db: Session):
        """Inicializa el servicio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.repo = AutoparteRepository(db)

    def create_autoparte(self, data: AutoparteCreate):
        """Crea una nueva autoparte.

        Valida que no exista otra autoparte con el mismo nombre.

        :param data: Datos de creación de la autoparte.
        :returns: Instancia de Autoparte creada.
        :raises ValueError: Si ya existe una autoparte con ese nombre.
        """

        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe una autoparte con ese nombre")
        autoparte_data = data
        autoparte = self.repo.create(autoparte_data)
        return autoparte

    def list_autopartes(self):
        """Obtiene todas las autopartes.

        :returns: Lista de instancias Autoparte.
        """

        return self.repo.get_all()

    def get_by_id(self, id: int):
        """Obtiene una autoparte por su identificador.

        :param id: Identificador de la autoparte.
        :returns: Instancia Autoparte o None si no existe.
        """

        return self.repo.get_by_id(id)

    def get_by_name(self, nombre: str):
        """Obtiene una autoparte por su nombre.

        :param nombre: Nombre de la autoparte.
        :returns: Instancia Autoparte o None si no existe.
        """

        return self.repo.get_by_name(nombre)

    def update_autoparte(self, id: int, data: AutoparteCreate):
        """Actualiza una autoparte existente.

        :param id: Identificador de la autoparte a actualizar.
        :param data: Nuevos datos de la autoparte.
        :returns: Instancia Autoparte actualizada.
        :raises ValueError: Si la autoparte no existe.
        """

        autoparte = self.repo.get_by_id(id)
        if not autoparte:
            raise ValueError("La autoparte no existe")
        return self.repo.update(id, data)

    def delete_autoparte(self, id: int):
        """Elimina una autoparte.

        :param id: Identificador de la autoparte a eliminar.
        :returns: Instancia Autoparte eliminada.
        :raises ValueError: Si la autoparte no existe.
        """

        autoparte = self.repo.get_by_id(id)
        if not autoparte:
            raise ValueError("La autoparte no existe")
        return self.repo.delete(id)

    def get_by_modelo(self, modelo: str):
        """Obtiene autopartes por su modelo.

        :param modelo: Modelo de la autoparte.
        :returns: Lista de instancias Autoparte.
        """

        return self.repo.get_by_modelo(modelo)

    def get_by_anio(self, anio: int):
        """Obtiene autopartes por su año.

        :param anio: Año de fabricación.
        :returns: Lista de instancias Autoparte.
        """

        return self.repo.get_by_anio(anio)