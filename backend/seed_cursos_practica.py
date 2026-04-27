# D:\TALLER 2\optiacademic\backend\seed_cursos_practica.py
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB

def actualizar_cursos_con_practica():
    """Actualizar cursos existentes o crear nuevos con horas de práctica"""
    db = SessionLocal()
    
    # Cursos con sus respectivas configuraciones de horas
    cursos_config = [
        # ========== CICLO 1 ==========
        {
            "codigo": "SIS101", "nombre": "Comprensión y Producción de Textos 1",
            "creditos": 3, "semestre": 1, "tipo": "teoria",
            "horas_teoria": 3, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS102", "nombre": "Laboratorio de Liderazgo e Innovación",
            "creditos": 3, "semestre": 1, "tipo": "taller",
            "horas_teoria": 1, "horas_laboratorio": 0, "horas_practica": 3,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS103", "nombre": "Estrategias y Herramientas Digitales",
            "creditos": 4, "semestre": 1, "tipo": "laboratorio",
            "horas_teoria": 2, "horas_laboratorio": 3, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS104", "nombre": "Matemática Básica",
            "creditos": 4, "semestre": 1, "tipo": "teoria",
            "horas_teoria": 5, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS105", "nombre": "Matemática Discreta 1",
            "creditos": 4, "semestre": 1, "tipo": "teoria",
            "horas_teoria": 5, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS106", "nombre": "Técnicas de Programación",
            "creditos": 3, "semestre": 1, "tipo": "laboratorio",
            "horas_teoria": 2, "horas_laboratorio": 3, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS107", "nombre": "Introducción a la Ingeniería de Sistemas",
            "creditos": 3, "semestre": 1, "tipo": "teoria",
            "horas_teoria": 3, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        
        # ========== CICLO 2 ==========
        {
            "codigo": "SIS201", "nombre": "Comprensión y Producción de Textos 2",
            "creditos": 4, "semestre": 2, "tipo": "teoria",
            "horas_teoria": 4, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS202", "nombre": "Álgebra Lineal y Geometría Analítica",
            "creditos": 4, "semestre": 2, "tipo": "teoria",
            "horas_teoria": 5, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS203", "nombre": "Modelado de Negocios",
            "creditos": 3, "semestre": 2, "tipo": "practica",
            "horas_teoria": 1, "horas_laboratorio": 0, "horas_practica": 3,
            "minutos_por_hora": 180  # Práctica: 180 minutos por hora
        },
        {
            "codigo": "SIS204", "nombre": "Matemática Superior",
            "creditos": 4, "semestre": 2, "tipo": "teoria",
            "horas_teoria": 5, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS205", "nombre": "Matemática Discreta 2",
            "creditos": 4, "semestre": 2, "tipo": "teoria",
            "horas_teoria": 5, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS206", "nombre": "Programación Orientada a Objetos",
            "creditos": 3, "semestre": 2, "tipo": "laboratorio",
            "horas_teoria": 2, "horas_laboratorio": 3, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        
        # ========== CICLO 3 ==========
        {
            "codigo": "SIS301", "nombre": "Estadística y Probabilidades",
            "creditos": 4, "semestre": 3, "tipo": "teoria",
            "horas_teoria": 4, "horas_laboratorio": 0, "horas_practica": 1,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS302", "nombre": "Laboratorio de Liderazgo Intermedio",
            "creditos": 2, "semestre": 3, "tipo": "taller",
            "horas_teoria": 1, "horas_laboratorio": 0, "horas_practica": 2,
            "minutos_por_hora": 180
        },
        {
            "codigo": "SIS303", "nombre": "Cálculo Diferencial",
            "creditos": 4, "semestre": 3, "tipo": "teoria",
            "horas_teoria": 5, "horas_laboratorio": 0, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS304", "nombre": "Física 1",
            "creditos": 4, "semestre": 3, "tipo": "laboratorio",
            "horas_teoria": 3, "horas_laboratorio": 3, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS305", "nombre": "Base de Datos 1",
            "creditos": 3, "semestre": 3, "tipo": "laboratorio",
            "horas_teoria": 2, "horas_laboratorio": 3, "horas_practica": 0,
            "minutos_por_hora": 90
        },
        {
            "codigo": "SIS306", "nombre": "Diseño Web",
            "creditos": 2, "semestre": 3, "tipo": "practica",
            "horas_teoria": 1, "horas_laboratorio": 0, "horas_practica": 3,
            "minutos_por_hora": 180
        },
        {
            "codigo": "SIS307", "nombre": "Estructura de Datos",
            "creditos": 3, "semestre": 3, "tipo": "teoria",
            "horas_teoria": 3, "horas_laboratorio": 0, "horas_practica": 2,
            "minutos_por_hora": 90
        },
    ]
    
    for config in cursos_config:
        curso = db.query(CursoDB).filter(CursoDB.codigo == config["codigo"]).first()
        if curso:
            # Actualizar curso existente
            for key, value in config.items():
                setattr(curso, key, value)
            print(f"✏️ Actualizado: {config['codigo']} - {config['nombre']}")
        else:
            # Crear nuevo curso
            curso = CursoDB(**config)
            db.add(curso)
            print(f"✅ Creado: {config['codigo']} - {config['nombre']}")
    
    db.commit()
    db.close()
    
    print("\n" + "="*50)
    print("📊 Resumen de configuración:")
    print("="*50)
    
    db = SessionLocal()
    cursos = db.query(CursoDB).all()
    for curso in cursos[:10]:
        print(f"\n📚 {curso.codigo} - {curso.nombre}")
        print(f"   Teoría: {curso.horas_teoria}h | Laboratorio: {curso.horas_laboratorio}h | Práctica: {curso.horas_practica}h")
        print(f"   Duración por hora: {curso.minutos_por_hora} minutos")
    db.close()

if __name__ == "__main__":
    actualizar_cursos_con_practica()