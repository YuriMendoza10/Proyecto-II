# D:\TALLER 2\optiacademic\backend\migrar_bd.py
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, inspect
from database import engine, SessionLocal
from models.db_models import CursoDB

def agregar_columnas():
    """Agregar nuevas columnas a la tabla cursos usando SQLAlchemy"""
    
    print("🔍 Verificando estructura de la tabla...")
    
    with engine.connect() as conn:
        # Obtener columnas existentes
        inspector = inspect(engine)
        columnas = [col['name'] for col in inspector.get_columns('cursos')]
        
        print(f"📋 Columnas actuales: {columnas}")
        
        # Definir nuevas columnas
        nuevas_columnas = {
            'horas_teoria': 'INT DEFAULT 0',
            'horas_laboratorio': 'INT DEFAULT 0',
            'horas_practica': 'INT DEFAULT 0',
            'minutos_por_hora': 'INT DEFAULT 90'
        }
        
        # Agregar columnas que falten
        for columna, tipo in nuevas_columnas.items():
            if columna not in columnas:
                try:
                    print(f"➕ Agregando columna: {columna}")
                    conn.execute(text(f"ALTER TABLE cursos ADD COLUMN {columna} {tipo}"))
                    conn.commit()
                    print(f"   ✅ Columna '{columna}' agregada correctamente")
                except Exception as e:
                    print(f"   ⚠️ Error: {e}")
            else:
                print(f"   ⚠️ Columna '{columna}' ya existe")
    
    print("\n✅ Estructura actualizada correctamente")

def actualizar_valores_cursos():
    """Actualizar los valores por defecto de los cursos"""
    print("\n📝 Actualizando valores de cursos...")
    
    db = SessionLocal()
    cursos = db.query(CursoDB).all()
    
    if not cursos:
        print("   ⚠️ No hay cursos en la base de datos")
        db.close()
        return
    
    actualizados = 0
    for curso in cursos:
        necesita_actualizar = False
        
        # Asignar valores según el tipo de curso
        if curso.tipo == 'teoria':
            if curso.horas_teoria == 0:
                curso.horas_teoria = curso.horas_semanales
                necesita_actualizar = True
            if curso.minutos_por_hora == 0:
                curso.minutos_por_hora = 90
                necesita_actualizar = True
                
        elif curso.tipo == 'laboratorio':
            if curso.horas_teoria == 0:
                curso.horas_teoria = curso.horas_semanales // 2
                necesita_actualizar = True
            if curso.horas_laboratorio == 0:
                curso.horas_laboratorio = curso.horas_semanales // 2
                necesita_actualizar = True
            if curso.minutos_por_hora == 0:
                curso.minutos_por_hora = 90
                necesita_actualizar = True
                
        elif curso.tipo == 'taller':
            if curso.horas_teoria == 0:
                curso.horas_teoria = curso.horas_semanales // 3
                necesita_actualizar = True
            if curso.horas_practica == 0:
                curso.horas_practica = curso.horas_semanales * 2 // 3
                necesita_actualizar = True
            if curso.minutos_por_hora == 0:
                curso.minutos_por_hora = 180
                necesita_actualizar = True
        else:
            if curso.horas_teoria == 0:
                curso.horas_teoria = curso.horas_semanales
                necesita_actualizar = True
            if curso.minutos_por_hora == 0:
                curso.minutos_por_hora = 90
                necesita_actualizar = True
        
        if necesita_actualizar:
            actualizados += 1
            print(f"   ✏️ Actualizado: {curso.codigo} - {curso.nombre}")
            print(f"      Teoría: {curso.horas_teoria}h | Lab: {curso.horas_laboratorio}h | Práctica: {curso.horas_practica}h")
    
    if actualizados > 0:
        db.commit()
        print(f"\n✅ Actualizados {actualizados} cursos")
    else:
        print("   ℹ️ Todos los cursos ya están actualizados")
    
    db.close()

def verificar_estructura():
    """Verificar la estructura final"""
    print("\n🔍 Verificando estructura final...")
    
    inspector = inspect(engine)
    columnas = [col['name'] for col in inspector.get_columns('cursos')]
    
    columnas_requeridas = ['id', 'codigo', 'nombre', 'creditos', 'semestre', 
                          'horas_teoria', 'horas_laboratorio', 'horas_practica', 
                          'minutos_por_hora']
    
    print("\n📊 Columnas en tabla 'cursos':")
    for col in columnas_requeridas:
        estado = "✅" if col in columnas else "❌"
        print(f"   {estado} {col}")
    
    # Mostrar algunos cursos como ejemplo
    db = SessionLocal()
    cursos = db.query(CursoDB).limit(5).all()
    
    if cursos:
        print("\n📚 Ejemplo de cursos:")
        for curso in cursos:
            print(f"\n   📖 {curso.codigo} - {curso.nombre}")
            print(f"      Tipo: {curso.tipo}")
            print(f"      Horas semanales: {curso.horas_semanales}")
            print(f"      Teoría: {curso.horas_teoria}h")
            print(f"      Laboratorio: {curso.horas_laboratorio}h")
            print(f"      Práctica: {curso.horas_practica}h")
            print(f"      Minutos por hora: {curso.minutos_por_hora}")
    
    db.close()

def main():
    print("="*60)
    print("🚀 MIGRANDO BASE DE DATOS - OPTIACADEMIC")
    print("="*60)
    
    try:
        # Paso 1: Agregar columnas
        print("\n" + "="*40)
        print("PASO 1: Agregando nuevas columnas")
        print("="*40)
        agregar_columnas()
        
        # Paso 2: Actualizar valores
        print("\n" + "="*40)
        print("PASO 2: Actualizando valores de cursos")
        print("="*40)
        actualizar_valores_cursos()
        
        # Paso 3: Verificar
        print("\n" + "="*40)
        print("PASO 3: Verificando estructura")
        print("="*40)
        verificar_estructura()
        
        print("\n" + "="*60)
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()