"""
Servicio de lógica de negocio para Empleados.

Este módulo proporciona la capa de servicio para operaciones de empleados,
incluyendo validación de duplicados, búsqueda por nombre, así como
operaciones CRUD delegadas al repositorio.

:author: Backend Team
:version: 1.0
"""

from sqlalchemy.orm import Session
from repositories.empleado_repo import EmpleadoRepository
from schemas.empleado_schema import EmpleadoCreate


class EmpleadoService:
    """
    Servicio de negocio para gestión de empleados.
    
    Proporciona métodos para crear, listar, actualizar y eliminar empleados,
    con validaciones de duplicados y búsquedas por nombre.
    
    :ivar repo: Repositorio de empleados para acceso a datos
    :type repo: EmpleadoRepository
    """

    def __init__(self, db: Session):
        """
        Inicializa el servicio de empleados con una sesión de base de datos.
        
        :param db: Sesión de SQLAlchemy para acceso a la base de datos
        :type db: Session
        :ivar repo: Instancia del repositorio de empleados
        """
        self.repo = EmpleadoRepository(db)
    
    def create_empleado(self, data: EmpleadoCreate):
        """
        Crea un nuevo empleado con validación de duplicados.
        
        Valida que no exista otro empleado con los mismos nombres
        antes de proceder con la creación.
        
        :param data: Datos del empleado a crear (nombres, apellidos, etc.)
        :type data: EmpleadoCreate
        :returns: Objeto empleado creado con ID generado
        :rtype: Empleado
        :raises ValueError: Si ya existe un empleado con ese nombre
        """
        # schema uses 'nombres' (plural) so check that field
        if self.repo.get_by_name(data.nombres):
            raise ValueError("Ya existe un empleado con ese nombre")
        empleado_data = data
        empleado = self.repo.create(empleado_data)
        return empleado
    
    def list_empleados(self):
        """
        Lista todos los empleados registrados.
        
        :returns: Lista de todos los empleados en la base de datos
        :rtype: list[Empleado]
        """
        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        """
        Obtiene un empleado por su ID.
        
        :param id: Identificador único del empleado
        :type id: int
        :returns: Objeto empleado encontrado o None si no existe
        :rtype: Empleado | None
        """
        return self.repo.get_by_id(id)

    def update_empleado(self, id: int, data: EmpleadoCreate):
        """
        Actualiza un empleado existente.
        
        :param id: Identificador único del empleado a actualizar
        :type id: int
        :param data: Nuevos datos del empleado
        :type data: EmpleadoCreate
        :returns: Objeto empleado actualizado
        :rtype: Empleado
        """
        return self.repo.update(id, data)
    
    def delete_empleado(self, id: int):
        """
        Elimina un empleado existente.
        
        :param id: Identificador único del empleado a eliminar
        :type id: int
        :returns: True si la eliminación fue exitosa
        :rtype: bool
        """
        return self.repo.delete(id)