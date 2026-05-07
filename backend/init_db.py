# D:\TALLER 2\optiacademic\backend\init_db.py
import pymysql
import sys

print("="*60)
print("🚀 INICIALIZANDO BASE DE DATOS")
print("="*60)

# Configuración
MYSQL_USER = "root"
MYSQL_PASSWORD = "paracetamor"
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
MYSQL_DB = "optiacademic_db"

def inicializar():
    try:
        # 1. Conectar a MySQL (sin base de datos)
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT
        )
        cursor = connection.cursor()
        
        # 2. Crear base de datos si no existe
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB}")
        print(f"✅ Base de datos '{MYSQL_DB}' creada/verificada")
        
        # 3. Usar la base de datos
        cursor.execute(f"USE {MYSQL_DB}")
        
        cursor.close()
        connection.close()
        
        print("\n✅ Configuración de base de datos completada")
        print("\n📋 Ahora ejecuta:")
        print("   python seed_sistemas.py")
        
        return True
        
    except pymysql.Error as e:
        print(f"\n❌ Error: {e}")
        print("\nPosibles soluciones:")
        print("1. Verifica que MySQL esté instalado y corriendo")
        print("2. Verifica la contraseña: 'paracetamor'")
        print("3. Ejecuta 'services.msc' y busca MySQL para iniciar el servicio")
        print("4. Si no tienes MySQL, instálalo desde https://dev.mysql.com/downloads/installer/")
        return False

if __name__ == "__main__":
    inicializar()