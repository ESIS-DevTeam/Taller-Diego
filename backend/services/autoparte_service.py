"""
Servicio de lógica de negocio para Autopartes.

Este módulo proporciona la capa de servicio para operaciones de autopartes,
incluyendo validación de duplicados, búsqueda por modelo y año, así como
operaciones CRUD delegadas al repositorio.

:author: Backend Team
:version: 1.0
"""

from sqlalchemy.orm import Session
from repositories.autoparte_repo import AutoparteRepository
from schemas.autoparte_schema import AutoparteCreate


class AutoparteService:
    """
    Servicio de negocio para gestión de autopartes.
    
    Proporciona métodos para crear, listar, actualizar y eliminar autopartes,
    con validaciones de duplicados y búsquedas especializadas por modelo y año.
    
    :ivar repo: Repositorio de autopartes para acceso a datos
    :type repo: AutoparteRepository
    """

    def __init__(self, db: Session):
        """
        Inicializa el servicio de autopartes con una sesión de base de datos.
        
        :param db: Sesión de SQLAlchemy para acceso a la base de datos
        :type db: Session
        :ivar repo: Instancia del repositorio de autopartes
        """
        self.repo = AutoparteRepository(db)
    
    def create_autoparte(self, data: AutoparteCreate):
        """
        Crea una nueva autoparte con validación de duplicados.
        
        :param data: Datos de la autoparte a crear (nombre, descripción, etc.)
        :type data: AutoparteCreate
        :returns: Objeto autoparte creado con ID generado
        :rtype: Autoparte
        :raises ValueError: Si ya existe una autoparte con ese nombre
        """
        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe una autoparte con ese nombre")
        autoparte_data = data
        autoparte = self.repo.create(autoparte_data)
        return autoparte
    
    def list_autopartes(self):
        """
        Lista todas las autopartes registradas.
        
        :returns: Lista de todas las autopartes en la base de datos
        :rtype: list[Autoparte]
        """
        return self.repo.get_all()
    
    def get_by_id(self, id: int):
        """
        Obtiene una autoparte por su ID.
        
        :param id: Identificador único de la autoparte
        :type id: int
        :returns: Objeto autoparte encontrado o None si no existe
        :rtype: Autoparte | None
        """
        return self.repo.get_by_id(id)
    
    def get_by_name(self, nombre: str):
        """
        Busca una autoparte por nombre.
        
        :param nombre: Nombre de la autoparte a buscar
        :type nombre: str
        :returns: Autoparte encontrada o None si no existe
        :rtype: Autoparte | None
        """
        return self.repo.get_by_name(nombre)
    
    def update_autoparte(self, id: int, data: AutoparteCreate):
        """
        Actualiza una autoparte existente.
        
        :param id: Identificador único de la autoparte a actualizar
        :type id: int
        :param data: Nuevos datos de la autoparte
        :type data: AutoparteCreate
        :returns: Objeto autoparte actualizado
        :rtype: Autoparte
        :raises ValueError: Si la autoparte no existe en la base de datos
        """
        autoparte = self.repo.get_by_id(id)
        if not autoparte:
            raise ValueError("La autoparte no existe")
        return self.repo.update(id, data)
    
    def delete_autoparte(self, id: int):
        """
        Elimina una autoparte existente.
        
        :param id: Identificador único de la autoparte a eliminar
        :type id: int
        :returns: True si la eliminación fue exitosa
        :rtype: bool
        :raises ValueError: Si la autoparte no existe en la base de datos
        """
        autoparte = self.repo.get_by_id(id)
        if not autoparte:
            raise ValueError("La autoparte no existe")
        return self.repo.delete(id)
    
    def get_by_modelo(self, modelo: str):
        """
        Busca autopartes por modelo de vehículo.
        
        :param modelo: Modelo del vehículo para el cual buscar autopartes
        :type modelo: str
        :returns: Lista de autopartes compatibles con el modelo especificado
        :rtype: list[Autoparte]
        """
        return self.repo.get_by_modelo(modelo)
    
    def get_by_anio(self, anio: int):
        """
        Busca autopartes por año de vehículo.
        
        :param anio: Año del vehículo para el cual buscar autopartes
        :type anio: int
        :returns: Lista de autopartes compatibles con el año especificado
        :rtype: list[Autoparte]
        """
        return self.repo.get_by_anio(anio)