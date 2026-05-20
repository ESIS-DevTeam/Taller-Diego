from __future__ import annotations
from datetime import datetime
from typing import Protocol


class VentaRepositoryInterface(Protocol):
    def create(self, fecha: datetime):
        ...

    def create_with_products(self, fecha: datetime, productos: list[dict]):
        ...

    def save(self, venta):
        ...

    def get_all(self):
        ...

    def get_by_id(self, id: int):
        ...

    def delete(self, id: int):
        ...

    def get_by_fecha(self, fecha: datetime):
        ...
