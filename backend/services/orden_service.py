"""
Servicio de lógica de negocio para Órdenes.

Este módulo proporciona la capa de servicio para operaciones de órdenes,
incluyendo creación de órdenes simples y complejas (con servicios y empleados),
búsqueda por fecha, y operaciones CRUD delegadas al repositorio.

:author: Backend Team
:version: 1.0
"""

from sqlalchemy.orm import Session
from repositories.orden_repo import OrdenRepository
from schemas.orden_schema import OrdenCreate
from fastapi import HTTPException


class OrdenService:
    """
    Servicio de negocio para gestión de órdenes de servicio.
    
    Proporciona métodos para crear órdenes simples y complejas (con relaciones
    a servicios y empleados), listar, buscar y eliminar órdenes. Maneja la
    lógica de conversión de datos y delegación al repositorio.
    
    :ivar repo: Repositorio de órdenes para acceso a datos
    :type repo: OrdenRepository
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el servicio de órdenes con una sesión de base de datos.
        
        :param db: Sesión de SQLAlchemy para acceso a la base de datos
        :type db: Session
        :ivar repo: Instancia del repositorio de órdenes
        """
        self.repo = OrdenRepository(db)

    def create_orden(self, data: OrdenCreate):
        """
        Crea una nueva orden, simple o con relaciones a servicios y empleados.
        
        Si se proporcionan servicios o empleados en los datos, crea una orden
        compleja con todas las relaciones. En caso contrario, crea una orden simple.
        
        Convierte objetos Pydantic a diccionarios para compatibilidad con el
        repositorio y maneja excepciones de validación.
        
        :param data: Datos de la orden a crear (precio, fecha, estado, etc.)
        :type data: OrdenCreate
        :returns: Objeto orden creado con ID y relaciones (si aplica)
        :rtype: Orden
        :raises HTTPException: Si hay error de validación en los servicios/empleados
                              (status_code=400)
        """
        servicios = getattr(data, "servicios", None)
        empleados = getattr(data, "empleados", None)

        servicios_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in servicios] if servicios else []
        empleados_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in empleados] if empleados else []

        # Si hay servicios o empleados asociados, crear con relaciones
        if servicios_list or empleados_list:
            try:
                return self.repo.create_with_services(
                    data.garantia,
                    data.estadoPago,
                    data.precio,
                    data.fecha,
                    servicios_list,
                    empleados_list,
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

        # Caso simple: solo la orden
        return self.repo.create(data.garantia, data.estadoPago, data.precio, data.fecha)

    def list_ordens(self):
        """
        Lista todas las órdenes registradas.
        
        :returns: Lista de todas las órdenes en la base de datos
        :rtype: list[Orden]
        """
        return self.repo.get_all()

    def get_by_id(self, id: int):
        """
        Obtiene una orden por su ID.
        
        :param id: Identificador único de la orden
        :type id: int
        :returns: Objeto orden encontrado o None si no existe
        :rtype: Orden | None
        """
        return self.repo.get_by_id(id)

    def get_by_fecha(self, fecha):
        """
        Busca órdenes por fecha de creación.
        
        :param fecha: Fecha para filtrar órdenes
        :type fecha: datetime
        :returns: Lista de órdenes creadas en la fecha especificada
        :rtype: list[Orden]
        """
        return self.repo.get_by_fecha(fecha)

    def delete_orden(self, id: int):
        """
        Elimina una orden existente.
        
        :param id: Identificador único de la orden a eliminar
        :type id: int
        :returns: True si la eliminación fue exitosa
        :rtype: bool
        """
        return self.repo.delete(id)