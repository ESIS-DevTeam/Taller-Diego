"""Compatibilidad: re-exporta la interfaz desde hexagonal.venta.ports."""

from hexagonal.venta.ports.venta_driven_port import VentaRepository as VentaRepositoryInterface

__all__ = ["VentaRepositoryInterface"]
