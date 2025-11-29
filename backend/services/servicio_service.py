"""Servicio de negocio para Servicio.

Orquesta la lógica de negocio y validaciones de servicio.
"""

from sqlalchemy.orm import Session
from repositories.servicio_repo import ServicioRepository
from schemas.servicio_schema import ServicioCreate

class ServicioService:
    """Servicio CRUD para Servicio.

    Implementa reglas de negocio y validaciones específicas de servicio.

    :ivar repo: Instancia de ServicioRepository.
    """

    def __init__(self, db: Session):
        """Inicializa el servicio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.repo = ServicioRepository(db)

    def create_servicio(self, data: ServicioCreate):
        """Crea un nuevo servicio.

        Valida que no exista otro servicio con el mismo nombre.

        :param data: Datos de creación del servicio.
        :returns: Instancia de Servicio creada.
        :raises ValueError: Si ya existe un servicio con ese nombre.
        """

        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe un servicio con ese nombre")
        servicio_data = data
        servicio = self.repo.create(servicio_data)
        return servicio

    def list_servicios(self):
        """Obtiene todos los servicios.

        :returns: Lista de instancias Servicio.
        """

        return self.repo.get_all()

    def get_by_id(self, id: int):
        """Obtiene un servicio por su identificador.

        :param id: Identificador del servicio.
        :returns: Instancia Servicio o None si no existe.
        """

        return self.repo.get_by_id(id)

    def get_by_name(self, nombre: str):
        """Obtiene un servicio por su nombre.

        :param nombre: Nombre del servicio.
        :returns: Instancia Servicio o None si no existe.
        """

        return self.repo.get_by_name(nombre)

    def update_servicio(self, id: int, data: ServicioCreate):
        """Actualiza un servicio existente.

        :param id: Identificador del servicio a actualizar.
        :param data: Nuevos datos del servicio.
        :returns: Instancia Servicio actualizada.
        """

        return self.repo.update(id, data)

    def delete_servicio(self, id: int):
        """Elimina un servicio.

        :param id: Identificador del servicio a eliminar.
        :returns: Instancia Servicio eliminada o None si no existe.
        """

        return self.repo.delete(id)