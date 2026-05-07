# D:\TALLER 2\optiacademic\backend\test_conexion.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from sqlalchemy import text

print("="*60)
print("🔌 VERIFICANDO CONEXIÓN A BASE DE DATOS")
print("="*60)

try:
    # Probar conexión
    with engine.connect() as conn:
        result = conn.execute(text("SELECT VERSION()"))
        version = result.fetchone()[0]
        print(f"✅ Conexión exitosa a MySQL")
        print(f"   Versión: {version}")
        
    # Probar sesión
    db = SessionLocal()
    print(f"✅ Sesión creada correctamente")
    db.close()
    
except Exception as e:
    print(f"❌ Error de conexión: {e}")
    print("\nPosibles soluciones:")
    print("1. Verifica que MySQL está corriendo")
    print("2. Verifica la contraseña en database.py")
    print("3. Ejecuta: python crear_bd.py")