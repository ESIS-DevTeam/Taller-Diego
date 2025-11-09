from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func
from math import ceil
from db.models import Producto
from schemas.producto_schema import ProductoCreate

class ProductoRepository:

    def __init__(self, db: Session):
        self.db = db
    
    def create(self, producto_data: ProductoCreate):
        producto = Producto(**producto_data.model_dump())
        self.db.add(producto)
        self.db.commit()
        self.db.refresh(producto)
        return producto

    def get_all(self):
        return self.db.query(Producto).all()

    def get_by_filters(self, filtros: dict):

        # Consulta base
        base_query = self.db.query(Producto)

        # Aplicar filtros de frontend antes del count
        categoria = filtros.get("categoria")
        precio_min = filtros.get("precio_min")
        precio_max = filtros.get("precio_max")
        low_stock = filtros.get("low_stock")

        if categoria:
            base_query = base_query.filter(Producto.categoria == categoria)
        if precio_min is not None:
            base_query = base_query.filter(Producto.precioVenta >= precio_min)
        if precio_max is not None:
            base_query = base_query.filter(Producto.precioVenta <= precio_max)
        if low_stock:
            base_query = base_query.filter(Producto.stock <= Producto.stockMin)
        nombre = filtros.get("nombre")
        if nombre:
            base_query = base_query.filter(Producto.nombre.ilike(f"%{nombre}%"))

        # Conteo total (sobre la consulta filtrada, sin orden ni limit)
        total_items = self.db.query(func.count(Producto.id)).select_from(Producto)
        # Reaplicar mismos filtros al count_query
        if categoria:
            total_items = total_items.filter(Producto.categoria == categoria)
        if precio_min is not None:
            total_items = total_items.filter(Producto.precioVenta >= precio_min)
        if precio_max is not None:
            total_items = total_items.filter(Producto.precioVenta <= precio_max)
        if low_stock:
            total_items = total_items.filter(Producto.stock <= Producto.stockMin)
        if nombre:
            total_items = total_items.filter(Producto.nombre.ilike(f"%{nombre}%"))

        total_items = total_items.scalar() or 0

        # Ordenación
        order_by = filtros.get("order_by")
        order_dir = (filtros.get("order_dir") or "asc").lower()
        if order_by and hasattr(Producto, order_by):
            col = getattr(Producto, order_by)
            if order_dir == "desc":
                base_query = base_query.order_by(desc(col))
            else:
                base_query = base_query.order_by(asc(col))

        # Paginación
        page = int(filtros.get("page", 1))
        page_size = int(filtros.get("page_size", 10))
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 10

        offset = (page - 1) * page_size
        items = base_query.offset(offset).limit(page_size).all()

        total_pages = ceil(total_items / page_size) if page_size else 0

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total_items": int(total_items),
            "total_pages": int(total_pages),
        }
    
    def get_by_id(self, id: int):
        return self.db.query(Producto).filter(Producto.id == id).first()

    def update(self, id: int, producto_data: ProductoCreate):
        producto = self.get_by_id(id)
        if not producto:
            return None
        data = producto_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(producto, key, value)
        self.db.commit()
        self.db.refresh(producto)
        return producto
    
    def delete(self, id: int):
        producto = self.get_by_id(id)
        if producto:
            self.db.delete(producto)
            self.db.commit()
        return producto

    def count_low_stock(self) -> int:
        cnt = self.db.query(func.count(Producto.id)).filter(Producto.stock <= Producto.stockMin).scalar()
        return int(cnt or 0)