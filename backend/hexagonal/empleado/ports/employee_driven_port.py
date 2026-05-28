from abc import ABC, abstractmethod
from typing import Dict, List


class EmployeeRepository(ABC):
    """Puerto secundario: define lo que la app necesita de la persistencia."""

    @abstractmethod
    def create(self, employee_data: Dict) -> Dict:
        ...

    @abstractmethod
    def get_all(self) -> List[Dict]:
        ...

    @abstractmethod
    def get_by_id(self, id: int) -> Dict | None:
        ...

    @abstractmethod
    def get_by_name(self, nombres: str) -> Dict | None:
        ...

    @abstractmethod
    def update(self, id: int, employee_data: Dict) -> Dict | None:
        ...

    @abstractmethod
    def delete(self, id: int) -> Dict | None:
        ...
