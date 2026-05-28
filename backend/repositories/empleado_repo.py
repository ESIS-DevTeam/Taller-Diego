"""Compatibilidad: re-exporta el repositorio SQLAlchemy desde hexagonal.adapters."""

from hexagonal.empleado.adapters.secondary.sqlalchemy_employee_repository import SqlAlchemyEmployeeRepository

__all__ = ["SqlAlchemyEmployeeRepository", "EmpleadoRepository"]

# Mantener nombre histórico `EmpleadoRepository` para compatibilidad
EmpleadoRepository = SqlAlchemyEmployeeRepository