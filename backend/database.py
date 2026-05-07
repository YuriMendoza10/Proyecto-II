# D:\TALLER 2\optiacademic\backend\database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pymysql

# ========== CONFIGURACIÓN DE MYSQL ==========
# Cambia estos valores según tu configuración
MYSQL_USER = "root"
MYSQL_PASSWORD = "paracetamor"  # Tu contraseña de MySQL
MYSQL_HOST = "localhost"
MYSQL_PORT = "3306"
MYSQL_DB = "optiacademic_db"

# URL de conexión
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

# Crear engine con opciones para MySQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Cambia a True para ver SQL en consola
)

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Dependencia para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()