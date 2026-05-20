from abc import ABC, abstractmethod
from datetime import datetime
from typing import List


class VentaRepository(ABC):
    @abstractmethod
    def create(self, fecha: datetime): ...

    @abstractmethod
    def create_with_products(self, fecha: datetime, productos: list[dict]): ...

    @abstractmethod
    def save(self, venta): ...

    @abstractmethod
    def get_all(self): ...

    @abstractmethod
    def get_by_id(self, id: int): ...

    @abstractmethod
    def delete(self, id: int): ...

    @abstractmethod
    def get_by_fecha(self, fecha: datetime): ...
