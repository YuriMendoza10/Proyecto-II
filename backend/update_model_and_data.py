# update_model_and_data.py
import sys
import os
import json
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models.db_models import CursoDB

def actualizar_estructura():
    """Actualizar estructura de la tabla cursos"""
    
    with engine.connect() as conn:
        # Verificar columnas existentes
        result = conn.execute(text("SHOW COLUMNS FROM cursos"))
        columnas = [row[0] for row in result]
        
        nuevas_columnas = {
            'horas_teoria': 'INT DEFAULT 0',
            'horas_laboratorio': 'INT DEFAULT 0',
            'horas_practica': 'INT DEFAULT 0',
            'minutos_por_hora': 'INT DEFAULT 90'
        }
        
        for columna, tipo in nuevas_columnas.items():
            if columna not in columnas:
                try:
                    conn.execute(text(f"ALTER TABLE cursos ADD COLUMN {columna} {tipo}"))
                    print(f"✅ Columna '{columna}' agregada")
                except Exception as e:
                    print(f"❌ Error agregando '{columna}': {e}")
            else:
                print(f"⚠️ Columna '{columna}' ya existe")
        
        conn.commit()

def actualizar_datos_cursos():
    """Actualizar los cursos con valores por defecto"""
    db = SessionLocal()
    
    cursos = db.query(CursoDB).all()
    
    for curso in cursos:
        # Asignar valores por defecto según el tipo de curso
        if curso.tipo == 'teoria':
            curso.horas_teoria = curso.horas_semanales
            curso.horas_laboratorio = 0
            curso.horas_practica = 0
            curso.minutos_por_hora = 90
        elif curso.tipo == 'laboratorio':
            curso.horas_teoria = curso.horas_semanales // 2
            curso.horas_laboratorio = curso.horas_semanales // 2
            curso.horas_practica = 0
            curso.minutos_por_hora = 90
        elif curso.tipo == 'taller':
            curso.horas_teoria = curso.horas_semanales // 3
            curso.horas_practica = curso.horas_semanales * 2 // 3
            curso.horas_laboratorio = 0
            curso.minutos_por_hora = 180
        else:
            curso.horas_teoria = curso.horas_semanales
            curso.horas_laboratorio = 0
            curso.horas_practica = 0
            curso.minutos_por_hora = 90
    
    db.commit()
    print(f"✅ Actualizados {len(cursos)} cursos")
    db.close()

def mostrar_cursos():
    """Mostrar cursos actualizados"""
    db = SessionLocal()
    cursos = db.query(CursoDB).all()
    
    print("\n" + "="*70)
    print("📚 Cursos actualizados:")
    print("="*70)
    
    for curso in cursos[:10]:
        print(f"\n📖 {curso.codigo} - {curso.nombre}")
        print(f"   Tipo: {curso.tipo}")
        print(f"   Teoría: {curso.horas_teoria}h | Laboratorio: {curso.horas_laboratorio}h | Práctica: {curso.horas_practica}h")
        print(f"   Duración por hora: {curso.minutos_por_hora} minutos")
    
    db.close()

if __name__ == "__main__":
    print("="*50)
    print("🚀 ACTUALIZANDO MODELO DE BASE DE DATOS")
    print("="*50)
    
    # Paso 1: Actualizar estructura
    print("\n1️⃣ Actualizando estructura de tablas...")
    actualizar_estructura()
    
    # Paso 2: Actualizar datos
    print("\n2️⃣ Actualizando datos de cursos...")
    actualizar_datos_cursos()
    
    # Paso 3: Mostrar resultados
    print("\n3️⃣ Resultados:")
    mostrar_cursos()
    
    print("\n✅ Proceso completado. Ahora puedes ejecutar seed_cursos_practica.py")