# D:\TALLER 2\optiacademic\backend\tests\test_csp.py
import pytest
import sys
import os
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from csp_engine import CSPEngine

class TestCSPEngine:
    """Pruebas TDD para el motor CSP"""
    
    @pytest.fixture
    def engine(self):
        return CSPEngine()
    
    @pytest.fixture
    def aulas(self):
        return [
            {'id': 'A101', 'capacidad': 40, 'tipo': 'teoria', 'recursos': []},
            {'id': 'A102', 'capacidad': 35, 'tipo': 'teoria', 'recursos': []},
            {'id': 'LAB101', 'capacidad': 30, 'tipo': 'laboratorio', 'recursos': []},
        ]
    
    @pytest.fixture
    def docentes(self):
        return [
            {'id': 'D001', 'nombre': 'Dr. García', 'disponibilidad': []},
            {'id': 'D002', 'nombre': 'Dra. López', 'disponibilidad': []},
            {'id': 'D003', 'nombre': 'Dr. Martínez', 'disponibilidad': []},
        ]
    
    def test_asignacion_exitosa(self, engine, aulas, docentes):
        """TC-CSP-01: Asignación limpia sin conflictos"""
        cursos = [
            {'id': 'CS101', 'nombre': 'Algoritmos', 'docente_id': 'D001', 'max_estudiantes': 30,
             'tipo': 'teoria', 'semestre': 1},
            {'id': 'CS102', 'nombre': 'BD', 'docente_id': 'D002', 'max_estudiantes': 25,
             'tipo': 'teoria', 'semestre': 1},
            {'id': 'CS103', 'nombre': 'Redes', 'docente_id': 'D003', 'max_estudiantes': 20,
             'tipo': 'teoria', 'semestre': 1},
        ]
        r = engine.resolver(cursos, aulas, docentes)
        
        assert r['estadisticas']['total_asignados'] == 3
        assert r['estadisticas']['total_no_asignados'] == 0
        assert len(r['horario_generado']) == 3
    
    def test_conflicto_docente(self, engine, aulas):
        """TC-CSP-02: Mismo docente, misma franja → debe evitar conflicto"""
        docentes = [{'id': 'D001', 'nombre': 'Dr. A', 'disponibilidad': []}]
        cursos = [
            {'id': 'C1', 'nombre': 'A', 'docente_id': 'D001', 'max_estudiantes': 10,
             'tipo': 'teoria', 'semestre': 1},
            {'id': 'C2', 'nombre': 'B', 'docente_id': 'D001', 'max_estudiantes': 10,
             'tipo': 'teoria', 'semestre': 1},
        ]
        
        r = engine.resolver(cursos, aulas, docentes)
        
        # El sistema debe asignar ambos cursos en diferentes franjas
        assert r['estadisticas']['total_asignados'] == 2
        
        # Verificar que están en diferentes franjas
        franjas = [h['franja'] for h in r['horario_generado']]
        assert len(franjas) == len(set(franjas)), "Los cursos del mismo docente deben tener diferentes franjas"
    
    def test_aula_insuficiente(self, engine, docentes):
        """TC-CSP-03: Capacidad excedida → usar aula más grande"""
        aulas = [{'id': 'A101', 'capacidad': 30, 'tipo': 'teoria', 'recursos': []}]
        cursos = [{'id': 'C1', 'nombre': 'Gigante', 'docente_id': 'D001', 'max_estudiantes': 999,
                   'tipo': 'teoria', 'semestre': 1}]
        
        r = engine.resolver(cursos, aulas, docentes)
        
        # Debe asignarse a pesar de la capacidad (se usa la única aula disponible)
        assert r['estadisticas']['total_asignados'] == 1
    
    def test_conflicto_aula(self, engine, docentes):
        """TC-CSP-04: Una aula, una franja, dos cursos distintos → deben asignarse en diferentes franjas"""
        aulas = [{'id': 'A101', 'capacidad': 50, 'tipo': 'teoria', 'recursos': []}]
        docentes = [
            {'id': 'D001', 'nombre': 'A', 'disponibilidad': []},
            {'id': 'D002', 'nombre': 'B', 'disponibilidad': []},
        ]
        cursos = [
            {'id': 'C1', 'nombre': 'X', 'docente_id': 'D001', 'max_estudiantes': 20,
             'tipo': 'teoria', 'semestre': 1},
            {'id': 'C2', 'nombre': 'Y', 'docente_id': 'D002', 'max_estudiantes': 20,
             'tipo': 'teoria', 'semestre': 1},
        ]
        
        r = engine.resolver(cursos, aulas, docentes)
        
        # Ambos cursos deben ser asignados
        assert r['estadisticas']['total_asignados'] == 2
        
        # Verificar que están en diferentes franjas
        franjas = [h['franja'] for h in r['horario_generado']]
        assert len(franjas) == len(set(franjas)), "Los cursos deben tener diferentes franjas"
    
    def test_rendimiento_escalable(self, engine):
        """TC-CSP-05: 10 cursos, 5 aulas, 5 docentes en < 2s"""
        import time
        
        random.seed(42)
        
        aulas = [{'id': f'A{i:03d}', 'capacidad': 30 + i*5, 'tipo': 'teoria', 'recursos': []} for i in range(5)]
        docentes = [{'id': f'D{i:03d}', 'nombre': f'Docente {i}', 'disponibilidad': []} for i in range(5)]
        cursos = [
            {'id': f'C{i:03d}', 'nombre': f'Curso {i}', 'docente_id': f'D{i%5:03d}', 
             'max_estudiantes': random.randint(20, 40), 'tipo': 'teoria', 'semestre': 1}
            for i in range(10)
        ]
        
        start = time.time()
        r = engine.resolver(cursos, aulas, docentes)
        elapsed = time.time() - start
        
        assert elapsed < 2.0, f"Tiempo {elapsed*1000:.0f}ms excede 2 segundos"
        assert r['estadisticas']['total_asignados'] == len(cursos)