# models/db_models.py - VERSIÓN CORREGIDA PARA MYSQL
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)  # ← longitud 255
    hashed_password = Column(String(255), nullable=False)  # ← longitud 255
    nombre = Column(String(100), nullable=False)  # ← longitud 100
    apellido = Column(String(100), nullable=False)  # ← longitud 100
    rol = Column(String(50), nullable=False, default="estudiante")  # ← longitud 50
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    matriculas = relationship("Matricula", back_populates="estudiante")

class Facultad(Base):
    __tablename__ = "facultades"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)  # ← longitud 20
    nombre = Column(String(200), nullable=False)  # ← longitud 200
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    programas = relationship("Programa", back_populates="facultad")

class Programa(Base):
    __tablename__ = "programas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)  # ← longitud 20
    nombre = Column(String(200), nullable=False)  # ← longitud 200
    facultad_id = Column(Integer, ForeignKey("facultades.id"))
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    facultad = relationship("Facultad", back_populates="programas")
    cursos = relationship("CursoDB", back_populates="programa")

class Docente(Base):
    __tablename__ = "docentes"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)  # ← longitud 20
    nombre = Column(String(100), nullable=False)  # ← longitud 100
    apellido = Column(String(100), nullable=False)  # ← longitud 100
    email = Column(String(255), unique=True, nullable=False)  # ← longitud 255
    disponibilidad = Column(Text)  # Text no necesita longitud
    max_horas_semanales = Column(Integer, default=20)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    cursos = relationship("CursoDB", back_populates="docente")

class Aula(Base):
    __tablename__ = "aulas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)  # ← longitud 20
    nombre = Column(String(100), nullable=False)  # ← longitud 100
    capacidad = Column(Integer, nullable=False)
    tipo = Column(String(50), default="teoria")  # ← longitud 50
    edificio = Column(String(100), default="Principal")  # ← longitud 100
    piso = Column(Integer, default=1)
    recursos = Column(Text)  # Text para JSON
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    horarios = relationship("HorarioGenerado", back_populates="aula")

class CursoDB(Base):
    __tablename__ = "cursos"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    creditos = Column(Integer, nullable=False)
    semestre = Column(Integer, nullable=False)
    programa_id = Column(Integer, ForeignKey("programas.id"))
    docente_id = Column(Integer, ForeignKey("docentes.id"))
    max_estudiantes = Column(Integer, default=30)
    tipo = Column(String(50), default="teoria")
    horas_semanales = Column(Integer, default=4)
    
    # Nuevos campos para distribución de horas
    horas_teoria = Column(Integer, default=0)      # Horas de teoría por semana
    horas_laboratorio = Column(Integer, default=0) # Horas de laboratorio por semana
    horas_practica = Column(Integer, default=0)    # Horas de práctica por semana
    minutos_por_hora = Column(Integer, default=90) # 90 minutos por hora teórica, 180 para práctica
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    programa = relationship("Programa", back_populates="cursos")
    docente = relationship("Docente", back_populates="cursos")
    horarios = relationship("HorarioGenerado", back_populates="curso")

class HorarioGenerado(Base):
    __tablename__ = "horarios_generados"
    
    id = Column(Integer, primary_key=True, index=True)
    periodo = Column(String(20), nullable=False)  # ← longitud 20
    curso_id = Column(Integer, ForeignKey("cursos.id"))
    docente_id = Column(Integer, ForeignKey("docentes.id"))
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    franja = Column(String(50), nullable=False)  # ← longitud 50
    seccion = Column(String(10), default="A")  # ← longitud 10
    cupo_maximo = Column(Integer, default=30)
    cupo_disponible = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    curso = relationship("CursoDB", back_populates="horarios")
    docente = relationship("Docente")
    aula = relationship("Aula", back_populates="horarios")
    matriculas = relationship("Matricula", back_populates="horario")

class Matricula(Base):
    __tablename__ = "matriculas"
    
    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"))
    horario_id = Column(Integer, ForeignKey("horarios_generados.id"))
    periodo = Column(String(20), nullable=False)  # ← longitud 20
    estado = Column(String(20), default="activa")  # ← longitud 20
    nota_final = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    estudiante = relationship("Usuario", back_populates="matriculas")
    horario = relationship("HorarioGenerado", back_populates="matriculas")