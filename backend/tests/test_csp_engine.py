# D:\TALLER 2\optiacademic\backend\tests\test_csp_engine.py
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from csp_engine import CSPEngine

class TestCSPEngine:
    """Pruebas TDD para el motor de generación de horarios"""
    
    @pytest.fixture
    def engine(self):
        return CSPEngine()
    
    def test_asignacion_curso_unico(self, engine):
        """TC-CSP-01: Un solo curso debe ser asignado exitosamente"""
        cursos = [
            {"id": "SIS101", "nombre": "Programación I", "docente_id": "DOC001", 
             "max_estudiantes": 35, "tipo": "teoria", "semestre": 1}
        ]
        aulas = [
            {"id": "A101", "capacidad": 40, "tipo": "teoria", "recursos": []}
        ]
        docentes = [
            {"id": "DOC001", "nombre": "Juan Pérez", "disponibilidad": []}
        ]
        
        resultado = engine.resolver(cursos, aulas, docentes)
        
        assert resultado['estadisticas']['total_asignados'] == 1
        assert resultado['estadisticas']['total_no_asignados'] == 0
        assert len(resultado['horario_generado']) == 1
    
    def test_sin_cursos(self, engine):
        """TC-CSP-06: Si no hay cursos, no debe generar asignaciones"""
        resultado = engine.resolver([], [], [])
        
        assert resultado['estadisticas']['total_asignados'] == 0
        assert resultado['estadisticas']['total_no_asignados'] == 0
        assert len(resultado['horario_generado']) == 0