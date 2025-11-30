"""Servicio de negocio para Servicio.

Orquesta la lógica de negocio y validaciones de servicio.
"""

from sqlalchemy.orm import Session
from repositories.servicio_repo import ServicioRepository
from schemas.servicio_schema import ServicioCreate
from core.cache import cache

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
        
        # Invalidar caché
        cache.invalidate_pattern('servicios')
        
        return servicio

    def list_servicios(self):
        # Intentar obtener del caché
        cached = cache.get('servicios_list')
        if cached is not None:
            return cached
        
        # Si no está en caché, obtener de la BD
        servicios = self.repo.get_all()
        
        # Guardar en caché por 5 minutos
        cache.set('servicios_list', servicios, ttl_seconds=300)
        
        return servicios
    
    def list_servicios_paginados(self, pagina: int = 1, cantidad_por_pagina: int = 10, nombre: str = None):
        """Retorna servicios paginados con búsqueda opcional"""
        # Validar que pagina sea mayor a 0
        if pagina < 1:
            pagina = 1
        
        # Validar cantidad_por_pagina
        if cantidad_por_pagina < 1 or cantidad_por_pagina > 100:
            cantidad_por_pagina = 10
        
        return self.repo.get_paginated(pagina, cantidad_por_pagina, nombre)
    
    def get_by_id(self, id: int):
        cache_key = f'servicio_{id}'
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        
        servicio = self.repo.get_by_id(id)
        
        if servicio:
            cache.set(cache_key, servicio, ttl_seconds=300)
        
        return servicio
    
    def get_by_name(self, nombre: str):
        """Obtiene un servicio por su nombre.

        :param nombre: Nombre del servicio.
        :returns: Instancia Servicio o None si no existe.
        """

        return self.repo.get_by_name(nombre)

    def update_servicio(self, id: int, data: ServicioCreate):
        servicio = self.repo.update(id, data)
        
        # Invalidar caché
        cache.delete(f'servicio_{id}')
        cache.invalidate_pattern('servicios')
        
        return servicio
    
    def delete_servicio(self, id: int):
        result = self.repo.delete(id)
        
        # Invalidar caché
        cache.delete(f'servicio_{id}')
        cache.invalidate_pattern('servicios')
        
        return result
