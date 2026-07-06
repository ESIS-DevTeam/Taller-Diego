from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from datetime import datetime, timezone
from db.models.orden_trabajo import OrdenTrabajo, OrdenTrabajoServicio, OrdenTrabajoProducto
from db.models.cliente import Cliente
from db.models.vehiculo import Vehiculo
from db.models.pago import Pago
from db.models.producto import Producto


class OrdenTrabajoRepository:
    """Acceso a datos del módulo ORDEN (recepción, historial, pendientes,
    revisados). Maneja también el stock de productos usados."""

    def __init__(self, db: Session):
        self.db = db

    # ---------- Carga con relaciones ----------

    def _query_completa(self):
        return self.db.query(OrdenTrabajo).options(
            joinedload(OrdenTrabajo.vehiculo).joinedload(Vehiculo.cliente),
            joinedload(OrdenTrabajo.mecanico),
            joinedload(OrdenTrabajo.servicios),
            joinedload(OrdenTrabajo.productos).joinedload(
                OrdenTrabajoProducto.producto),
            joinedload(OrdenTrabajo.pagos),
        )

    def get_by_id(self, orden_id: int) -> OrdenTrabajo | None:
        return self._query_completa().filter(OrdenTrabajo.id == orden_id).first()

    def list_by_estados(self, estados: list[str]) -> list[OrdenTrabajo]:
        return (self._query_completa()
                .filter(OrdenTrabajo.estado.in_(estados))
                .order_by(OrdenTrabajo.fecha_ingreso.desc())
                .all())

    # ---------- Vehículos / clientes ----------

    def get_vehiculo_by_placa(self, placa: str) -> Vehiculo | None:
        return (self.db.query(Vehiculo)
                .options(joinedload(Vehiculo.cliente))
                .filter(Vehiculo.placa == placa)
                .first())

    def buscar_vehiculos(self, q: str, limit: int = 8) -> list[tuple[Vehiculo, int]]:
        """Busca por placa o nombre del dueño (ilike). Devuelve pares
        (vehiculo, cantidad_de_visitas)."""
        patron = f"%{q}%"
        vehiculos = (self.db.query(Vehiculo)
                     .join(Cliente, Vehiculo.cliente_id == Cliente.id)
                     .options(joinedload(Vehiculo.cliente))
                     .filter(or_(Vehiculo.placa.ilike(patron),
                                 Cliente.nombre.ilike(patron)))
                     .order_by(Vehiculo.placa)
                     .limit(limit)
                     .all())
        resultado = []
        for v in vehiculos:
            visitas = (self.db.query(func.count(OrdenTrabajo.id))
                       .filter(OrdenTrabajo.vehiculo_id == v.id,
                               OrdenTrabajo.estado != "cancelado")
                       .scalar()) or 0
            resultado.append((v, visitas))
        return resultado

    def contar_visitas(self, vehiculo_id: int) -> int:
        return (self.db.query(func.count(OrdenTrabajo.id))
                .filter(OrdenTrabajo.vehiculo_id == vehiculo_id,
                        OrdenTrabajo.estado != "cancelado")
                .scalar()) or 0

    def historial_por_vehiculo(self, vehiculo_id: int) -> list[OrdenTrabajo]:
        return (self._query_completa()
                .filter(OrdenTrabajo.vehiculo_id == vehiculo_id,
                        OrdenTrabajo.estado != "cancelado")
                .order_by(OrdenTrabajo.fecha_ingreso.desc())
                .all())

    # ---------- Recepción (crear orden) ----------

    def generar_codigo(self) -> str:
        """Código único secuencial por año: PF1-2026-0001."""
        anio = datetime.now(timezone.utc).year
        prefijo = f"PF1-{anio}-"
        ultimo = (self.db.query(OrdenTrabajo.codigo)
                  .filter(OrdenTrabajo.codigo.like(f"{prefijo}%"))
                  .order_by(OrdenTrabajo.codigo.desc())
                  .first())
        secuencia = 1
        if ultimo:
            try:
                secuencia = int(ultimo[0].rsplit("-", 1)[1]) + 1
            except (ValueError, IndexError):
                secuencia = 1
        return f"{prefijo}{secuencia:04d}"

    def crear_recepcion(self, datos: dict) -> OrdenTrabajo:
        """Crea (o reutiliza) cliente y vehículo por placa y registra la
        orden de trabajo. Todo en una sola transacción."""
        try:
            vehiculo = self.get_vehiculo_by_placa(datos["placa"])

            if vehiculo:
                # Caso especial: placa reconocida → actualizar datos de contacto
                vehiculo.cliente.nombre = datos["nombre_cliente"]
                vehiculo.cliente.celular = datos["celular"]
                if datos.get("modelo"):
                    vehiculo.modelo = datos["modelo"]
                if datos.get("anio"):
                    vehiculo.anio = datos["anio"]
            else:
                cliente = Cliente(nombre=datos["nombre_cliente"],
                                  celular=datos["celular"])
                self.db.add(cliente)
                self.db.flush()
                vehiculo = Vehiculo(placa=datos["placa"],
                                    modelo=datos.get("modelo"),
                                    anio=datos.get("anio"),
                                    cliente_id=cliente.id)
                self.db.add(vehiculo)
                self.db.flush()

            orden = OrdenTrabajo(
                codigo=self.generar_codigo(),
                vehiculo_id=vehiculo.id,
                mecanico_id=datos.get("mecanico_id"),
                diagnostico=datos["diagnostico"],
                estado="en_proceso",
            )
            self.db.add(orden)
            self.db.flush()

            sugerido = datos.get("servicio_sugerido")
            if sugerido:
                self.db.add(OrdenTrabajoServicio(
                    orden_id=orden.id,
                    servicio_id=sugerido.get("servicio_id"),
                    nombre=sugerido["nombre"],
                    precio=sugerido.get("precio", 0),
                    es_extra=False,
                ))

            self.db.commit()
            self.db.refresh(orden)
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise

    # ---------- Ítems ----------

    def agregar_servicio(self, orden: OrdenTrabajo, item: dict) -> OrdenTrabajo:
        try:
            self.db.add(OrdenTrabajoServicio(
                orden_id=orden.id,
                servicio_id=item.get("servicio_id"),
                nombre=item["nombre"],
                precio=item.get("precio", 0),
                es_extra=item.get("es_extra", True),
            ))
            self.db.commit()
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise

    def agregar_producto(self, orden: OrdenTrabajo, producto_id: int,
                         cantidad: int) -> OrdenTrabajo:
        """Valida stock con lock y lo descuenta."""
        try:
            producto = (self.db.query(Producto)
                        .filter(Producto.id == producto_id)
                        .with_for_update().first())
            if not producto:
                raise ValueError(f"Producto {producto_id} no existe")
            if producto.stock < cantidad:
                raise ValueError(
                    f"Stock insuficiente de '{producto.nombre}': "
                    f"disponible {producto.stock}, solicitado {cantidad}")
            producto.stock -= cantidad
            self.db.add(OrdenTrabajoProducto(
                orden_id=orden.id,
                producto_id=producto_id,
                cantidad=cantidad,
                precio_unitario=producto.precioVenta,
            ))
            self.db.commit()
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise

    def quitar_servicio(self, orden: OrdenTrabajo, item_id: int) -> OrdenTrabajo:
        try:
            item = (self.db.query(OrdenTrabajoServicio)
                    .filter(OrdenTrabajoServicio.id == item_id,
                            OrdenTrabajoServicio.orden_id == orden.id)
                    .first())
            if not item:
                raise ValueError("Servicio no encontrado en la orden")
            self.db.delete(item)
            self.db.commit()
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise

    def quitar_producto(self, orden: OrdenTrabajo, item_id: int) -> OrdenTrabajo:
        """Quita el ítem y repone el stock."""
        try:
            item = (self.db.query(OrdenTrabajoProducto)
                    .filter(OrdenTrabajoProducto.id == item_id,
                            OrdenTrabajoProducto.orden_id == orden.id)
                    .first())
            if not item:
                raise ValueError("Producto no encontrado en la orden")
            producto = (self.db.query(Producto)
                        .filter(Producto.id == item.producto_id)
                        .with_for_update().first())
            if producto:
                producto.stock += item.cantidad
            self.db.delete(item)
            self.db.commit()
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise

    # ---------- Estados / pagos / proforma 2 ----------

    def reponer_stock_completo(self, orden: OrdenTrabajo) -> None:
        """Al cancelar una orden se repone el stock de todos sus productos.
        No hace commit (lo hace el caller)."""
        for item in orden.productos:
            producto = (self.db.query(Producto)
                        .filter(Producto.id == item.producto_id)
                        .with_for_update().first())
            if producto:
                producto.stock += item.cantidad

    def save(self, orden: OrdenTrabajo) -> OrdenTrabajo:
        try:
            self.db.commit()
            self.db.refresh(orden)
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise

    def registrar_pago(self, orden: OrdenTrabajo, monto: int,
                       metodo: str) -> OrdenTrabajo:
        try:
            self.db.add(Pago(orden_id=orden.id, monto=monto, metodo=metodo))
            self.db.commit()
            return self.get_by_id(orden.id)
        except Exception:
            self.db.rollback()
            raise
