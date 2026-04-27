# **📘 DOCUMENTACIÓN TÉCNICA**

## **🧪 OptiAcademic – Testing con TDD**

---

# **1\. INTRODUCCIÓN**

## **¿Qué es TDD?**

**Test-Driven Development (Desarrollo Guiado por Pruebas)** es una metodología de desarrollo donde primero se escriben las pruebas antes del código.

### **🔄 Ciclo TDD**

🔴 ROJO → 🟢 VERDE → 🔵 REFACTOR

* 🔴 ROJO: Escribir la prueba (falla)  
* 🟢 VERDE: Implementar código mínimo para pasar la prueba  
* 🔵 REFACTOR: Mejorar el código sin romper pruebas

---

## **🧰 Stack Tecnológico**

| Área | Tecnologías |
| ----- | ----- |
| Backend | FastAPI, Python, pytest, SQLAlchemy, MySQL |
| Frontend | React, Vite, Vitest, Testing Library |
| Cobertura | pytest-cov, @vitest/coverage |

---

# **2\. ESTRATEGIA TDD**

## **🔁 Ciclo implementado**

1\. 📝 Escribir prueba (ROJO)  
2\. 💻 Implementar código mínimo (VERDE)  
3\. 🔧 Refactorizar (REFACTOR)  
4\. 🔁 Repetir  
---

## **📁 Estructura de pruebas**

### **Backend**

backend/tests/  
├── conftest.py  
├── test\_api.py  
├── test\_auth.py  
├── test\_auth\_advanced.py  
├── test\_csp.py  
├── test\_csp\_engine.py  
├── test\_main.py  
└── test\_routes.py

### **Frontend**

frontend/src/tests/  
├── setup.js  
├── Login.test.jsx  
├── Dashboard.test.jsx  
└── MatriculaPanel.test.jsx  
---

# **3\. BACKEND – PRUEBAS**

## **🔐 3.1 Autenticación (test\_auth.py)**

| ID | Prueba | Descripción | Estado |
| ----- | ----- | ----- | ----- |
| TC-AUTH-01 | login\_estudiante\_exitoso | Login estudiante correcto | ✅ PASS |
| TC-AUTH-02 | login\_admin\_exitoso | Login admin correcto | ✅ PASS |
| TC-AUTH-03 | login\_coordinador\_exitoso | Login coordinador correcto | ✅ PASS |
| TC-AUTH-04 | login\_docente\_exitoso | Login docente correcto | ✅ PASS |
| TC-AUTH-05 | contrasena\_incorrecta | Password incorrecta | ✅ PASS |
| TC-AUTH-06 | usuario\_no\_existe | Usuario inexistente | ✅ PASS |
| TC-AUTH-07 | verificar\_password | Validación hash | ✅ PASS |
| TC-AUTH-08 | crear\_token\_jwt | Generación JWT | ✅ PASS |
| TC-AUTH-09 | token\_datos\_correctos | Datos en token | ✅ PASS |
| TC-AUTH-10 | token\_expiration | Expiración token | ✅ PASS |

### **💻 Ejemplo**

def test\_login\_estudiante\_exitoso(self, db\_session):  
   user \= authenticate\_user(db\_session, "estudiante1@uni.edu", "est123")  
   assert user is not None  
   assert user.email \== "estudiante1@uni.edu"  
   assert user.rol \== "estudiante"  
---

## **🧠 3.2 Motor CSP (test\_csp.py)**

| ID | Prueba | Descripción | Estado |
| ----- | ----- | ----- | ----- |
| TC-CSP-01 | asignacion\_exitosa | Sin conflictos | ✅ PASS |
| TC-CSP-02 | conflicto\_docente | Choque de docente | ✅ PASS |
| TC-CSP-03 | aula\_insuficiente | Cambio de aula | ✅ PASS |
| TC-CSP-04 | conflicto\_aula | Aula ocupada | ✅ PASS |
| TC-CSP-05 | rendimiento | Escalabilidad | ✅ PASS |
| TC-CSP-06 | sin\_cursos | Sin asignaciones | ✅ PASS |

---

## **🌐 3.3 API (test\_api.py)**

| ID | Prueba | Descripción | Estado |
| ----- | ----- | ----- | ----- |
| TC-API-01 | login\_endpoint | POST /login | ✅ PASS |
| TC-API-02 | login\_fallido | Credenciales inválidas | ✅ PASS |
| TC-API-03 | listar\_cursos | GET /cursos | ✅ PASS |
| TC-API-04 | generar\_horario | POST /generar | ✅ PASS |
| TC-API-05 | health\_check | GET /health | ✅ PASS |

---

## **🧭 3.4 Rutas (test\_routes.py)**

Incluye pruebas de:

* Facultades  
* Programas  
* Docentes  
* Aulas  
* Cursos  
* Horarios  
* Reportes  
* Dashboard admin

📊 **Total: 16 pruebas → 100% PASS**

---

# **4\. FRONTEND – PRUEBAS**

## **⚙️ Configuración (setup.js)**

import { expect, afterEach, vi } from 'vitest'  
import { cleanup } from '@testing-library/react'  
import '@testing-library/jest-dom/vitest'

afterEach(() \=\> cleanup())

global.localStorage \= {  
 getItem: vi.fn(),  
 setItem: vi.fn(),  
 removeItem: vi.fn(),  
 clear: vi.fn(),  
}

global.fetch \= vi.fn()  
---

## **🔐 Login Component**

| ID | Prueba | Estado |
| ----- | ----- | ----- |
| TC-FRONT-01 | render\_formulario | ✅ PASS |
| TC-FRONT-02 | cuentas\_demo | ✅ PASS |
| TC-FRONT-03 | onLogin\_callback | ✅ PASS |

---

## **📊 Dashboard**

* Header de bienvenida  
* Estadísticas del sistema  
* Botón generar horario

---

## **🧑‍🎓 MatriculaPanel**

* Oferta académica  
* Botón matricular  
* Horario del estudiante  
* Datos del usuario

---

# **5\. 📊 RESULTADOS FINALES**

## **Backend**

✔ 41 pruebas totales  
✔ 40 exitosas  
✖ 1 fallida  
📈 Cobertura: 32%  
⏱ Tiempo: 16s

## **Frontend**

✔ 10 pruebas  
✔ 10 exitosas  
✖ 0 fallidas  
⏱ Tiempo: 2s

## **📊 General**

✔ 51 pruebas totales  
✔ 50 exitosas  
📈 Tasa de éxito: 98%  
---

## **📌 Cobertura por módulo**

| Módulo | Cobertura |
| ----- | ----- |
| auth.py | 89% ✅ |
| csp\_engine.py | 87% ✅ |
| main.py | 66% |
| test\_routes.py | 100% |
| test\_auth.py | 100% |
| test\_csp.py | 100% |

---

# **6\. 🚀 CÓMO EJECUTAR**

## **Backend**

cd backend  
venv\\Scripts\\activate  
pip install pytest pytest-cov  
pytest \-v  
pytest \--cov=. \--cov-report=html

## **Frontend**

cd frontend  
npm install  
npm run test  
npx vitest run  
npm run test:coverage  
---

## **⚡ Comando rápido**

cd backend && pytest \-v && cd ../frontend && npm run test  
---

# **7\. 🔮 MEJORAS FUTURAS**

| Tarea | Prioridad | Estado |
| ----- | ----- | ----- |
| Cobertura 80% backend | Alta | 🔄 |
| E2E con Playwright | Media | ⏳ |
| Load testing k6 | Baja | ⏳ |
| CI/CD GitHub Actions | Media | ⏳ |
| Integration tests | Alta | ⏳ |

---

# **8\. 📌 CONCLUSIÓN**

El proyecto **OptiAcademic** implementa correctamente **TDD (Test-Driven Development)** logrando:

* ✅ 50+ pruebas exitosas  
* ✅ 98% tasa de éxito  
* ✅ Backend y frontend testeados  
* ✅ Arquitectura confiable  
* ✅ Código mantenible

### **🎯 Beneficios logrados**

* Detección temprana de errores  
* Mejor calidad de código  
* Refactorización segura  
* Documentación automática del sistema

