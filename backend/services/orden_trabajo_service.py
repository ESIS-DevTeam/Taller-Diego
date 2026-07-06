from sqlalchemy.orm import Session
from datetime import datetime, timezone
from repositories.orden_trabajo_repo import OrdenTrabajoRepository
from db.models.orden_trabajo import OrdenTrabajo
from db.models.empleado import Empleado
from core.value_objects import Placa, MetodoPago, EstadoOrdenTrabajo, Precio


class OrdenTrabajoService:
    """Lógica de negocio del módulo ORDEN: recepción rápida (Proforma 1),
    historial por placa, seguimiento de trabajos y pagos parciales."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = OrdenTrabajoRepository(db)

    # ---------- Serialización con totales ----------

    @staticmethod
    def to_response_dict(orden: OrdenTrabajo) -> dict:
        """Convierte el modelo a dict incluyendo los totales calculados
        y el nombre del producto (snapshot para el frontend)."""
        return {
            "id": orden.id,
            "codigo": orden.codigo,
            "diagnostico": orden.diagnostico,
            "estado": orden.estado,
            "fecha_ingreso": orden.fecha_ingreso,
            "fecha_listo": orden.fecha_listo,
            "fecha_entrega": orden.fecha_entrega,
            "garantia_dias": orden.garantia_dias,
            "proforma2_completa": orden.proforma2_completa,
            "entregado_con_deuda": orden.entregado_con_deuda,
            "vehiculo": orden.vehiculo,
            "mecanico": orden.mecanico,
            "servicios": orden.servicios,
            "productos": [
                {
                    "id": p.id,
                    "producto_id": p.producto_id,
                    "cantidad": p.cantidad,
                    "precio_unitario": p.precio_unitario,
                    "nombre": p.producto.nombre if p.producto else None,
                }
                for p in orden.productos
            ],
            "pagos": orden.pagos,
            "total": orden.total(),
            "abonado": orden.abonado(),
            "saldo": orden.saldo(),
            "estado_pago": orden.estado_pago(),
        }

    def _get_orden_o_error(self, orden_id: int) -> OrdenTrabajo:
        orden = self.repo.get_by_id(orden_id)
        if not orden:
            raise LookupError(f"Orden de trabajo {orden_id} no encontrada")
        return orden

    # ---------- Búsqueda / historial ----------

    def buscar_vehiculos(self, q: str) -> list[dict]:
        q = (q or "").strip()
        if len(q) < 1:
            return []
        pares = self.repo.buscar_vehiculos(q)
        return [
            {
                "placa": v.placa,
                "modelo": v.modelo,
                "anio": v.anio,
                "cliente_nombre": v.cliente.nombre if v.cliente else "",
                "cliente_celular": v.cliente.celular if v.cliente else "",
                "visitas": visitas,
            }
            for v, visitas in pares
        ]

    def get_vehiculo(self, placa: str):
        placa_vo = Placa(placa)
        vehiculo = self.repo.get_vehiculo_by_placa(placa_vo.value)
        if not vehiculo:
            raise LookupError(f"Vehículo con placa {placa_vo.value} no encontrado")
        return vehiculo, self.repo.contar_visitas(vehiculo.id)

    def historial(self, placa: str) -> dict:
        vehiculo, total_visitas = self.get_vehiculo(placa)
        visitas = self.repo.historial_por_vehiculo(vehiculo.id)
        return {
            "vehiculo": vehiculo,
            "visitas": [self.to_response_dict(o) for o in visitas],
            "total_visitas": total_visitas,
        }

    # ---------- Recepción ----------

    def crear_recepcion(self, datos: dict) -> dict:
        placa_vo = Placa(datos["placa"])
        datos["placa"] = placa_vo.value

        # Solo mecánicos activos pueden ser asignados
        if datos.get("mecanico_id"):
            mecanico = (self.db.query(Empleado)
                        .filter(Empleado.id == datos["mecanico_id"]).first())
            if not mecanico:
                raise ValueError("El mecánico asignado no existe")
            if (mecanico.estado or "").lower() != "activo":
                raise ValueError(
                    "Solo se pueden asignar mecánicos en estado activo")

        sugerido = datos.get("servicio_sugerido")
        if sugerido and sugerido.get("precio"):
            Precio(float(sugerido["precio"]))  # valida > 0 si viene precio

        orden = self.repo.crear_recepcion(datos)
        return self.to_response_dict(orden)

    # ---------- Listado / detalle ----------

    def listar(self, estados: str | None) -> list[dict]:
        if estados:
            lista_estados = [e.strip() for e in estados.split(",") if e.strip()]
            for e in lista_estados:
                EstadoOrdenTrabajo(e)  # valida
        else:
            lista_estados = ["en_proceso", "esperando_repuestos", "listo"]
        ordenes = self.repo.list_by_estados(lista_estados)
        return [self.to_response_dict(o) for o in ordenes]

    def detalle(self, orden_id: int) -> dict:
        return self.to_response_dict(self._get_orden_o_error(orden_id))

    # ---------- Ítems ----------

    def agregar_servicio(self, orden_id: int, item: dict) -> dict:
        orden = self._get_orden_o_error(orden_id)
        self._validar_orden_abierta(orden)
        if item.get("precio", 0) < 0:
            raise ValueError("El precio no puede ser negativo")
        orden = self.repo.agregar_servicio(orden, item)
        return self.to_response_dict(orden)

    def agregar_producto(self, orden_id: int, producto_id: int,
                         cantidad: int) -> dict:
        orden = self._get_orden_o_error(orden_id)
        self._validar_orden_abierta(orden)
        orden = self.repo.agregar_producto(orden, producto_id, cantidad)
        return self.to_response_dict(orden)

    def quitar_servicio(self, orden_id: int, item_id: int) -> dict:
        orden = self._get_orden_o_error(orden_id)
        self._validar_orden_abierta(orden)
        orden = self.repo.quitar_servicio(orden, item_id)
        return self.to_response_dict(orden)

    def quitar_producto(self, orden_id: int, item_id: int) -> dict:
        orden = self._get_orden_o_error(orden_id)
        self._validar_orden_abierta(orden)
        orden = self.repo.quitar_producto(orden, item_id)
        return self.to_response_dict(orden)

    @staticmethod
    def _validar_orden_abierta(orden: OrdenTrabajo) -> None:
        if orden.estado in ("entregado", "cancelado"):
            raise ValueError(
                f"No se puede modificar una orden en estado '{orden.estado}'")

    # ---------- Estados ----------

    def cambiar_estado(self, orden_id: int, nuevo_estado: str,
                       entregar_con_deuda: bool = False) -> dict:
        orden = self._get_orden_o_error(orden_id)
        actual = EstadoOrdenTrabajo(orden.estado)
        nuevo = EstadoOrdenTrabajo(nuevo_estado)

        if not actual.puede_transicionar_a(nuevo):
            raise ValueError(
                f"Transición inválida: {actual.value} → {nuevo.value}")

        ahora = datetime.now(timezone.utc)

        if nuevo.value == "listo":
            orden.fecha_listo = ahora
        elif nuevo.value == "en_proceso" and actual.value == "listo":
            # Caso especial: volver a pendientes
            orden.fecha_listo = None
        elif nuevo.value == "entregado":
            if orden.saldo() > 0 and not entregar_con_deuda:
                raise ValueError(
                    "La orden tiene saldo pendiente. Cobra el saldo o "
                    "confirma la entrega con deuda.")
            orden.entregado_con_deuda = orden.saldo() > 0
            orden.fecha_entrega = ahora
        elif nuevo.value == "cancelado":
            # Caso especial: reponer stock de todos los productos usados
            self.repo.reponer_stock_completo(orden)

        orden.estado = nuevo.value
        orden = self.repo.save(orden)
        return self.to_response_dict(orden)

    # ---------- Pagos ----------

    def registrar_pago(self, orden_id: int, monto: int, metodo: str) -> dict:
        orden = self._get_orden_o_error(orden_id)
        if orden.estado == "cancelado":
            raise ValueError("No se pueden registrar pagos en una orden cancelada")
        metodo_vo = MetodoPago(metodo)
        if monto <= 0:
            raise ValueError("El monto del pago debe ser mayor a 0")
        saldo = orden.saldo()
        if monto > saldo:
            raise ValueError(
                f"El monto ({monto}) excede el saldo pendiente ({saldo})")
        orden = self.repo.registrar_pago(orden, monto, metodo_vo.value)
        return self.to_response_dict(orden)

    # ---------- Proforma 2 ----------

    def actualizar_proforma2(self, orden_id: int, datos: dict) -> dict:
        orden = self._get_orden_o_error(orden_id)
        if orden.estado == "cancelado":
            raise ValueError("No se puede completar la proforma de una orden cancelada")

        vehiculo = orden.vehiculo
        if datos.get("color") is not None:
            vehiculo.color = datos["color"]
        if datos.get("kilometraje") is not None:
            vehiculo.kilometraje = datos["kilometraje"]
        if datos.get("correo") is not None and vehiculo.cliente:
            vehiculo.cliente.correo = datos["correo"]
        if datos.get("marcar_completa", True):
            orden.proforma2_completa = True

        orden = self.repo.save(orden)
        return self.to_response_dict(orden)
