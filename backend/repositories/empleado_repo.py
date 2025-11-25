"""Repositorio de acceso a datos para Empleado.

Implementa operaciones CRUD sobre la entidad Empleado en la base de datos.
"""

from sqlalchemy.orm import Session
from db.models import Empleado

from schemas.empleado_schema import EmpleadoCreate


class EmpleadoRepository:
    """Repositorio CRUD para Empleado.

    Encapsula la lógica de acceso a la tabla de empleados.

    :ivar db: Sesión de SQLAlchemy para interactuar con la BD.
    """

    def __init__(self, db: Session):
        """Inicializa el repositorio con una sesión de BD.

        :param db: Sesión de SQLAlchemy.
        """

        self.db = db
    
    def create(self, empleado_data: EmpleadoCreate):
        """Crea un nuevo empleado.

        :param empleado_data: Datos del empleado a crear.
        :returns: Instancia de Empleado creada y persistida.
        """

        empleado = Empleado(**empleado_data.model_dump())
        self.db.add(empleado)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado

    def get_all(self):
        """Obtiene todos los empleados.

        :returns: Lista de instancias Empleado.
        """

        return self.db.query(Empleado).all()
    
    def get_by_id(self, id: int):
        """Obtiene un empleado por su identificador.

        :param id: Identificador del empleado.
        :returns: Instancia Empleado o None si no existe.
        """

        return self.db.query(Empleado).filter(Empleado.id == id).first()

    def get_by_name(self, nombres: str):
        """Obtiene un empleado por su nombre.

        :param nombres: Nombre del empleado (búsqueda por igualdad).
        :returns: Instancia Empleado o None si no existe.
        """

        return self.db.query(Empleado).filter(Empleado.nombres == nombres).first()

    def update(self, id: int, empleado_data: EmpleadoCreate):
        """Actualiza un empleado existente.

        :param id: Identificador del empleado a actualizar.
        :param empleado_data: Nuevos datos del empleado.
        :returns: Instancia Empleado actualizada o None si no existe.
        """

        empleado = self.get_by_id(id)
        if not empleado:
            return None
        data = empleado_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(empleado, key, value)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado
    
    def delete(self, id: int):
        """Elimina un empleado.

        :param id: Identificador del empleado a eliminar.
        :returns: Instancia Empleado eliminada o None si no existe.
        """

        empleado = self.get_by_id(id)
        if empleado:
            self.db.delete(empleado)
            self.db.commit()
        return empleado
    
    def create(self, empleado_data: EmpleadoCreate):
        empleado = Empleado(**empleado_data.model_dump())
        self.db.add(empleado)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado

    def get_all(self):
        return self.db.query(Empleado).all()
    
    def get_by_id(self, id: int):
        return self.db.query(Empleado).filter(Empleado.id == id).first()

    def get_by_name(self, nombres: str):
        return self.db.query(Empleado).filter(Empleado.nombres == nombres).first()

    def update(self, id: int, empleado_data: EmpleadoCreate):
        empleado = self.get_by_id(id)
        if not empleado:
            return None
        data = empleado_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(empleado, key, value)
        self.db.commit()
        self.db.refresh(empleado)
        return empleado
    
    def delete(self, id: int):
        empleado = self.get_by_id(id)
        if empleado:
            self.db.delete(empleado)
            self.db.commit()
        return empleado