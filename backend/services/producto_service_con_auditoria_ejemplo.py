"""
Ejemplo de cómo integrar auditoría en el servicio de productos
"""

from sqlalchemy.orm import Session
from repositories.producto_repo import ProductoRepository
from schemas.producto_schema import ProductoCreate, ProductoUpdate
from core.cache import cache
from services.auditoria_service import AuditoriaService
from typing import Optional

class ProductoServiceConAuditoria:

    def __init__(self, db: Session):
        self.repo = ProductoRepository(db)
        self.db = db
    
    def create_producto(self, data: ProductoCreate, usuario: str = "Sistema", ip_address: Optional[str] = None):
        """Crear producto con registro de auditoría"""
        if self.repo.get_by_name(data.nombre):
            raise ValueError("Ya existe un producto con ese nombre")
        
        producto = self.repo.create(data)
        
        # Registrar en auditoría
        AuditoriaService.registrar_accion(
            db=self.db,
            modulo="inventario",
            accion="CREATE",
            tabla="productos",
            registro_id=producto.id,
            usuario=usuario,
            datos_nuevos={
                "nombre": producto.nombre,
                "descripcion": producto.descripcion,
                "precioVenta": producto.precioVenta,
                "precioCompra": producto.precioCompra,
                "stock": producto.stock,
                "categoria": producto.categoria
            },
            descripcion=f"Se creó el producto '{producto.nombre}'",
            ip_address=ip_address
        )
        
        # Invalidar caché
        cache.invalidate_pattern('productos')
        
        return producto
    
    def update_producto(self, id: int, data: ProductoUpdate, usuario: str = "Sistema", ip_address: Optional[str] = None):
        """Actualizar producto con registro de auditoría"""
        # Obtener datos anteriores
        producto_anterior = self.repo.get_by_id(id)
        if not producto_anterior:
            raise ValueError(f"Producto con ID {id} no encontrado")
        
        # Guardar datos anteriores para auditoría
        datos_anteriores = {
            "nombre": producto_anterior.nombre,
            "descripcion": producto_anterior.descripcion,
            "precioVenta": producto_anterior.precioVenta,
            "precioCompra": producto_anterior.precioCompra,
            "stock": producto_anterior.stock,
            "categoria": producto_anterior.categoria
        }
        
        # Actualizar producto
        producto_actualizado = self.repo.update(id, data)
        
        # Preparar datos nuevos
        datos_nuevos = {
            "nombre": producto_actualizado.nombre,
            "descripcion": producto_actualizado.descripcion,
            "precioVenta": producto_actualizado.precioVenta,
            "precioCompra": producto_actualizado.precioCompra,
            "stock": producto_actualizado.stock,
            "categoria": producto_actualizado.categoria
        }
        
        # Generar descripción del cambio
        descripcion = AuditoriaService.generar_descripcion_cambio("UPDATE", datos_anteriores, datos_nuevos)
        
        # Registrar en auditoría
        AuditoriaService.registrar_accion(
            db=self.db,
            modulo="inventario",
            accion="UPDATE",
            tabla="productos",
            registro_id=id,
            usuario=usuario,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
            descripcion=descripcion,
            ip_address=ip_address
        )
        
        # Invalidar caché
        cache.invalidate_pattern('productos')
        cache.delete(f'producto_{id}')
        
        return producto_actualizado
    
    def delete_producto(self, id: int, usuario: str = "Sistema", ip_address: Optional[str] = None):
        """Eliminar producto con registro de auditoría"""
        # Obtener datos antes de eliminar
        producto = self.repo.get_by_id(id)
        if not producto:
            raise ValueError(f"Producto con ID {id} no encontrado")
        
        datos_anteriores = {
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precioVenta": producto.precioVenta,
            "precioCompra": producto.precioCompra,
            "stock": producto.stock,
            "categoria": producto.categoria
        }
        
        # Eliminar producto
        self.repo.delete(id)
        
        # Registrar en auditoría
        AuditoriaService.registrar_accion(
            db=self.db,
            modulo="inventario",
            accion="DELETE",
            tabla="productos",
            registro_id=id,
            usuario=usuario,
            datos_anteriores=datos_anteriores,
            descripcion=f"Se eliminó el producto '{producto.nombre}'",
            ip_address=ip_address
        )
        
        # Invalidar caché
        cache.invalidate_pattern('productos')
        cache.delete(f'producto_{id}')
        
        return {"message": "Producto eliminado exitosamente"}
    
    def list_productos(self):
        """Listar productos (sin auditoría, solo consulta)"""
        cached = cache.get('productos_list')
        if cached is not None:
            return cached
        
        productos = self.repo.get_all()
        cache.set('productos_list', productos, ttl_seconds=300)
        
        return productos
    
    def get_by_id(self, id: int):
        """Obtener producto por ID (sin auditoría, solo consulta)"""
        cache_key = f'producto_{id}'
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        
        producto = self.repo.get_by_id(id)
        if producto:
            cache.set(cache_key, producto, ttl_seconds=300)
        
        return producto
