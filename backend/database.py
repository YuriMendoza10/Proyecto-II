# database.py - Verifica que use MySQL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pymysql

# Configuración para MySQL
MYSQL_USER = "root"  # o tu usuario
MYSQL_PASSWORD = "paracetamor"  # tu contraseña
MYSQL_HOST = "localhost"
MYSQL_PORT = "3306"
MYSQL_DB = "optiacademic_db"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()