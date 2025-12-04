"""
Script para crear la tabla de auditoría en la base de datos

Ejecutar con: python crear_tabla_auditoria.py
"""

from sqlalchemy import create_engine, text
from db.models.auditoria import Auditoria
from db.base import Base
from core.config import settings

def crear_tabla_auditoria():
    """Crear la tabla de auditoría en la base de datos"""
    
    # Crear engine
    engine = create_engine(settings.DATABASE_URL)
    
    # Crear la tabla
    print("Creando tabla de auditoría...")
    Base.metadata.create_all(bind=engine, tables=[Auditoria.__table__])
    print("✅ Tabla 'auditoria' creada exitosamente")
    
    # Crear índices para mejorar el rendimiento de consultas
    with engine.connect() as conn:
        print("\nCreando índices...")
        
        # Índice en modulo + fecha
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_auditoria_modulo_fecha 
            ON auditoria(modulo, fecha DESC)
        """))
        
        # Índice en tabla + registro_id
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro 
            ON auditoria(tabla, registro_id)
        """))
        
        # Índice en usuario
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_auditoria_usuario 
            ON auditoria(usuario)
        """))
        
        # Índice en acción
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_auditoria_accion 
            ON auditoria(accion)
        """))
        
        # Índice en fecha
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_auditoria_fecha 
            ON auditoria(fecha DESC)
        """))
        
        conn.commit()
        print("✅ Índices creados exitosamente")
    
    print("\n✨ Configuración de auditoría completada")
    print("\nPuedes empezar a registrar acciones usando AuditoriaService")

if __name__ == "__main__":
    crear_tabla_auditoria()
