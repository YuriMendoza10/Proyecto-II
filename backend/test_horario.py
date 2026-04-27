# test_horario.py (sin requests)
import json
import urllib.request
import urllib.error

API_URL = "http://localhost:8000/api/v1"

def make_request(url, method="GET", data=None, headers=None):
    """Función para hacer requests usando urllib"""
    if headers is None:
        headers = {}
    
    if method == "POST" and data:
        data_bytes = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Error HTTP {e.code}: {e.reason}")
        try:
            error_msg = json.loads(e.read().decode('utf-8'))
            print(f"Detalle: {error_msg}")
        except:
            pass
        return None

print("="*50)
print("TEST DE GENERACIÓN DE HORARIOS")
print("="*50)

# 1. Obtener token
print("\n🔐 Obteniendo token...")
login_data = "username=admin@uni.edu&password=admin123"
headers = {"Content-Type": "application/x-www-form-urlencoded"}

try:
    req = urllib.request.Request(f"{API_URL}/login", data=login_data.encode('utf-8'), headers=headers, method="POST")
    with urllib.request.urlopen(req) as response:
        login_result = json.loads(response.read().decode('utf-8'))
        token = login_result["access_token"]
        print(f"✅ Token obtenido: {token[:20]}...")
except Exception as e:
    print(f"❌ Error de login: {e}")
    exit()

# 2. Obtener datos
headers_auth = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("\n📥 Obteniendo datos...")

try:
    # Cursos
    req = urllib.request.Request(f"{API_URL}/cursos", headers=headers_auth)
    with urllib.request.urlopen(req) as response:
        cursos = json.loads(response.read().decode('utf-8'))
    print(f"   Cursos: {len(cursos)}")
    
    # Docentes
    req = urllib.request.Request(f"{API_URL}/docentes", headers=headers_auth)
    with urllib.request.urlopen(req) as response:
        docentes = json.loads(response.read().decode('utf-8'))
    print(f"   Docentes: {len(docentes)}")
    
    # Aulas
    req = urllib.request.Request(f"{API_URL}/aulas", headers=headers_auth)
    with urllib.request.urlopen(req) as response:
        aulas = json.loads(response.read().decode('utf-8'))
    print(f"   Aulas: {len(aulas)}")
    
except Exception as e:
    print(f"❌ Error obteniendo datos: {e}")
    exit()

# 3. Preparar payload
if len(cursos) > 0:
    payload = {
        "cursos": [
            {
                "id": c["codigo"],
                "nombre": c["nombre"],
                "docente_id": next((d["codigo"] for d in docentes if d["id"] == c.get("docente_id")), "DOC001"),
                "max_estudiantes": c.get("max_estudiantes", 30),
                "tipo": c.get("tipo", "teoria"),
                "horas_semanales": c.get("horas_semanales", 4)
            }
            for c in cursos[:10]  # Probar con primeros 10 cursos
        ],
        "aulas": [
            {
                "id": a["codigo"],
                "capacidad": a["capacidad"],
                "tipo": a["tipo"],
                "recursos": a.get("recursos", [])
            }
            for a in aulas
        ],
        "docentes": [
            {
                "id": d["codigo"],
                "nombre": f"{d['nombre']} {d['apellido']}",
                "disponibilidad": d.get("disponibilidad", [])
            }
            for d in docentes
        ]
    }
    
    print("\n⚙️ Generando horario...")
    
    try:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(f"{API_URL}/generar", data=data_bytes, headers=headers_auth, method="POST")
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            print(f"\n✅ Horario generado:")
            print(f"   - Asignados: {result['estadisticas']['total_asignados']}")
            print(f"   - No asignados: {result['estadisticas']['total_no_asignados']}")
            print(f"   - Tiempo: {result['estadisticas']['tiempo_ms']} ms")
            
            if result.get('horario_generado'):
                print("\n📅 Asignaciones:")
                for h in result['horario_generado'][:10]:
                    print(f"   - {h['curso_id']} -> {h['franja']} (Aula: {h['aula_id']})")
            else:
                print("\n⚠️ No se generaron asignaciones")
                
    except urllib.error.HTTPError as e:
        print(f"❌ Error: {e.code}")
        try:
            error_msg = json.loads(e.read().decode('utf-8'))
            print(f"Detalle: {error_msg}")
        except:
            pass
else:
    print("\n⚠️ No hay cursos disponibles para generar horario")