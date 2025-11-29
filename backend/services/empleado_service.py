"""Servicio de negocio para Empleado.

Orquesta la lógica de negocio y validaciones de empleado.
"""

from sqlalchemy.orm import Session
from repositories.empleado_repo import EmpleadoRepository
from schemas.empleado_schema import EmpleadoCreate

class EmpleadoService:
    """Servicio CRUD para Empleado.

    Implementa reglas de negocio y validaciones específicas de empleado.

    :ivar repo: Instancia de EmpleadoRepository.
    """

    def __init__(self, db: Session):
        """Inicializa el servicio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.repo = EmpleadoRepository(db)

    def create_empleado(self, data: EmpleadoCreate):
        """Crea un nuevo empleado.

        Valida que no exista otro empleado con el mismo nombre.

        :param data: Datos de creación del empleado.
        :returns: Instancia de Empleado creada.
        :raises ValueError: Si ya existe un empleado con ese nombre.
        """

        # schema uses 'nombres' (plural) so check that field
        if self.repo.get_by_name(data.nombres):
            raise ValueError("Ya existe un empleado con ese nombre")
        empleado_data = data
        empleado = self.repo.create(empleado_data)
        return empleado

    def list_empleados(self):
        """Obtiene todos los empleados.

        :returns: Lista de instancias Empleado.
        """

        return self.repo.get_all()

    def get_by_id(self, id: int):
        """Obtiene un empleado por su identificador.

        :param id: Identificador del empleado.
        :returns: Instancia Empleado o None si no existe.
        """

        return self.repo.get_by_id(id)

    def update_empleado(self, id: int, data: EmpleadoCreate):
        """Actualiza un empleado existente.

        :param id: Identificador del empleado a actualizar.
        :param data: Nuevos datos del empleado.
        :returns: Instancia Empleado actualizada.
        """

        return self.repo.update(id, data)

    def delete_empleado(self, id: int):
        """Elimina un empleado.

        :param id: Identificador del empleado a eliminar.
        :returns: Instancia Empleado eliminada o None si no existe.
        """

        return self.repo.delete(id)