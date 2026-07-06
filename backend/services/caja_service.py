"""Lógica de negocio del módulo CAJA: cierre diario, notas de pago,
reportes de ventas y clientes deudores.

Fuentes de dinero del sistema:
- Ventas de productos  → tabla `ventas` (+ venta_producto × precioVenta)
- Cobros de servicios  → tabla `pagos` (abonos de órdenes de trabajo)
- Egresos              → tabla `notas_pago` pagadas (compras y gastos)
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date, datetime, timedelta, timezone

from db.models.venta import Venta
from db.models.venta_producto import VentaProducto
from db.models.producto import Producto
from db.models.pago import Pago
from db.models.orden_trabajo import OrdenTrabajo
from db.models.vehiculo import Vehiculo
from db.models.nota_pago import NotaPago
from core.value_objects import Precio

# Días de plazo que se le da a un cliente que se llevó su vehículo con deuda
PLAZO_DEUDA_DIAS = 7
# Días de anticipación con que una nota de pago se considera "por vencer"
DIAS_POR_VENCER = 2


class CajaService:

    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # Helpers de dinero
    # =====================================================

    def _ventas_en_rango(self, desde: date, hasta: date):
        """Ventas de productos en [desde, hasta] con su total calculado.
        Devuelve lista de (fecha, total)."""
        filas = (self.db.query(Venta.id, Venta.fecha,
                               func.coalesce(func.sum(
                                   VentaProducto.cantidad * Producto.precioVenta), 0))
                 .join(VentaProducto, VentaProducto.venta_id == Venta.id)
                 .join(Producto, Producto.id == VentaProducto.producto_id)
                 .filter(func.date(Venta.fecha) >= desde,
                         func.date(Venta.fecha) <= hasta)
                 .group_by(Venta.id, Venta.fecha)
                 .all())
        return [(f[1], int(f[2])) for f in filas]

    def _pagos_en_rango(self, desde: date, hasta: date):
        """Cobros de órdenes de servicio en [desde, hasta].
        Devuelve lista de (fecha, monto, metodo)."""
        filas = (self.db.query(Pago.fecha, Pago.monto, Pago.metodo)
                 .filter(func.date(Pago.fecha) >= desde,
                         func.date(Pago.fecha) <= hasta)
                 .all())
        return [(f[0], int(f[1]), f[2]) for f in filas]

    # =====================================================
    # Cierre de caja diario
    # =====================================================

    def cierre_diario(self, fecha: date) -> dict:
        ventas = self._ventas_en_rango(fecha, fecha)
        pagos = self._pagos_en_rango(fecha, fecha)

        total_ventas = sum(t for _, t in ventas)
        total_cobros = sum(m for _, m, _ in pagos)
        cobros_efectivo = sum(m for _, m, met in pagos if met == "efectivo")
        cobros_tarjeta = sum(m for _, m, met in pagos if met == "tarjeta")

        # Egresos: notas pagadas ese día
        notas_pagadas = (self.db.query(NotaPago)
                         .filter(NotaPago.estado == "pagada",
                                 func.date(NotaPago.fecha_pago) == fecha)
                         .all())
        compras = [n for n in notas_pagadas if n.tipo == "compra"]
        gastos = [n for n in notas_pagadas if n.tipo == "gasto"]
        total_compras = sum(n.monto for n in compras)
        total_gastos = sum(n.monto for n in gastos)

        total_ingresos = total_ventas + total_cobros
        total_egresos = total_compras + total_gastos

        ingresos = [
            {"etiqueta": "Ventas de productos", "monto": total_ventas,
             "cantidad": len(ventas)},
            {"etiqueta": "Cobros de servicios (abonos y pagos)",
             "monto": total_cobros, "cantidad": len(pagos)},
        ]
        egresos = [
            {"etiqueta": "Compras a proveedores", "monto": total_compras,
             "cantidad": len(compras)},
            {"etiqueta": "Gastos del taller", "monto": total_gastos,
             "cantidad": len(gastos)},
        ]

        return {
            "fecha": fecha,
            "total_ingresos": total_ingresos,
            "total_egresos": total_egresos,
            "balance": total_ingresos - total_egresos,
            "num_ventas": len(ventas),
            "num_servicios_cobrados": len(pagos),
            "num_compras": len(compras),
            "num_gastos": len(gastos),
            "ingresos": ingresos,
            "egresos": egresos,
            "cobros_efectivo": cobros_efectivo,
            "cobros_tarjeta": cobros_tarjeta,
        }

    # =====================================================
    # Notas de pago
    # =====================================================

    @staticmethod
    def _estado_visual(nota: NotaPago) -> str:
        if nota.estado == "pagada":
            return "pagada"
        hoy = date.today()
        if nota.fecha_limite < hoy:
            return "vencida"
        if nota.fecha_limite <= hoy + timedelta(days=DIAS_POR_VENCER):
            return "por_vencer"
        return "vigente"

    def _nota_a_dict(self, n: NotaPago) -> dict:
        return {
            "id": n.id,
            "concepto": n.concepto,
            "proveedor": n.proveedor,
            "tipo": n.tipo,
            "monto": n.monto,
            "fecha_emision": n.fecha_emision,
            "fecha_limite": n.fecha_limite,
            "estado": n.estado,
            "fecha_pago": n.fecha_pago,
            "observacion": n.observacion,
            "estado_visual": self._estado_visual(n),
        }

    def listar_notas(self, filtro: str | None = None) -> dict:
        notas = (self.db.query(NotaPago)
                 .order_by(NotaPago.fecha_limite.asc())
                 .all())
        items = [self._nota_a_dict(n) for n in notas]

        if filtro and filtro != "todas":
            items = [n for n in items if n["estado_visual"] == filtro]

        # Alertas sobre TODAS las notas pendientes (no solo las filtradas)
        pendientes = [self._estado_visual(n) for n in notas if n.estado == "pendiente"]
        por_vencer = pendientes.count("por_vencer")
        vencidas = pendientes.count("vencida")

        partes = []
        if por_vencer:
            partes.append(f"{por_vencer} nota{'s' if por_vencer > 1 else ''} por vencer")
        if vencidas:
            partes.append(f"{vencidas} nota{'s' if vencidas > 1 else ''} vencida{'s' if vencidas > 1 else ''}")
        mensaje = " · ".join(partes) if partes else None

        return {
            "notas": items,
            "alertas": {"por_vencer": por_vencer, "vencidas": vencidas,
                        "mensaje": mensaje},
        }

    def crear_nota(self, datos: dict) -> dict:
        Precio(float(datos["monto"]))
        if datos.get("tipo") not in ("compra", "gasto"):
            raise ValueError("El tipo debe ser 'compra' o 'gasto'")
        nota = NotaPago(**datos)
        self.db.add(nota)
        self.db.commit()
        self.db.refresh(nota)
        return self._nota_a_dict(nota)

    def pagar_nota(self, nota_id: int) -> dict:
        nota = self.db.query(NotaPago).filter(NotaPago.id == nota_id).first()
        if not nota:
            raise LookupError("Nota de pago no encontrada")
        if nota.estado == "pagada":
            raise ValueError("Esta nota ya está pagada")
        nota.estado = "pagada"
        nota.fecha_pago = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(nota)
        return self._nota_a_dict(nota)

    def eliminar_nota(self, nota_id: int) -> None:
        nota = self.db.query(NotaPago).filter(NotaPago.id == nota_id).first()
        if not nota:
            raise LookupError("Nota de pago no encontrada")
        if nota.estado == "pagada":
            # Caso especial: una nota pagada es un movimiento de caja real
            raise ValueError(
                "No se puede eliminar una nota pagada: ya afectó el cierre de caja")
        self.db.delete(nota)
        self.db.commit()

    # =====================================================
    # Reporte de ventas
    # =====================================================

    ETIQUETAS_DIA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    MESES = ["ene", "feb", "mar", "abr", "may", "jun",
             "jul", "ago", "sep", "oct", "nov", "dic"]

    def _generar_buckets(self, desde: date, hasta: date, agrupar: str):
        """Genera los intervalos [inicio, fin] con su etiqueta."""
        buckets = []
        if agrupar == "dia":
            actual = desde
            while actual <= hasta:
                etiqueta = f"{self.ETIQUETAS_DIA[actual.weekday()]} {actual.day:02d}"
                buckets.append((actual, actual, etiqueta))
                actual += timedelta(days=1)
        elif agrupar == "semana":
            actual = desde - timedelta(days=desde.weekday())  # lunes
            while actual <= hasta:
                fin = actual + timedelta(days=6)
                etiqueta = f"{actual.day:02d} {self.MESES[actual.month - 1]} – {fin.day:02d} {self.MESES[fin.month - 1]}"
                buckets.append((max(actual, desde), min(fin, hasta), etiqueta))
                actual = fin + timedelta(days=1)
        else:  # mes
            actual = desde.replace(day=1)
            while actual <= hasta:
                if actual.month == 12:
                    fin = actual.replace(day=31)
                    siguiente = actual.replace(year=actual.year + 1, month=1)
                else:
                    siguiente = actual.replace(month=actual.month + 1)
                    fin = siguiente - timedelta(days=1)
                etiqueta = f"{self.MESES[actual.month - 1].capitalize()} {actual.year}"
                buckets.append((max(actual, desde), min(fin, hasta), etiqueta))
                actual = siguiente
        return buckets

    def _totales_en_rango(self, desde: date, hasta: date):
        ventas = self._ventas_en_rango(desde, hasta)
        pagos = self._pagos_en_rango(desde, hasta)
        return {
            "productos": sum(t for _, t in ventas),
            "servicios": sum(m for _, m, _ in pagos),
            "transacciones": len(ventas) + len(pagos),
            "efectivo": sum(m for _, m, met in pagos if met == "efectivo"),
            "tarjeta": sum(m for _, m, met in pagos if met == "tarjeta"),
        }

    def reporte_ventas(self, desde: date, hasta: date, agrupar: str = "dia") -> dict:
        if agrupar not in ("dia", "semana", "mes"):
            raise ValueError("agrupar debe ser 'dia', 'semana' o 'mes'")
        if desde > hasta:
            raise ValueError("La fecha inicial no puede ser mayor que la final")
        if (hasta - desde).days > 400:
            raise ValueError("El rango máximo del reporte es de 400 días")

        puntos = []
        for inicio, fin, etiqueta in self._generar_buckets(desde, hasta, agrupar):
            t = self._totales_en_rango(inicio, fin)
            puntos.append({
                "etiqueta": etiqueta,
                "fecha_inicio": inicio,
                "productos": t["productos"],
                "servicios": t["servicios"],
                "total": t["productos"] + t["servicios"],
                "transacciones": t["transacciones"],
            })

        total_prod = sum(p["productos"] for p in puntos)
        total_serv = sum(p["servicios"] for p in puntos)
        total_gral = total_prod + total_serv
        total_trans = sum(p["transacciones"] for p in puntos)
        totales = self._totales_en_rango(desde, hasta)

        # ------ Resumen en lenguaje simple para el cliente ------
        mejor = max(puntos, key=lambda p: p["total"], default=None)
        pct_serv = round(total_serv * 100 / total_gral) if total_gral else 0

        # Comparación con el periodo anterior de igual duración
        dias = (hasta - desde).days + 1
        ant = self._totales_en_rango(desde - timedelta(days=dias),
                                     desde - timedelta(days=1))
        total_ant = ant["productos"] + ant["servicios"]
        comparacion = None
        if total_ant > 0:
            variacion = round((total_gral - total_ant) * 100 / total_ant)
            if variacion > 0:
                comparacion = f"Subieron {variacion}% respecto al periodo anterior"
            elif variacion < 0:
                comparacion = f"Bajaron {abs(variacion)}% respecto al periodo anterior"
            else:
                comparacion = "Igual que el periodo anterior"
        elif total_gral > 0:
            comparacion = "El periodo anterior no tuvo movimientos"

        resumen = {
            "mejor_dia": mejor["etiqueta"] if mejor and mejor["total"] > 0 else None,
            "mejor_dia_monto": mejor["total"] if mejor else 0,
            "porcentaje_servicios": pct_serv,
            "porcentaje_productos": 100 - pct_serv if total_gral else 0,
            "promedio_por_transaccion": round(total_gral / total_trans) if total_trans else 0,
            "comparacion_anterior": comparacion,
        }

        return {
            "desde": desde,
            "hasta": hasta,
            "agrupar": agrupar,
            "puntos": puntos,
            "total_productos": total_prod,
            "total_servicios": total_serv,
            "total_general": total_gral,
            "total_transacciones": total_trans,
            "efectivo": totales["efectivo"],
            "tarjeta": totales["tarjeta"],
            "resumen": resumen,
        }

    # =====================================================
    # Clientes deudores
    # =====================================================

    def deudores(self) -> dict:
        ordenes = (self.db.query(OrdenTrabajo)
                   .options(joinedload(OrdenTrabajo.vehiculo)
                            .joinedload(Vehiculo.cliente),
                            joinedload(OrdenTrabajo.servicios),
                            joinedload(OrdenTrabajo.productos),
                            joinedload(OrdenTrabajo.pagos))
                   .filter(OrdenTrabajo.estado == "entregado",
                           OrdenTrabajo.entregado_con_deuda == True)  # noqa: E712
                   .all())

        hoy = date.today()
        deudores = []
        for o in ordenes:
            saldo = o.saldo()
            if saldo <= 0:
                continue  # ya pagó su deuda
            vencimiento = None
            estado = "pendiente"
            if o.fecha_entrega:
                vencimiento = (o.fecha_entrega + timedelta(days=PLAZO_DEUDA_DIAS)).date()
                if vencimiento < hoy:
                    estado = "vencida"
            cliente = o.vehiculo.cliente if o.vehiculo else None
            deudores.append({
                "orden_id": o.id,
                "codigo": o.codigo,
                "cliente_nombre": cliente.nombre if cliente else "—",
                "cliente_celular": cliente.celular if cliente else "—",
                "placa": o.vehiculo.placa if o.vehiculo else "—",
                "monto_adeudado": saldo,
                "fecha_entrega": o.fecha_entrega,
                "fecha_vencimiento": vencimiento,
                "estado": estado,
            })

        deudores.sort(key=lambda d: d["monto_adeudado"], reverse=True)
        return {
            "deudores": deudores,
            "total_adeudado": sum(d["monto_adeudado"] for d in deudores),
            "clientes_con_deuda": len({d["cliente_nombre"] for d in deudores}),
            "deudas_vencidas": sum(1 for d in deudores if d["estado"] == "vencida"),
        }
