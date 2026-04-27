# D:\TALLER 2\optiacademic\backend\ver_bd.py
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB

def ver_cursos():
    db = SessionLocal()
    cursos = db.query(CursoDB).all()
    
    print("\n" + "="*70)
    print("📚 LISTA DE CURSOS EN BASE DE DATOS")
    print("="*70)
    
    for curso in cursos:
        print(f"\n📖 {curso.codigo} - {curso.nombre}")
        print(f"   Semestre: {curso.semestre} | Créditos: {curso.creditos}")
        print(f"   Tipo: {curso.tipo} | Horas semanales: {curso.horas_semanales}")
        print(f"   Teoría: {curso.horas_teoria}h | Lab: {curso.horas_laboratorio}h | Práctica: {curso.horas_practica}h")
        print(f"   Duración por hora: {curso.minutos_por_hora} minutos")
    
    print(f"\n✅ Total cursos: {len(cursos)}")
    db.close()

if __name__ == "__main__":
    ver_cursos()