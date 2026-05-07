# D:\TALLER 2\optiacademic\backend\ver_bd.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.db_models import CursoDB, Docente, Aula, Programa, Facultad, Usuario, HorarioGenerado

db = SessionLocal()

print("="*60)
print("📊 VISUALIZACIÓN DE BASE DE DATOS - optiacademic_db")
print("="*60)

# 1. Facultades
print("\n🏛️ FACULTADES:")
facultades = db.query(Facultad).all()
if facultades:
    for f in facultades:
        print(f"   ID: {f.id} | {f.codigo} - {f.nombre}")
else:
    print("   (No hay datos)")

# 2. Programas
print("\n📚 PROGRAMAS:")
programas = db.query(Programa).all()
if programas:
    for p in programas:
        print(f"   ID: {p.id} | {p.codigo} - {p.nombre}")
else:
    print("   (No hay datos)")

# 3. Cursos
print("\n📖 CURSOS:")
cursos = db.query(CursoDB).all()
if cursos:
    for c in cursos[:15]:
        print(f"   {c.codigo} | {c.nombre[:40]} | Sem: {c.semestre} | Cr: {c.creditos}")
    if len(cursos) > 15:
        print(f"   ... y {len(cursos)-15} más")
else:
    print("   (No hay datos)")

# 4. Docentes
print("\n👨‍🏫 DOCENTES:")
docentes = db.query(Docente).all()
if docentes:
    for d in docentes:
        print(f"   {d.codigo} | {d.nombre} {d.apellido} | {d.email}")
else:
    print("   (No hay datos)")

# 5. Aulas
print("\n🏫 AULAS:")
aulas = db.query(Aula).all()
if aulas:
    for a in aulas:
        print(f"   {a.codigo} | {a.nombre} | Cap: {a.capacidad} | Tipo: {a.tipo}")
else:
    print("   (No hay datos)")

# 6. Usuarios
print("\n👤 USUARIOS:")
usuarios = db.query(Usuario).all()
if usuarios:
    for u in usuarios:
        print(f"   {u.email} | Rol: {u.rol} | {u.nombre} {u.apellido}")
else:
    print("   (No hay datos)")

# 7. Horarios generados
print("\n📅 HORARIOS GENERADOS:")
horarios = db.query(HorarioGenerado).all()
if horarios:
    for h in horarios[:10]:
        print(f"   Curso ID: {h.curso_id} | Franja: {h.franja} | Aula: {h.aula_id}")
    if len(horarios) > 10:
        print(f"   ... y {len(horarios)-10} más")
else:
    print("   (No hay datos)")

# Resumen
print("\n" + "="*60)
print("📊 RESUMEN:")
print(f"   Facultades: {len(facultades)}")
print(f"   Programas: {len(programas)}")
print(f"   Cursos: {len(cursos)}")
print(f"   Docentes: {len(docentes)}")
print(f"   Aulas: {len(aulas)}")
print(f"   Usuarios: {len(usuarios)}")
print(f"   Horarios: {len(horarios)}")
print("="*60)

db.close()