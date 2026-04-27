# crear_bd_mysql.py
import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="paracetamor"
    )
    
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS optiacademic_db")
    print("✅ Base de datos creada")
    
    cursor.close()
    conn.close()
    
except mysql.connector.Error as err:
    print(f"❌ Error: {err}")
    print("Verifica que MySQL esté instalado y corriendo")