# ========== main.py (COMPLETO MEJORADO) ==========
import json
import logging
from datetime import timedelta
from typing import List, Dict, Any, Optional
from functools import wraps

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from datetime import datetime

from database import get_db, engine
from models.db_models import Base, Facultad, Programa, Docente, Aula, CursoDB, HorarioGenerado, Usuario, Matricula
from models.schemas import HorarioRequest, HorarioResponse
from csp_engine import CSPEngine
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    require_role, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear tablas al inicio
Base.metadata.create_all(bind=engine)

# ========== SCHEMAS MEJORADOS ==========
class FacultadCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    codigo: str = Field(..., min_length=1, max_length=10)
    
    @validator('codigo')
    def codigo_upper(cls, v):
        return v.upper()

class ProgramaCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    codigo: str = Field(..., min_length=1, max_length=10)
    facultad_id: int = Field(..., gt=0)
    
    @validator('codigo')
    def codigo_upper(cls, v):
        return v.upper()

class DocenteCreate(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=20)
    nombre: str = Field(..., min_length=1)
    apellido: str = Field(..., min_length=1)
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    disponibilidad: List[str] = []
    max_horas_semanales: int = Field(20, ge=4, le=40)
    
    @validator('codigo')
    def codigo_upper(cls, v):
        return v.upper()

class AulaCreate(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=20)
    nombre: str = Field(..., min_length=1)
    capacidad: int = Field(..., ge=5, le=500)
    tipo: str = Field("teoria", pattern=r'^(teoria|laboratorio|taller|auditorio)$')
    edificio: str = "Principal"
    piso: int = Field(1, ge=0, le=20)
    recursos: List[str] = []
    
    @validator('codigo')
    def codigo_upper(cls, v):
        return v.upper()

class CursoCreate(BaseModel):
    codigo: str = Field(..., pattern=r'^[A-Z]{2,4}[0-9]{3,4}$')
    nombre: str = Field(..., min_length=1)
    creditos: int = Field(..., ge=1, le=6)
    semestre: int = Field(..., ge=1, le=12)
    programa_id: int = Field(..., gt=0)
    docente_id: int = Field(..., gt=0)
    max_estudiantes: int = Field(30, ge=5, le=200)
    tipo: str = Field("teoria", pattern=r'^(teoria|laboratorio|taller|practica)$')
    horas_semanales: int = Field(4, ge=2, le=20)
    
    @validator('codigo')
    def codigo_upper(cls, v):
        return v.upper()

class MatriculaInscripcion(BaseModel):
    horario_ids: List[int] = Field(..., min_items=1, max_items=8)
    
    @validator('horario_ids')
    def no_duplicados(cls, v):
        if len(v) != len(set(v)):
            raise ValueError('No se permiten IDs duplicados')
        return v

class UsuarioCreate(BaseModel):
    email: str
    password: str
    nombre: str
    apellido: str
    rol: str = Field("estudiante", pattern=r'^(admin|coordinador|docente|estudiante)$')

# ========== FUNCIONES AUXILIARES ==========
def parse_json_field(value: str) -> List:
    """Helper para parsear campos JSON de la BD"""
    if value is None or value == '':
        return []
    try:
        return json.loads(value)
    except:
        return []

def serialize_json_field(value: List) -> str:
    """Helper para serializar listas a JSON"""
    if value is None:
        return '[]'
    return json.dumps(value)

def get_curso_nombre(db: Session, curso_id: int) -> str:
    """Obtener nombre del curso por ID"""
    curso = db.query(CursoDB).filter(CursoDB.id == curso_id).first()
    return curso.nombre if curso else "Desconocido"

def get_docente_nombre(db: Session, docente_id: int) -> str:
    """Obtener nombre completo del docente"""
    docente = db.query(Docente).filter(Docente.id == docente_id).first()
    return f"{docente.nombre} {docente.apellido}" if docente else "Desconocido"

# ========== INICIALIZAR APP ==========
app = FastAPI(title="OptiAcademic API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api/v1", tags=["OptiAcademic"])

# ========== ENDPOINTS DE CATÁLOGO ==========
@router.post("/facultades", status_code=status.HTTP_201_CREATED)
def crear_facultad(data: FacultadCreate, db: Session = Depends(get_db)):
    """Crear una nueva facultad"""
    # Verificar si ya existe
    existing = db.query(Facultad).filter(Facultad.codigo == data.codigo).first()
    if existing:
        raise HTTPException(400, f"Ya existe una facultad con código {data.codigo}")
    
    facultad = Facultad(**data.model_dump())
    db.add(facultad)
    db.commit()
    db.refresh(facultad)
    logger.info(f"Facultad creada: {facultad.codigo} - {facultad.nombre}")
    return facultad

@router.get("/facultades")
def listar_facultades(db: Session = Depends(get_db)):
    """Listar todas las facultades"""
    return db.query(Facultad).filter(Facultad.activo == True).all()

@router.post("/programas", status_code=status.HTTP_201_CREATED)
def crear_programa(data: ProgramaCreate, db: Session = Depends(get_db)):
    """Crear un nuevo programa académico"""
    # Verificar facultad
    facultad = db.query(Facultad).filter(Facultad.id == data.facultad_id).first()
    if not facultad:
        raise HTTPException(404, "Facultad no encontrada")
    
    existing = db.query(Programa).filter(Programa.codigo == data.codigo).first()
    if existing:
        raise HTTPException(400, f"Ya existe un programa con código {data.codigo}")
    
    programa = Programa(**data.model_dump())
    db.add(programa)
    db.commit()
    db.refresh(programa)
    logger.info(f"Programa creado: {programa.codigo} - {programa.nombre}")
    return programa

@router.get("/programas")
def listar_programas(facultad_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Listar programas, opcionalmente filtrando por facultad"""
    query = db.query(Programa).filter(Programa.activo == True)
    if facultad_id:
        query = query.filter(Programa.facultad_id == facultad_id)
    return query.all()

@router.post("/docentes", status_code=status.HTTP_201_CREATED)
def crear_docente(data: DocenteCreate, db: Session = Depends(get_db)):
    """Crear un nuevo docente"""
    existing = db.query(Docente).filter(Docente.codigo == data.codigo).first()
    if existing:
        raise HTTPException(400, f"Ya existe un docente con código {data.codigo}")
    
    docente_data = data.model_dump()
    docente_data['disponibilidad'] = serialize_json_field(docente_data['disponibilidad'])
    
    docente = Docente(**docente_data)
    db.add(docente)
    db.commit()
    db.refresh(docente)
    
    return {
        "id": docente.id,
        "codigo": docente.codigo,
        "nombre": docente.nombre,
        "apellido": docente.apellido,
        "email": docente.email,
        "disponibilidad": parse_json_field(docente.disponibilidad),
        "max_horas_semanales": docente.max_horas_semanales,
        "activo": docente.activo
    }

@router.get("/docentes")
def listar_docentes(activo: Optional[bool] = True, db: Session = Depends(get_db)):
    """Listar docentes"""
    query = db.query(Docente)
    if activo is not None:
        query = query.filter(Docente.activo == activo)
    
    return [
        {
            "id": d.id,
            "codigo": d.codigo,
            "nombre": d.nombre,
            "apellido": d.apellido,
            "email": d.email,
            "disponibilidad": parse_json_field(d.disponibilidad),
            "max_horas_semanales": d.max_horas_semanales,
            "activo": d.activo
        }
        for d in query.all()
    ]

@router.post("/aulas", status_code=status.HTTP_201_CREATED)
def crear_aula(data: AulaCreate, db: Session = Depends(get_db)):
    """Crear una nueva aula"""
    existing = db.query(Aula).filter(Aula.codigo == data.codigo).first()
    if existing:
        raise HTTPException(400, f"Ya existe un aula con código {data.codigo}")
    
    aula_data = data.model_dump()
    aula_data['recursos'] = serialize_json_field(aula_data['recursos'])
    
    aula = Aula(**aula_data)
    db.add(aula)
    db.commit()
    db.refresh(aula)
    
    return {
        "id": aula.id,
        "codigo": aula.codigo,
        "nombre": aula.nombre,
        "capacidad": aula.capacidad,
        "tipo": aula.tipo,
        "edificio": aula.edificio,
        "piso": aula.piso,
        "recursos": parse_json_field(aula.recursos),
        "activa": aula.activa
    }

@router.get("/aulas")
def listar_aulas(activa: Optional[bool] = True, tipo: Optional[str] = None, db: Session = Depends(get_db)):
    """Listar aulas, opcionalmente filtrando por tipo y estado"""
    query = db.query(Aula)
    if activa is not None:
        query = query.filter(Aula.activa == activa)
    if tipo:
        query = query.filter(Aula.tipo == tipo)
    
    return [
        {
            "id": a.id,
            "codigo": a.codigo,
            "nombre": a.nombre,
            "capacidad": a.capacidad,
            "tipo": a.tipo,
            "edificio": a.edificio,
            "piso": a.piso,
            "recursos": parse_json_field(a.recursos),
            "activa": a.activa
        }
        for a in query.all()
    ]

@router.post("/cursos", status_code=status.HTTP_201_CREATED)
def crear_curso(data: CursoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo curso"""
    # Validar relaciones
    programa = db.query(Programa).filter(Programa.id == data.programa_id).first()
    if not programa:
        raise HTTPException(404, "Programa no encontrado")
    
    docente = db.query(Docente).filter(Docente.id == data.docente_id).first()
    if not docente:
        raise HTTPException(404, "Docente no encontrado")
    
    existing = db.query(CursoDB).filter(CursoDB.codigo == data.codigo).first()
    if existing:
        raise HTTPException(400, f"Ya existe un curso con código {data.codigo}")
    
    curso = CursoDB(**data.model_dump())
    db.add(curso)
    db.commit()
    db.refresh(curso)
    logger.info(f"Curso creado: {curso.codigo} - {curso.nombre}")
    return curso

@router.get("/cursos")
def listar_cursos(
    semestre: Optional[int] = None, 
    programa_id: Optional[int] = None,
    docente_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Listar cursos con múltiples filtros"""
    query = db.query(CursoDB)
    
    if semestre:
        query = query.filter(CursoDB.semestre == semestre)
    if programa_id:
        query = query.filter(CursoDB.programa_id == programa_id)
    if docente_id:
        query = query.filter(CursoDB.docente_id == docente_id)
    
    cursos = query.all()
    return [
        {
            "id": c.id,
            "codigo": c.codigo,
            "nombre": c.nombre,
            "creditos": c.creditos,
            "semestre": c.semestre,
            "programa_id": c.programa_id,
            "programa_nombre": db.query(Programa).filter(Programa.id == c.programa_id).first().nombre if c.programa_id else None,
            "docente_id": c.docente_id,
            "docente_nombre": get_docente_nombre(db, c.docente_id) if c.docente_id else None,
            "max_estudiantes": c.max_estudiantes,
            "tipo": c.tipo,
            "horas_semanales": c.horas_semanales
        }
        for c in cursos
    ]

# ========== MOTOR CSP ==========
@router.post("/generar", response_model=HorarioResponse)
async def generar_horario(request: HorarioRequest, db: Session = Depends(get_db)):
    """Genera horarios usando el motor CSP"""
    logger.info("Iniciando generación de horarios")
    
    engine = CSPEngine()
    cursos = [c.model_dump() for c in request.cursos]
    aulas = [a.model_dump() for a in request.aulas]
    docentes = [d.model_dump() for d in request.docentes]
    
    resultado = engine.resolver(cursos, aulas, docentes)
    
    # Guardar en base de datos si la generación fue exitosa
    if resultado['estadisticas']['total_no_asignados'] == 0:
        periodo = request.periodo if hasattr(request, 'periodo') else "2025-1"
        
        # Limpiar horarios previos del periodo
        eliminados = db.query(HorarioGenerado).filter(HorarioGenerado.periodo == periodo).delete()
        
        for h in resultado['horario_generado']:
            curso_db = db.query(CursoDB).filter(CursoDB.codigo == h['curso_id']).first()
            docente_db = db.query(Docente).filter(Docente.codigo == h['docente_id']).first()
            aula_db = db.query(Aula).filter(Aula.codigo == h['aula_id']).first()
            
            hg = HorarioGenerado(
                periodo=periodo,
                curso_id=curso_db.id if curso_db else None,
                docente_id=docente_db.id if docente_db else None,
                aula_id=aula_db.id if aula_db else None,
                franja=h['franja'],
                seccion=h.get('seccion', 'A'),
                cupo_maximo=curso_db.max_estudiantes if curso_db else 30,
                cupo_disponible=curso_db.max_estudiantes if curso_db else 30
            )
            db.add(hg)
        
        db.commit()
        logger.info(f"Horario generado y guardado: {len(resultado['horario_generado'])} asignaciones")
        resultado['mensaje'] = f"Horario generado exitosamente. {len(resultado['horario_generado'])} cursos asignados."
    else:
        logger.warning(f"Generación incompleta: {resultado['estadisticas']['total_no_asignados']} cursos sin asignar")
        resultado['mensaje'] = "Generación incompleta. Algunos cursos no pudieron ser asignados."
    
    return resultado

# ========== HORARIOS DISPONIBLES ==========
@router.get("/horarios-disponibles")
def horarios_disponibles(
    periodo: str = "2025-1", 
    programa_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Retorna horarios disponibles para matrícula"""
    query = db.query(HorarioGenerado).filter(
        HorarioGenerado.periodo == periodo,
        HorarioGenerado.cupo_disponible > 0
    )
    
    horarios = query.all()
    
    resultado = []
    for h in horarios:
        curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first() if h.curso_id else None
        
        # Filtrar por programa si se especifica
        if programa_id and curso and curso.programa_id != programa_id:
            continue
        
        resultado.append({
            "id": h.id,
            "curso_id": h.curso_id,
            "curso_codigo": curso.codigo if curso else "N/A",
            "curso_nombre": curso.nombre if curso else "Desconocido",
            "creditos": curso.creditos if curso else 0,
            "docente_id": h.docente_id,
            "docente_nombre": get_docente_nombre(db, h.docente_id) if h.docente_id else "N/A",
            "aula_id": h.aula_id,
            "franja": h.franja,
            "seccion": h.seccion,
            "cupo_maximo": h.cupo_maximo,
            "cupo_disponible": h.cupo_disponible,
            "ocupacion": round((1 - h.cupo_disponible/h.cupo_maximo) * 100) if h.cupo_maximo > 0 else 0
        })
    
    return resultado

# ========== MATRÍCULA ==========
@router.post("/matricular")
def matricular(
    data: MatriculaInscripcion,
    current_user: Usuario = Depends(require_role(["estudiante"])),
    db: Session = Depends(get_db)
):
    """
    Estudiante se matricula en cursos. Validaciones:
    - Cupos disponibles
    - Sin cruces de horario
    - Sin duplicados
    - Límite de cursos por semestre
    """
    periodo_actual = "2025-1"
    max_cursos = 6  # Máximo de cursos por semestre
    
    # Obtener horarios seleccionados
    horarios = db.query(HorarioGenerado).filter(
        HorarioGenerado.id.in_(data.horario_ids)
    ).all()
    
    if len(horarios) != len(data.horario_ids):
        raise HTTPException(400, "Algunos horarios no existen")
    
    # Validar cupos disponibles
    for h in horarios:
        if h.cupo_disponible <= 0:
            curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
            raise HTTPException(400, f"Curso {curso.codigo if curso else h.curso_id} sin cupos disponibles")
    
    # Validar no duplicados (mismo curso)
    cursos_ids = [h.curso_id for h in horarios]
    if len(cursos_ids) != len(set(cursos_ids)):
        raise HTTPException(400, "No puedes inscribir el mismo curso dos veces")
    
    # Validar cruce de horarios
    franjas = [h.franja for h in horarios]
    if len(franjas) != len(set(franjas)):
        raise HTTPException(400, "Cruce de horario detectado. Selecciona franjas diferentes.")
    
    # Verificar matrículas previas del estudiante
    matriculas_previas = db.query(Matricula).filter(
        Matricula.estudiante_id == current_user.id,
        Matricula.periodo == periodo_actual,
        Matricula.estado == "activa"
    ).all()
    
    # Verificar límite de cursos
    if len(matriculas_previas) + len(horarios) > max_cursos:
        raise HTTPException(400, f"Máximo {max_cursos} cursos por semestre")
    
    # Verificar cursos ya matriculados
    cursos_previos = {m.horario.curso_id for m in matriculas_previas if m.horario}
    cursos_nuevos = set(cursos_ids)
    conflictos = cursos_previos & cursos_nuevos
    
    if conflictos:
        nombres_conflictos = []
        for curso_id in conflictos:
            curso = db.query(CursoDB).filter(CursoDB.id == curso_id).first()
            nombres_conflictos.append(curso.codigo if curso else str(curso_id))
        raise HTTPException(400, f"Ya estás matriculado en: {', '.join(nombres_conflictos)}")
    
    # Crear matrículas y descontar cupos
    nuevas_matriculas = []
    for h in horarios:
        h.cupo_disponible -= 1
        
        matricula = Matricula(
            estudiante_id=current_user.id,
            horario_id=h.id,
            periodo=periodo_actual,
            estado="activa"
        )
        db.add(matricula)
        nuevas_matriculas.append(matricula)
    
    db.commit()
    
    logger.info(f"Estudiante {current_user.email} matriculado en {len(nuevas_matriculas)} cursos")
    
    return {
        "mensaje": "Matrícula exitosa",
        "matriculas_realizadas": len(nuevas_matriculas),
        "periodo": periodo_actual,
        "cursos": [
            {
                "curso_id": h.curso_id,
                "curso_nombre": get_curso_nombre(db, h.curso_id),
                "franja": h.franja,
                "aula": h.aula_id,
                "seccion": h.seccion
            }
            for h in horarios
        ]
    }

@router.get("/mi-horario")
def mi_horario(
    current_user: Usuario = Depends(require_role(["estudiante"])),
    db: Session = Depends(get_db)
):
    """Retorna el horario personal del estudiante autenticado"""
    periodo_actual = "2025-1"
    
    matriculas = db.query(Matricula).filter(
        Matricula.estudiante_id == current_user.id,
        Matricula.periodo == periodo_actual,
        Matricula.estado == "activa"
    ).all()
    
    horario_personal = []
    for matricula in matriculas:
        h = matricula.horario
        if not h:
            continue
        
        curso = db.query(CursoDB).filter(CursoDB.id == h.curso_id).first()
        
        horario_personal.append({
            "matricula_id": matricula.id,
            "curso_codigo": curso.codigo if curso else "N/A",
            "curso_nombre": curso.nombre if curso else "Desconocido",
            "creditos": curso.creditos if curso else 0,
            "docente": get_docente_nombre(db, h.docente_id),
            "aula": h.aula_id,
            "franja": h.franja,
            "seccion": h.seccion,
            "fecha_matricula": matricula.created_at.isoformat() if matricula.created_at else None
        })
    
    # Ordenar por franja horaria
    horario_personal.sort(key=lambda x: x['franja'])
    
    return {
        "estudiante": f"{current_user.nombre} {current_user.apellido}",
        "email": current_user.email,
        "periodo": periodo_actual,
        "total_cursos": len(horario_personal),
        "total_creditos": sum(h['creditos'] for h in horario_personal),
        "horario": horario_personal
    }

@router.get("/mis-matriculas")
def mis_matriculas(
    current_user: Usuario = Depends(require_role(["estudiante"])),
    db: Session = Depends(get_db)
):
    """Retorna historial de matrículas del estudiante"""
    matriculas = db.query(Matricula).filter(
        Matricula.estudiante_id == current_user.id
    ).order_by(Matricula.created_at.desc()).all()
    
    resultado = []
    for m in matriculas:
        curso_nombre = "N/A"
        if m.horario and m.horario.curso_id:
            curso = db.query(CursoDB).filter(CursoDB.id == m.horario.curso_id).first()
            curso_nombre = curso.nombre if curso else "N/A"
        
        resultado.append({
            "id": m.id,
            "periodo": m.periodo,
            "curso": curso_nombre,
            "estado": m.estado,
            "nota_final": m.nota_final,
            "fecha_matricula": m.created_at.isoformat() if m.created_at else None
        })
    
    return resultado

@router.delete("/mis-matriculas/{matricula_id}")
def cancelar_matricula(
    matricula_id: int,
    current_user: Usuario = Depends(require_role(["estudiante"])),
    db: Session = Depends(get_db)
):
    """Cancelar una matrícula (libera cupo)"""
    matricula = db.query(Matricula).filter(
        Matricula.id == matricula_id,
        Matricula.estudiante_id == current_user.id,
        Matricula.estado == "activa"
    ).first()
    
    if not matricula:
        raise HTTPException(404, "Matrícula no encontrada")
    
    # Liberar cupo
    if matricula.horario:
        matricula.horario.cupo_disponible += 1
    
    matricula.estado = "cancelada"
    db.commit()
    
    logger.info(f"Matrícula {matricula_id} cancelada por estudiante {current_user.email}")
    
    return {"mensaje": "Matrícula cancelada exitosamente"}

# ========== REPORTES ==========
@router.get("/reportes/ocupacion")
def reporte_ocupacion(db: Session = Depends(get_db)):
    """Dashboard: ocupación por aula y franja"""
    horarios = db.query(HorarioGenerado).filter(HorarioGenerado.cupo_disponible >= 0).all()
    
    ocupacion_por_franja = {}
    ocupacion_por_aula = {}
    cursos_por_docente = {}
    
    for h in horarios:
        # Por franja
        franja = h.franja
        ocupacion_por_franja[franja] = ocupacion_por_franja.get(franja, 0) + 1
        
        # Por aula
        if h.aula_id:
            aula_nombre = f"Aula {h.aula_id}"
            ocupacion_por_aula[aula_nombre] = ocupacion_por_aula.get(aula_nombre, 0) + 1
        
        # Por docente
        if h.docente_id:
            docente_nombre = get_docente_nombre(db, h.docente_id)
            cursos_por_docente[docente_nombre] = cursos_por_docente.get(docente_nombre, 0) + 1
    
    # Calcular ocupación total
    total_cupos = sum(h.cupo_maximo for h in horarios)
    total_ocupados = sum(h.cupo_maximo - h.cupo_disponible for h in horarios)
    porcentaje_ocupacion = (total_ocupados / total_cupos * 100) if total_cupos > 0 else 0
    
    return {
        "total_franjas_asignadas": len(horarios),
        "total_cupos_disponibles": sum(h.cupo_disponible for h in horarios),
        "porcentaje_ocupacion_general": round(porcentaje_ocupacion, 2),
        "ocupacion_por_franja": ocupacion_por_franja,
        "aulas_mas_usadas": sorted(ocupacion_por_aula.items(), key=lambda x: x[1], reverse=True)[:5],
        "docentes_con_mas_cursos": sorted(cursos_por_docente.items(), key=lambda x: x[1], reverse=True)[:5]
    }

@router.get("/reportes/cursos-no-asignados")
def cursos_no_asignados(periodo: str = "2025-1", db: Session = Depends(get_db)):
    """Reporte de cursos que no tienen horario asignado"""
    cursos_con_horario = db.query(HorarioGenerado.curso_id).filter(
        HorarioGenerado.periodo == periodo
    ).distinct().all()
    
    cursos_con_horario_ids = [c[0] for c in cursos_con_horario if c[0]]
    
    cursos_sin_asignar = db.query(CursoDB).filter(
        ~CursoDB.id.in_(cursos_con_horario_ids) if cursos_con_horario_ids else True
    ).all()
    
    return {
        "periodo": periodo,
        "total_cursos_sin_asignar": len(cursos_sin_asignar),
        "cursos": [
            {
                "codigo": c.codigo,
                "nombre": c.nombre,
                "semestre": c.semestre,
                "programa_id": c.programa_id
            }
            for c in cursos_sin_asignar
        ]
    }

# ========== AUTENTICACIÓN ==========
@router.post("/register")
def register_user(data: UsuarioCreate, db: Session = Depends(get_db)):
    """Registro de nuevo usuario"""
    existing = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existing:
        raise HTTPException(400, "El email ya está registrado")
    
    hashed_password = get_password_hash(data.password)
    
    user = Usuario(
        email=data.email,
        hashed_password=hashed_password,
        nombre=data.nombre,
        apellido=data.apellido,
        rol=data.rol,
        activo=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"Nuevo usuario registrado: {user.email} - Rol: {user.rol}")
    
    return {
        "mensaje": "Usuario creado exitosamente",
        "usuario": {
            "id": user.id,
            "email": user.email,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "rol": user.rol
        }
    }

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login con OAuth2. Recibe username (email) y password.
    Retorna token JWT para usar en header: Authorization: Bearer <token>
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "rol": user.rol}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": user.id,
            "email": user.email,
            "nombre": user.nombre,
            "apellido": user.apellido,
            "rol": user.rol
        }
    }

@router.get("/me")
def me(current_user: Usuario = Depends(get_current_active_user)):
    """Retorna información del usuario autenticado"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nombre": current_user.nombre,
        "apellido": current_user.apellido,
        "rol": current_user.rol,
        "activo": current_user.activo
    }

# ========== RUTAS PROTEGIDAS POR ROL ==========
@router.get("/admin/dashboard")
def admin_dashboard(current_user: Usuario = Depends(require_role(["admin"]))):
    """Solo accesible por administradores"""
    return {
        "mensaje": f"Bienvenido admin {current_user.nombre}",
        "stats": {
            "total_usuarios": "contar desde BD",
            "total_cursos": "contar desde BD",
            "total_matriculas": "contar desde BD"
        }
    }

@router.get("/coordinador/horarios")
def coord_horarios(current_user: Usuario = Depends(require_role(["admin", "coordinador"]))):
    """Accesible por admin y coordinador"""
    return {
        "mensaje": f"Bienvenido coordinador {current_user.nombre}",
        "acciones": ["generar_horario", "editar_horario", "asignar_docentes"]
    }

@router.get("/docente/mis-cursos")
def docente_mis_cursos(
    current_user: Usuario = Depends(require_role(["docente", "admin"])),
    db: Session = Depends(get_db)
):
    """Docente ve sus cursos asignados"""
    # Buscar docente por email
    docente = db.query(Docente).filter(Docente.email == current_user.email).first()
    if not docente and current_user.rol != "admin":
        raise HTTPException(404, "Perfil docente no encontrado")
    
    if current_user.rol == "admin":
        cursos = db.query(CursoDB).all()
    else:
        cursos = db.query(CursoDB).filter(CursoDB.docente_id == docente.id).all()
    
    return {
        "docente": f"{current_user.nombre} {current_user.apellido}",
        "total_cursos": len(cursos),
        "cursos": [
            {
                "id": c.id,
                "codigo": c.codigo,
                "nombre": c.nombre,
                "semestre": c.semestre,
                "horas_semanales": c.horas_semanales
            }
            for c in cursos
        ]
    }

# ========== INCLUIR ROUTER ==========
app.include_router(router)

# ========== HEALTH CHECK ==========
@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)