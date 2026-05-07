# D:\TALLER 2\optiacademic\backend\test_matricula.py
import requests

print("="*60)
print("🧪 PROBANDO MATRÍCULA DESDE PYTHON")
print("="*60)

# 1. Login
login = requests.post(
    "http://localhost:8000/api/v1/login",
    data={"username": "estudiante1@uni.edu", "password": "est123"}
)

if login.status_code != 200:
    print(f"❌ Login fallido: {login.status_code}")
    exit()

token = login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("✅ Login exitoso")

# 2. Obtener horarios disponibles
horarios_res = requests.get("http://localhost:8000/api/v1/horarios-disponibles", headers=headers)
horarios = horarios_res.json()

print(f"📅 Horarios disponibles: {len(horarios)}")

if len(horarios) == 0:
    print("❌ No hay horarios disponibles")
    exit()

# 3. Probar matrícula con los primeros 3 IDs
ids_a_matricular = [h["id"] for h in horarios[:3]]
print(f"📋 IDs a matricular: {ids_a_matricular}")

matricula_res = requests.post(
    "http://localhost:8000/api/v1/matricular",
    headers=headers,
    json={"horario_ids": ids_a_matricular}
)

print(f"\n📡 Respuesta: {matricula_res.status_code}")
print(f"📦 Datos: {matricula_res.json() if matricula_res.ok else matricula_res.text}")

if matricula_res.ok:
    print("\n✅ MATRÍCULA EXITOSA DESDE PYTHON")
else:
    print("\n❌ MATRÍCULA FALLIDA")