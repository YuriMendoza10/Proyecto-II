# D:\TALLER 2\optiacademic\backend\migrar_bd_nuevas_funciones.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
from models.db_models import (
    Usuario, Facultad, Programa, Docente, Aula, CursoDB,
    HorarioGenerado, Matricula, PasswordResetToken,
    LogAuditoria, Notificacion, HorarioExportado, HistorialCambios
)

print("="*60)
print("🚀 MIGRANDO BASE DE DATOS - NUEVAS FUNCIONALIDADES")
print("="*60)

try:
    # Crear todas las tablas (incluyendo las nuevas)
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas/actualizadas correctamente")
    print("   - Usuarios")
    print("   - Facultades, Programas")
    print("   - Docentes, Aulas")
    print("   - Cursos")
    print("   - Horarios Generados")
    print("   - Matrículas")
    print("   - Password Reset Tokens (nuevo)")
    print("   - Logs Auditoria (nuevo)")
    print("   - Notificaciones (nuevo)")
    print("   - Horarios Exportados (nuevo)")
    print("   - Historial Cambios (nuevo)")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("\n✅ Migración completada")