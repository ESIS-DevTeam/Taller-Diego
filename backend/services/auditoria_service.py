from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from repositories.auditoria_repo import AuditoriaRepository
from schemas.auditoria_schema import AuditoriaCreate, AuditoriaResponse, AuditoriaFilter
from db.models.auditoria import Auditoria

class AuditoriaService:
    
    @staticmethod
    def registrar_accion(
        db: Session,
        modulo: str,
        accion: str,
        tabla: str,
        registro_id: int,
        usuario: str,
        datos_anteriores: Optional[Dict[str, Any]] = None,
        datos_nuevos: Optional[Dict[str, Any]] = None,
        descripcion: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Auditoria:
        """
        Registrar una acción en la auditoría
        
        Args:
            modulo: Módulo donde ocurrió la acción (producto, servicio, venta)
            accion: Tipo de acción (CREATE, UPDATE, DELETE)
            tabla: Nombre de la tabla afectada
            registro_id: ID del registro modificado
            usuario: Usuario que realizó la acción
            datos_anteriores: Datos antes del cambio (opcional)
            datos_nuevos: Datos después del cambio (opcional)
            descripcion: Descripción del cambio (opcional)
            ip_address: IP del usuario (opcional)
        """
        auditoria_data = AuditoriaCreate(
            modulo=modulo,
            accion=accion,
            tabla=tabla,
            registro_id=registro_id,
            usuario=usuario,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
            descripcion=descripcion,
            ip_address=ip_address
        )
        
        return AuditoriaRepository.create(db, auditoria_data)
    
    @staticmethod
    def obtener_historial(
        db: Session,
        tabla: str,
        registro_id: int
    ) -> List[AuditoriaResponse]:
        """Obtener el historial completo de cambios de un registro"""
        return AuditoriaRepository.get_by_registro(db, tabla, registro_id)
    
    @staticmethod
    def obtener_por_filtro(
        db: Session,
        filtro: AuditoriaFilter,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Obtener registros de auditoría con filtros y paginación"""
        registros_orm = AuditoriaRepository.get_by_filter(db, filtro, skip, limit)
        total = AuditoriaRepository.count_by_filter(db, filtro)
        
        # Convertir a dict
        registros = [{
            "id": r.id,
            "modulo": r.modulo,
            "accion": r.accion,
            "tabla": r.tabla,
            "registro_id": r.registro_id,
            "usuario": r.usuario,
            "fecha": r.fecha.isoformat(),
            "datos_anteriores": r.datos_anteriores,
            "datos_nuevos": r.datos_nuevos,
            "descripcion": r.descripcion,
            "ip_address": r.ip_address
        } for r in registros_orm]
        
        return {
            "total": total,
            "registros": registros,
            "pagina": skip // limit + 1 if limit > 0 else 1,
            "total_paginas": (total + limit - 1) // limit if limit > 0 else 1
        }
    
    @staticmethod
    def obtener_acciones_usuario(
        db: Session,
        usuario: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[AuditoriaResponse]:
        """Obtener todas las acciones realizadas por un usuario"""
        return AuditoriaRepository.get_by_usuario(db, usuario, skip, limit)
    
    @staticmethod
    def generar_descripcion_cambio(
        accion: str,
        datos_anteriores: Optional[Dict[str, Any]],
        datos_nuevos: Optional[Dict[str, Any]]
    ) -> str:
        """Generar una descripción legible del cambio realizado"""
        if accion == "CREATE":
            return f"Se creó un nuevo registro"
        
        elif accion == "DELETE":
            return f"Se eliminó el registro"
        
        elif accion == "UPDATE" and datos_anteriores and datos_nuevos:
            cambios = []
            for key in datos_nuevos.keys():
                if key in datos_anteriores and datos_anteriores[key] != datos_nuevos[key]:
                    cambios.append(
                        f"{key}: '{datos_anteriores[key]}' → '{datos_nuevos[key]}'"
                    )
            
            if cambios:
                return f"Se modificó: {', '.join(cambios)}"
            else:
                return "No se detectaron cambios"
        
        return "Acción registrada"
