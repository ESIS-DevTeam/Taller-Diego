from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
from db.models.auditoria import Auditoria
from schemas.auditoria_schema import AuditoriaCreate, AuditoriaFilter

class AuditoriaRepository:
    
    @staticmethod
    def create(db: Session, auditoria: AuditoriaCreate) -> Auditoria:
        """Crear un nuevo registro de auditoría"""
        db_auditoria = Auditoria(**auditoria.dict())
        db.add(db_auditoria)
        db.commit()
        db.refresh(db_auditoria)
        return db_auditoria
    
    @staticmethod
    def get_by_id(db: Session, auditoria_id: int) -> Optional[Auditoria]:
        """Obtener un registro de auditoría por ID"""
        return db.query(Auditoria).filter(Auditoria.id == auditoria_id).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Auditoria]:
        """Obtener todos los registros de auditoría con paginación"""
        return db.query(Auditoria).order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_filter(db: Session, filtro: AuditoriaFilter, skip: int = 0, limit: int = 100) -> List[Auditoria]:
        """Obtener registros de auditoría con filtros"""
        query = db.query(Auditoria)
        
        if filtro.modulo:
            query = query.filter(Auditoria.modulo == filtro.modulo)
        
        if filtro.accion:
            query = query.filter(Auditoria.accion == filtro.accion)
        
        if filtro.tabla:
            query = query.filter(Auditoria.tabla == filtro.tabla)
        
        if filtro.usuario:
            query = query.filter(Auditoria.usuario.ilike(f"%{filtro.usuario}%"))
        
        if filtro.registro_id:
            query = query.filter(Auditoria.registro_id == filtro.registro_id)
        
        if filtro.fecha_inicio:
            query = query.filter(Auditoria.fecha >= filtro.fecha_inicio)
        
        if filtro.fecha_fin:
            query = query.filter(Auditoria.fecha <= filtro.fecha_fin)
        
        return query.order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_registro(db: Session, tabla: str, registro_id: int) -> List[Auditoria]:
        """Obtener historial completo de un registro específico"""
        return db.query(Auditoria).filter(
            and_(Auditoria.tabla == tabla, Auditoria.registro_id == registro_id)
        ).order_by(Auditoria.fecha.desc()).all()
    
    @staticmethod
    def get_by_usuario(db: Session, usuario: str, skip: int = 0, limit: int = 100) -> List[Auditoria]:
        """Obtener todas las acciones de un usuario"""
        return db.query(Auditoria).filter(
            Auditoria.usuario == usuario
        ).order_by(Auditoria.fecha.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def count_by_filter(db: Session, filtro: AuditoriaFilter) -> int:
        """Contar registros que coinciden con el filtro"""
        query = db.query(Auditoria)
        
        if filtro.modulo:
            query = query.filter(Auditoria.modulo == filtro.modulo)
        
        if filtro.accion:
            query = query.filter(Auditoria.accion == filtro.accion)
        
        if filtro.tabla:
            query = query.filter(Auditoria.tabla == filtro.tabla)
        
        if filtro.usuario:
            query = query.filter(Auditoria.usuario.ilike(f"%{filtro.usuario}%"))
        
        if filtro.registro_id:
            query = query.filter(Auditoria.registro_id == filtro.registro_id)
        
        if filtro.fecha_inicio:
            query = query.filter(Auditoria.fecha >= filtro.fecha_inicio)
        
        if filtro.fecha_fin:
            query = query.filter(Auditoria.fecha <= filtro.fecha_fin)
        
        return query.count()
