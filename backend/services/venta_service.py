"""
Servicio de lógica de negocio para Ventas.

Este módulo proporciona la capa de servicio para operaciones de ventas,
incluyendo creación de ventas simples y complejas (con productos asociados),
búsqueda por fecha, manejo de stock, y operaciones CRUD delegadas al repositorio.

:author: Backend Team
:version: 1.0
"""

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.venta_repo import VentaRepository
from schemas.venta_schema import VentaCreate


class VentaService:
    """
    Servicio de negocio para gestión de ventas.
    
    Proporciona métodos para crear ventas simples y complejas (con productos),
    listar, buscar por fecha y eliminar ventas. Maneja la lógica de transacciones
    y control de stock mediante delegación al repositorio.
    
    :ivar repo: Repositorio de ventas para acceso a datos y transacciones
    :type repo: VentaRepository
    """
    
    def __init__(self, db: Session):
        """
        Inicializa el servicio de ventas con una sesión de base de datos.
        
        :param db: Sesión de SQLAlchemy para acceso a la base de datos
        :type db: Session
        :ivar repo: Instancia del repositorio de ventas
        """
        self.repo = VentaRepository(db)

    def create_venta(self, data: VentaCreate):
        """
        Crea una nueva venta, simple o con productos asociados.
        
        Si se proporcionan productos en los datos, crea una venta compleja
        con líneas de venta (VentaProducto) y gestión de stock. En caso contrario,
        crea una venta simple sin productos.
        
        Convierte objetos Pydantic a diccionarios y maneja excepciones de
        validación y disponibilidad de stock.
        
        :param data: Datos de la venta a crear (fecha, productos, etc.)
        :type data: VentaCreate
        :returns: Objeto venta creado con ID y líneas de productos (si aplica)
        :rtype: Venta
        :raises HTTPException: Si hay error de validación, stock insuficiente
                              o problemas con transacciones (status_code=400)
        """
        productos = getattr(data, "productos", None)
        if productos:
            productos_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in productos]
            try:
                return self.repo.create_with_products(data.fecha, productos_list)
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))
        return self.repo.create(data.fecha)

    def list_ventas(self):
        """
        Lista todas las ventas registradas.
        
        :returns: Lista de todas las ventas en la base de datos
        :rtype: list[Venta]
        """
        return self.repo.get_all()

    def get_by_id(self, id: int):
        """
        Obtiene una venta por su ID.
        
        :param id: Identificador único de la venta
        :type id: int
        :returns: Objeto venta encontrado o None si no existe
        :rtype: Venta | None
        """
        return self.repo.get_by_id(id)

    def get_by_fecha(self, fecha: datetime):
        """
        Busca ventas por fecha de creación.
        
        :param fecha: Fecha para filtrar ventas
        :type fecha: datetime
        :returns: Lista de ventas realizadas en la fecha especificada
        :rtype: list[Venta]
        """
        return self.repo.get_by_fecha(fecha)

    def delete_venta(self, id: int):
        """
        Elimina una venta existente.
        
        :param id: Identificador único de la venta a eliminar
        :type id: int
        :returns: True si la eliminación fue exitosa
        :rtype: bool
        """
        return self.repo.delete(id)
