# models/db_models.py - VERSION COMPLETA UNIFICADA

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ===================== USUARIO =====================
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    rol = Column(String(50), nullable=False, default="estudiante")
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    matriculas = relationship("Matricula", back_populates="estudiante")
    notificaciones = relationship("Notificacion", back_populates="usuario")
    logs = relationship("LogAuditoria", back_populates="usuario")
    exportaciones = relationship("HorarioExportado", back_populates="usuario")
    cambios = relationship("HistorialCambios", back_populates="usuario")


# ===================== FACULTAD =====================
class Facultad(Base):
    __tablename__ = "facultades"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    programas = relationship("Programa", back_populates="facultad")


# ===================== PROGRAMA =====================
class Programa(Base):
    __tablename__ = "programas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    facultad_id = Column(Integer, ForeignKey("facultades.id"))
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    facultad = relationship("Facultad", back_populates="programas")
    cursos = relationship("CursoDB", back_populates="programa")


# ===================== DOCENTE =====================
class Docente(Base):
    __tablename__ = "docentes"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    disponibilidad = Column(Text)
    max_horas_semanales = Column(Integer, default=20)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cursos = relationship("CursoDB", back_populates="docente")


# ===================== AULA =====================
class Aula(Base):
    __tablename__ = "aulas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    capacidad = Column(Integer, nullable=False)
    tipo = Column(String(50), default="teoria")
    edificio = Column(String(100), default="Principal")
    piso = Column(Integer, default=1)
    recursos = Column(Text)
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    horarios = relationship("HorarioGenerado", back_populates="aula")


# ===================== CURSO =====================
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
    
    horas_teoria = Column(Integer, default=0)
    horas_laboratorio = Column(Integer, default=0)
    horas_practica = Column(Integer, default=0)
    minutos_por_hora = Column(Integer, default=90)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    programa = relationship("Programa", back_populates="cursos")
    docente = relationship("Docente", back_populates="cursos")
    horarios = relationship("HorarioGenerado", back_populates="curso")


# ===================== HORARIO =====================
class HorarioGenerado(Base):
    __tablename__ = "horarios_generados"
    
    id = Column(Integer, primary_key=True, index=True)
    periodo = Column(String(20), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id"))
    docente_id = Column(Integer, ForeignKey("docentes.id"))
    aula_id = Column(Integer, ForeignKey("aulas.id"))
    franja = Column(String(50), nullable=False)
    seccion = Column(String(10), default="A")
    cupo_maximo = Column(Integer, default=30)
    cupo_disponible = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    curso = relationship("CursoDB", back_populates="horarios")
    docente = relationship("Docente")
    aula = relationship("Aula", back_populates="horarios")
    matriculas = relationship("Matricula", back_populates="horario")
    cambios = relationship("HistorialCambios", back_populates="horario")


# ===================== MATRICULA =====================
class Matricula(Base):
    __tablename__ = "matriculas"
    
    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"))
    horario_id = Column(Integer, ForeignKey("horarios_generados.id"))
    periodo = Column(String(20), nullable=False)
    estado = Column(String(20), default="activa")
    nota_final = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    estudiante = relationship("Usuario", back_populates="matriculas")
    horario = relationship("HorarioGenerado", back_populates="matriculas")


# ===================== SOLICITUDES =====================
class SolicitudRetiro(Base):
    """Solicitudes de retiro de cursos"""
    __tablename__ = "solicitudes_retiro"
    
    id = Column(Integer, primary_key=True, index=True)
    matricula_id = Column(Integer, ForeignKey("matriculas.id"), nullable=False)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    curso_id = Column(Integer, ForeignKey("cursos.id"), nullable=False)
    justificacion = Column(Text, nullable=False)
    estado = Column(String(20), default="pendiente")  # pendiente, aprobado, rechazado
    motivo_rechazo = Column(Text, nullable=True)
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    fecha_resolucion = Column(DateTime, nullable=True)
    resuelto_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    # Relaciones con foreign_keys explícitos
    matricula = relationship("Matricula", foreign_keys=[matricula_id])
    estudiante = relationship("Usuario", foreign_keys=[estudiante_id])
    curso = relationship("CursoDB", foreign_keys=[curso_id])
    resolvedor = relationship("Usuario", foreign_keys=[resuelto_por])


class SolicitudCambio(Base):
    """Solicitudes de cambio de sección/horario"""
    __tablename__ = "solicitudes_cambio"
    
    id = Column(Integer, primary_key=True, index=True)
    matricula_id = Column(Integer, ForeignKey("matriculas.id"), nullable=False)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    horario_actual_id = Column(Integer, ForeignKey("horarios_generados.id"), nullable=False)
    horario_deseado_id = Column(Integer, ForeignKey("horarios_generados.id"), nullable=False)
    justificacion = Column(Text, nullable=False)
    estado = Column(String(20), default="pendiente")  # pendiente, aprobado, rechazado
    motivo_rechazo = Column(Text, nullable=True)
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    fecha_resolucion = Column(DateTime, nullable=True)
    resuelto_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    # Relaciones con foreign_keys explícitos
    matricula = relationship("Matricula", foreign_keys=[matricula_id])
    estudiante = relationship("Usuario", foreign_keys=[estudiante_id])
    horario_actual = relationship("HorarioGenerado", foreign_keys=[horario_actual_id])
    horario_deseado = relationship("HorarioGenerado", foreign_keys=[horario_deseado_id])
    resolvedor = relationship("Usuario", foreign_keys=[resuelto_por])


# ===================== NUEVAS FUNCIONALIDADES =====================
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    used = Column(Boolean, default=False)


class LogAuditoria(Base):
    __tablename__ = "logs_auditoria"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    accion = Column(String(100), nullable=False)
    tabla_afectada = Column(String(50))
    registro_id = Column(Integer)
    detalles = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    usuario = relationship("Usuario", back_populates="logs")


class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(200), nullable=False)
    mensaje = Column(Text, nullable=False)
    tipo = Column(String(50), default="info")
    leida = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    usuario = relationship("Usuario", back_populates="notificaciones")


class HorarioExportado(Base):
    __tablename__ = "horarios_exportados"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    periodo = Column(String(20), nullable=False)
    formato = Column(String(10), nullable=False)
    fecha_exportacion = Column(DateTime, default=datetime.utcnow)
    
    usuario = relationship("Usuario", back_populates="exportaciones")


class HistorialCambios(Base):
    __tablename__ = "historial_cambios"
    
    id = Column(Integer, primary_key=True, index=True)
    horario_id = Column(Integer, ForeignKey("horarios_generados.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo_cambio = Column(String(50), nullable=False)
    datos_anteriores = Column(Text)
    datos_nuevos = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    horario = relationship("HorarioGenerado", back_populates="cambios")
    usuario = relationship("Usuario", back_populates="cambios")