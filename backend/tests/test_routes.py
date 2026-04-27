# D:\TALLER 2\optiacademic\backend\tests\test_routes.py
import pytest
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestRoutes:
    """Pruebas para los endpoints de la API"""
    
    @pytest.fixture
    def auth_token(self):
        response = client.post(
            "/api/v1/login",
            data={"username": "admin@uni.edu", "password": "admin123"}
        )
        return response.json()["access_token"]
    
    @pytest.fixture
    def student_token(self):
        response = client.post(
            "/api/v1/login",
            data={"username": "estudiante1@uni.edu", "password": "est123"}
        )
        return response.json()["access_token"]
    
    # ========== PRUEBAS PARA FACULTADES ==========
    
    def test_crear_facultad(self, auth_token):
        """TC-ROUTES-01: Crear facultad - puede fallar si ya existe"""
        response = client.post(
            "/api/v1/facultades",
            json={"codigo": "TEST", "nombre": "Facultad Test"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code in [201, 400]
    
    def test_listar_facultades(self, auth_token):
        """TC-ROUTES-02: Listar facultades"""
        response = client.get(
            "/api/v1/facultades",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ========== PRUEBAS PARA PROGRAMAS ==========
    
    def test_crear_programa(self, auth_token):
        """TC-ROUTES-03: Crear programa"""
        # Primero obtener una facultad existente
        facultades = client.get(
            "/api/v1/facultades",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json()
        
        if facultades:
            response = client.post(
                "/api/v1/programas",
                json={
                    "codigo": "TEST-PROG",
                    "nombre": "Programa Test",
                    "facultad_id": facultades[0]["id"]
                },
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert response.status_code in [201, 400]
    
    def test_listar_programas(self, auth_token):
        """TC-ROUTES-04: Listar programas"""
        response = client.get(
            "/api/v1/programas",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ========== PRUEBAS PARA DOCENTES ==========
    
    def test_crear_docente(self, auth_token):
        """TC-ROUTES-05: Crear docente - puede fallar si ya existe"""
        response = client.post(
            "/api/v1/docentes",
            json={
                "codigo": "DOC999",
                "nombre": "Docente",
                "apellido": "Prueba",
                "email": "docente.prueba@uni.edu",
                "max_horas_semanales": 20
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Aceptar 201 (creado) o 400 (ya existe)
        assert response.status_code in [201, 400]
    
    def test_listar_docentes(self, auth_token):
        """TC-ROUTES-06: Listar docentes"""
        response = client.get(
            "/api/v1/docentes",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ========== PRUEBAS PARA AULAS ==========
    
    def test_crear_aula(self, auth_token):
        """TC-ROUTES-07: Crear aula - puede fallar si ya existe"""
        response = client.post(
            "/api/v1/aulas",
            json={
                "codigo": "TEST01",
                "nombre": "Aula Test",
                "capacidad": 50,
                "tipo": "teoria"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Aceptar 201 (creado) o 400 (ya existe)
        assert response.status_code in [201, 400]
    
    def test_listar_aulas(self, auth_token):
        """TC-ROUTES-08: Listar aulas"""
        response = client.get(
            "/api/v1/aulas",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ========== PRUEBAS PARA CURSOS ==========
    
    def test_crear_curso(self, auth_token):
        """TC-ROUTES-09: Crear curso"""
        # Obtener programa y docente existentes
        programas = client.get(
            "/api/v1/programas",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json()
        docentes = client.get(
            "/api/v1/docentes",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json()
        
        if programas and docentes:
            response = client.post(
                "/api/v1/cursos",
                json={
                    "codigo": "TEST999",
                    "nombre": "Curso Test",
                    "creditos": 4,
                    "semestre": 1,
                    "programa_id": programas[0]["id"],
                    "docente_id": docentes[0]["id"],
                    "max_estudiantes": 30,
                    "tipo": "teoria",
                    "horas_semanales": 4
                },
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert response.status_code in [201, 400]
    
    def test_listar_cursos(self, auth_token):
        """TC-ROUTES-10: Listar cursos"""
        response = client.get(
            "/api/v1/cursos",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_listar_cursos_con_filtros(self, auth_token):
        """TC-ROUTES-11: Listar cursos con filtros"""
        response = client.get(
            "/api/v1/cursos?semestre=1&programa_id=1",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
    
    # ========== PRUEBAS PARA GENERAR HORARIO ==========
    
    def test_generar_horario(self, auth_token):
        """TC-ROUTES-12: Generar horario"""
        # Obtener datos necesarios
        cursos = client.get(
            "/api/v1/cursos",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json()
        aulas = client.get(
            "/api/v1/aulas",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json()
        docentes = client.get(
            "/api/v1/docentes",
            headers={"Authorization": f"Bearer {auth_token}"}
        ).json()
        
        payload = {
            "cursos": [
                {
                    "id": c["codigo"],
                    "nombre": c["nombre"],
                    "docente_id": next((d["codigo"] for d in docentes if d["id"] == c["docente_id"]), "DOC001"),
                    "max_estudiantes": c["max_estudiantes"],
                    "tipo": c["tipo"],
                    "semestre": c["semestre"]
                }
                for c in cursos[:3]
            ],
            "aulas": [
                {"id": a["codigo"], "capacidad": a["capacidad"], "tipo": a["tipo"], "recursos": []}
                for a in aulas[:3]
            ],
            "docentes": [
                {"id": d["codigo"], "nombre": d["nombre"], "disponibilidad": []}
                for d in docentes[:3]
            ]
        }
        
        response = client.post(
            "/api/v1/generar",
            json=payload,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert "horario_generado" in response.json()
    
    # ========== PRUEBAS PARA MATRÍCULA ==========
    
    def test_horarios_disponibles(self, student_token):
        """TC-ROUTES-13: Ver horarios disponibles"""
        response = client.get(
            "/api/v1/horarios-disponibles",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_mi_horario(self, student_token):
        """TC-ROUTES-14: Ver mi horario"""
        response = client.get(
            "/api/v1/mi-horario",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert "estudiante" in response.json()
    
    def test_mis_matriculas(self, student_token):
        """TC-ROUTES-15: Ver mis matrículas"""
        response = client.get(
            "/api/v1/mis-matriculas",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    # ========== PRUEBAS PARA REPORTES ==========
    
    def test_reporte_ocupacion(self, auth_token):
        """TC-ROUTES-16: Reporte de ocupación"""
        response = client.get(
            "/api/v1/reportes/ocupacion",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert "total_franjas_asignadas" in response.json()
    
    def test_reporte_cursos_no_asignados(self, auth_token):
        """TC-ROUTES-17: Reporte cursos no asignados"""
        response = client.get(
            "/api/v1/reportes/cursos-no-asignados",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert "total_cursos_sin_asignar" in response.json()
    
    # ========== PRUEBAS DE ROLES ==========
    
    def test_admin_dashboard(self, auth_token):
        """TC-ROUTES-18: Admin dashboard solo para admin"""
        response = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
    
    def test_admin_dashboard_denied_for_student(self, student_token):
        """TC-ROUTES-19: Estudiante no puede acceder a admin dashboard"""
        response = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403
    
    def test_coordinador_horarios(self, auth_token):
        """TC-ROUTES-20: Coordinador puede ver horarios"""
        response = client.get(
            "/api/v1/coordinador/horarios",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200