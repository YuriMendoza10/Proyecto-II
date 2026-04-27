# crear_bd.py
import pymysql

# Configuración
MYSQL_USER = "root"
MYSQL_PASSWORD = "paracetamor"
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
MYSQL_DB = "optiacademic_db"

def crear_base_datos():
    """Crear la base de datos si no existe"""
    try:
        # Conectar sin seleccionar base de datos
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT
        )
        
        cursor = connection.cursor()
        
        # Crear base de datos
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
        print(f"✅ Base de datos '{MYSQL_DB}' creada o ya existe")
        
        # Usar la base de datos
        cursor.execute(f"USE {MYSQL_DB}")
        
        # Verificar tablas (opcional)
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"📊 Tablas existentes: {len(tables)}")
        
        cursor.close()
        connection.close()
        
        print("✅ Configuración completada")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nPosibles soluciones:")
        print("1. Verifica que MySQL esté instalado y corriendo")
        print("2. Verifica la contraseña: 'paracetamor'")
        print("3. Ejecuta este script como administrador")

if __name__ == "__main__":
    crear_base_datos()