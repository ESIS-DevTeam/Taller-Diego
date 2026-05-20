"""Compatibilidad: re-exporta VentaRepository desde hexagonal.venta.adapters."""

from hexagonal.venta.adapters.secondary.sqlalchemy_venta_repository import SqlAlchemyVentaRepository

__all__ = ["SqlAlchemyVentaRepository", "VentaRepository"]

VentaRepository = SqlAlchemyVentaRepository
